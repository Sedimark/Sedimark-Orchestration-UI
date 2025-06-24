import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Divider } from '@mui/material';
import {useDispatch} from 'react-redux';
import { faSquarePollHorizontal } from '@fortawesome/free-solid-svg-icons';
import {PIPELINE_METRICS} from "../../../../utils/apiEndpoints";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import style from "./Metrics.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

export default function Plots(props) {

  
  const [isLoading, setIsLoading] = useState(false);
  const [noData, setNoData] = useState(true);
  const [allElements, setAllElements] = useState([]);
  
  const dispatch = useDispatch();
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));
  
  function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }
  
  const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
  ];

  const parseFetchedData = (fetchedData)=>{
    const allData = [];
    Object.entries(fetchedData).forEach(([key,value])=>{
      const newArr = [key, value];
      allData.push(newArr);
    });

    if(allData.length == 0){
      setNoData(true);
      setIsLoading(false);
      return;
    } else {
      setIsLoading(false);
      setNoData(false);
    }

    setAllElements(allData);

  }

  const fetchAndPopulateMetrics = async(pipelineName)=>{
    setIsLoading(true);
    let pipeName = "";
    if(Array.isArray(pipelineName)){
      pipeName = pipelineName[0];
    } else {
      pipeName = pipelineName
    }

    try{
      const resp = await axios.get(PIPELINE_METRICS(pipeName));
      parseFetchedData(resp.data);
      
    } catch(err){
      setIsLoading(false);
      console.log(err);
    }

  }


 useEffect(()=>{
  fetchAndPopulateMetrics(props.pipelineName);
 },[props.pipelineName])


  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="md" fullWidth="md"
        >
            <DialogTitle id="alert-dialog-title">
            {"Metrics "}
            </DialogTitle>
            <DialogContent>
              <Divider/>
            <DialogContentText id="alert-dialog-description">
              
               {isLoading && <div>
                 <div className="loading-circle-container" style={{marginTop:"20px"}}>
                    <div className="loading-circle"></div>
                    <p className="loading-text centered-text">Loading...</p>
                  </div>
               </div> }
               {noData && !isLoading &&
                <div className='no-metrics-container'>
                  <div><FontAwesomeIcon icon={faSquarePollHorizontal} className='no-results-pipeline-manager-icon'/></div>
                  There are no metrics for the pipeline!
                </div>
                }
                {!noData && !isLoading && 
                  <div className='metrics-section'>
                      {allElements.map((element)=>{
                       
                        return(
                        <div className='block-data-container'>
                          <div className='block-name-container'>{element[0]}</div>
                            <div>
                            <TableContainer component={Paper}>
                              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                                <TableHead>
                                  <TableRow>
                                    <StyledTableCell style={{ fontWeight: 'bold', fontSize:"1.2rem" }} >Parameter </StyledTableCell>
                                    <StyledTableCell style={{ fontWeight: 'bold', fontSize:"1.2rem" }} align="right">Value</StyledTableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.entries(element[1]).map(([key,value])=> {

                                    return(
                                      <StyledTableRow key={key}>
                                      <StyledTableCell component="th" scope="row">
                                        {key}
                                      </StyledTableCell>
                                      <StyledTableCell align="right">{value}</StyledTableCell>
                                    </StyledTableRow>
                                    )
                                   
                                })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                            </div>
                            
                        </div>
                       )
                      })}
                  </div>
                }
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={props.handleClose}>Ok</Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

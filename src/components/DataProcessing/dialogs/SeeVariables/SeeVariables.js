import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import toast from 'react-hot-toast';
import {GET_BLOCK_CODE} from "../../../../utils/apiEndpoints";
import { truncateString } from '../../../../utils/truncateString';
import style from "./SeeVariables.css";

export default function SeeVariables(props) {

    const [allVariables, setAllVariables] = useState([]);
    const [blockHasVariables, setBlockHasVariables] = useState(false);
    const [variablesAreLoading, setVariablesAreLoading] = useState(false);
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
          backgroundColor: theme.palette.common.black,
          color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
          fontSize: 14,
        },
      }));

      const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });
      
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
       
      ];

    
    const blockAlert = (msg) => {
        toast.error(msg, {
            duration: 2000,
            position: 'top-right',
        })
    };

    const fetchVariablesForBlock = async(block_name)=>{
      setVariablesAreLoading(true);
        try{
          const resp = await axios.get(GET_BLOCK_CODE(block_name));
          const variables = resp.data.variables;
          
          if(!variables || (Object.keys(variables).length === 0)){
              setBlockHasVariables(false);
          } else {
            setBlockHasVariables(true);
            setAllVariables(variables);
          }
          setVariablesAreLoading(false);
        } catch(err){
          
          blockAlert("There was a problem while fetching the variables!")
          setVariablesAreLoading(false);
          console.log(err);
        }
    }

      useEffect(()=>{
        fetchVariablesForBlock(props.blockName);
      },[props])


  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth = "lg"
            maxWidth = "lg"
        >
            <DialogTitle id="alert-dialog-title">
            {"Block Variables"}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">

              {variablesAreLoading && 
                <div className="loading-circle-container" style={{marginTop:"20px"}}>
                    <div className="loading-circle"></div>
                    <p className="loading-text loading-text-see-variables">Loading...</p>
                 </div>
              }
              {
                blockHasVariables && !variablesAreLoading &&
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700, borderCollapse: 'collapse' }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ fontSize: "1.2rem", fontWeight: "bold", borderBottom:"1px solid #8c8c8c", borderRight: '1px solid #8c8c8c', textAlign:"center" , width: '20%'}}
                          align='left'
                        >
                          Variable Name
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "1.2rem", fontWeight: "bold", borderBottom:"1px solid #8c8c8c" , borderLeft: '1px solid #8c8c8c', borderRight: '1px solid #8c8c8c' , textAlign:"center" , width: '60%' }}
                          align="center"
                        >
                          Description
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: "1.2rem", fontWeight: "bold", borderLeft: '1px solid #8c8c8c', borderBottom: '1px solid #8c8c8c' , textAlign:"center" , width: '20%'}}
                          align="right"
                        >
                          Type
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(allVariables).map(([key,value]) => (
                        <TableRow key={key}>
                          <TableCell sx={{ borderRight: '1px solid #8c8c8c', fontSize:"1.2rem", backgroundColor:"#2d2d2d" , borderTop: '1px solid #8c8c8c' , textAlign:"center", width: '20%' }} align='left'>
                            {key}
                          </TableCell>
                          <TableCell sx={{ borderTop: '1px solid #8c8c8c', fontSize:"1.2rem", backgroundColor:"#2d2d2d" , textAlign:"center", width: '60%'  }} align="center" title={value.description}>
                            {truncateString(value.description,69)}
                          </TableCell>
                          <TableCell sx={{ borderLeft: '1px solid #8c8c8c', fontSize:"1.2rem", backgroundColor:"#2d2d2d" , borderTop: '1px solid #8c8c8c', textAlign:"center", width: '20%' }} align="right">
                            {value.type}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </TableContainer>              
              }

            {
              !variablesAreLoading && !blockHasVariables &&
              <div className='block-no-variables-container'>
                  <p> This block has no variables </p>
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

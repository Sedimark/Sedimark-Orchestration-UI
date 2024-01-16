import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FETCH_MINIO_FILE } from '../../../../utils/apiEndpoints';
import { useSelector } from "react-redux/es/hooks/useSelector";
import axios from 'axios';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function ViewData(props) {

    const selectedPipeline = useSelector((state) => state.selectedPipeline);
    const [allColumnsData, setAllColumnsData] = useState();
    const [columnNames, setColumnNames] = useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });


    const rows = [
        createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
        createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
        createData('Eclair', 262, 16.0, 24, 6.0),
        createData('Cupcake', 305, 3.7, 67, 4.3),
        createData('Gingerbread', 356, 16.0, 49, 3.9),
      ];

    function createData(name, calories, fat, carbs, protein) {
        return { name, calories, fat, carbs, protein };
      }
    

      const parseBucketName = (inputString)=>{
        if (inputString.includes('_')) {
          inputString = inputString.split("_").join("-");
        } 
      
        if (inputString.includes(' ')) {
          inputString =  inputString.split(' ').join("-");
        } 
      
        return inputString;
      }
    
      const fetchAndParseMinioJson = async (bucket_name) => {
        let jsonFileLink;
        let jsonFileData;
   
        try{
            jsonFileLink = await axios.get(FETCH_MINIO_FILE(parseBucketName(bucket_name)));
            jsonFileLink = jsonFileLink.data.url;
        } catch(err){
            console.log(err);
            return;
        }
        
        try{
            jsonFileData = await axios.get(jsonFileLink);
            setAllColumnsData(jsonFileData.data);
            parseAndSetColumnNames(jsonFileData.data);
        } catch(err){
            console.log(err);
        }
      };
    
      
      const parseAndSetColumnNames = (allColumnsData)=>{
        const allColumnNames = [];
        for(const column of allColumnsData){
          allColumnNames.push(column.column_name);
        }
        setColumnNames(allColumnNames);
      } 


      const truncateString = (inputString)=> {
        const maxLength = 15;
      
        if (inputString.length <= maxLength) {
          return inputString;
        } else {
          return inputString.substring(0, maxLength) + '...';
        }
      }
    
      useEffect(()=>{
        fetchAndParseMinioJson(selectedPipeline[0]);
      },[])

      useEffect(()=>{
        if(columnNames.length!=0){
            setIsLoading(false);
        }
      },[columnNames])

      useEffect(()=>{
        console.log(allColumnsData);
      },[allColumnsData])

    return (
        <React.Fragment>
            <ThemeProvider theme={darkTheme}>
                <BootstrapDialog
                    onClose={props.handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={props.open}
                    maxWidth={300}
                    fullWidth={true}
                >
                    <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                        Modal title
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={() => { props.handleClose() }}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogContent dividers>
                        {
                        isLoading &&
                        <div className="loading-circle-container">
                            <div className="loading-circle"></div>
                            
                        </div>
                        }
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        {columnNames.map((colName, index)=>{
                                            return(
                                                <TableCell><p className='truncate-text' title={colName}>{truncateString(colName)}</p></TableCell>
                                            );
                                        })}
                                        
                                        {/* <TableCell align="right">Calories</TableCell> */}
                                        
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/* {rows.map((row) => (
                                        <TableRow
                                            key={row.name}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {row.name}
                                            </TableCell>
                                            <TableCell align="right">{row.calories}</TableCell>
                                            <TableCell align="right">{row.fat}</TableCell>
                                            <TableCell align="right">{row.carbs}</TableCell>
                                            <TableCell align="right">{row.protein}</TableCell>
                                        </TableRow>
                                    ))} */}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={props.handleClose}>
                            Ok
                        </Button>
                    </DialogActions>
                </BootstrapDialog>
            </ThemeProvider>
        </React.Fragment>
    );
}
import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/system';
import Paper from '@mui/material/Paper';
import styles from "./TrainModelDialog.css";
import {useDispatch} from 'react-redux';
import axios from "axios";
import { AllModelsTable } from './AllModelsTable/AllModelsTable';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {ModelDetails} from "./ModelDetails/ModelDetails";
import { GET_ALL_MODELS } from '../../../../utils/apiEndpoints';


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
 

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Model Name', "30/04/2023", 6.0, 24, 4.0),
  createData('Ice cream sandwich', "10/09/2023", 9.0, 37, 4.3),
  createData('Eclair', "10/09/2023", 6.0),
  createData('Cupcake', "10/09/2023",  4.3),
  createData('Gingerbread', "10/09/2023", 3.9),
];



export default function TrainModelDialog(props){

    const [isDataLoading, setIsDataLoading] = React.useState(true);
    const [wasSomethingChanged, setWasSomethingChanged] = React.useState(false);
    const [allModelsData, setAllModelsData] = React.useState([]);
    const [allModelsPage, setModelsPage] = React.useState(true);
    const [modelsDetailsPage, setModelsDetailPage] = React.useState(false);
    const [selectedModelData, setSelectedModelData] = React.useState({});
    
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });
    
    const handleDone = ()=>{      
        props.handleClose();
    }

    const fetchAllModelsAndSet = async()=>{

      try{
        const response = await axios.get(GET_ALL_MODELS);
        setAllModelsData(response.data);
        setIsDataLoading(false);
      } catch(err){
        console.log(err);
        setIsDataLoading(false);
      }
      
   }

   const handleSwitch = ()=>{
     setModelsPage(!allModelsPage);
     setModelsDetailPage(!modelsDetailsPage);
   }

   const truncateString = (inputString, maxLength)=>{
    if (inputString.length <= maxLength) {
      return inputString;
    } else {
      return inputString.slice(0, maxLength) + "...";
    }
  }
  

    useEffect(()=>{
      fetchAllModelsAndSet();
    },[]);


    return ( 
    <div>
      <ThemeProvider theme={darkTheme}>
      <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="xl" fullWidth="true" >
      
          <DialogTitle> Trained Models </DialogTitle>
            <DialogContent sx={{textAlign:'center'}}>   
            <Box sx={{ height: "120%", width: '90%', margin:"auto",borderRadius:"5px" }}  bgcolor="#000" >
            {!isDataLoading && allModelsPage && 
              <>
               
                  <AllModelsTable allModelsData={allModelsData} handleSwitch={handleSwitch} selectModel={setSelectedModelData}></AllModelsTable>
              </>
              } 
              {
                isDataLoading &&
                <div className='data-loading-container'>
                  <div className="loading-circle-container">
                      <div className="loading-circle"></div>
                      <p className="loading-text">Loading...</p>
                  </div>
                </div>
              }
              {
                !isDataLoading && modelsDetailsPage && <ModelDetails handleSwitch={handleSwitch} model_data={selectedModelData} />
              }
              
              </Box>
            </DialogContent>
            <DialogActions>
              
              <Button   onClick={()=>{handleDone()}}>Ok</Button>
            </DialogActions>
        </Dialog>
      </ThemeProvider>
    </div> 
  );
}
import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import styles from "./TrainModelDialog.css";
import {useDispatch} from 'react-redux';
import axios from "axios";
import { AllModelsTable } from './AllModelsTable/AllModelsTable';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {ModelDetails} from "./ModelDetails/ModelDetails";
import { GET_ALL_MODELS, PREDICT_RESULTS_LINK, FETCH_PIPELINE_PREDICT_DATA } from '../../../../utils/apiEndpoints';
import {setIsPredictedSelected} from "../../../../reducers/nodeSlice";
import { setSelectedPipelineNamePrediction, setSelectedPipelinePrediction, setSelectedPipelineName, setSelectedView } from '../../../../reducers/nodeSlice';
import { useSelector } from "react-redux";


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
 

export default function TrainModelDialog(props){

    const selectedTrainedModel = useSelector((state)=> state.selectedTrainedModel);
    const [isDataLoading, setIsDataLoading] = React.useState(true);
    const [allModelsData, setAllModelsData] = React.useState([]);
    const [allModelsPage, setModelsPage] = React.useState(true);
    const [modelsDetailsPage, setModelsDetailPage] = React.useState(false);
    const [selectedModelData, setSelectedModelData] = React.useState({});
    const [isPredSelected, setIsPredSelected] = React.useState(false);
    const dispatch = useDispatch();

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


  const handleCloseDialog = ()=>{
    handleDone();
    
    // dispatch(setIsPredictedSelected(isPredSelected));
    // if(isPredSelected == true){
    //   dispatch(setSelectedPipelineNamePrediction("prediction"));
    //   dispatch(setSelectedPipelinePrediction(["prediction"]));
    // } else {
    //   dispatch(setSelectedPipelineNamePrediction(""));
    //   dispatch(setSelectedPipelinePrediction([]));
    // }
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
               
                  <AllModelsTable allModelsData={allModelsData} handleSwitch={handleSwitch} selectModel={setSelectedModelData} setIsPredSelected={setIsPredSelected}></AllModelsTable>
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
              
              <Button   onClick={()=>{handleCloseDialog();}}>Ok</Button>
            </DialogActions>
        </Dialog>
      </ThemeProvider>
    </div> 
  );
}
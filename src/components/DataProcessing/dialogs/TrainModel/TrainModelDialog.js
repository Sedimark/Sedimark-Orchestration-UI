import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import {useDispatch} from 'react-redux';
import axios from "axios";
import { AllModelsTable } from './AllModelsTable/AllModelsTable';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {ModelDetails} from "./ModelDetails/ModelDetails";
import { GET_ALL_MODELS} from '../../../../utils/apiEndpoints';
import {setSelectedTrainedModel} from "../../../../reducers/nodeSlice";
import { setSelectedPipelineNamePrediction, setSelectedPipelinePrediction, setSelectedTab,} from '../../../../reducers/nodeSlice';
import { useSelector } from "react-redux";
import styles from "./TrainModelDialog.css";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

 

export default function TrainModelDialog(props){

    const selectedTrainedModel = useSelector((state)=> state.selectedTrainedModel);
    const [isDataLoading, setIsDataLoading] = React.useState(true);
    const [allModelsData, setAllModelsData] = React.useState([]);
    const [allModelsPage, setModelsPage] = React.useState(true);
    const [modelsDetailsPage, setModelsDetailPage] = React.useState(false);
    const [selectedModelData, setSelectedModelData] = React.useState({});
    const [isPredSelected, setIsPredSelected] = React.useState(false);
    const [allModelVersions, setAllModelVersions] = React.useState({});
    const [hasError, setHasError] = React.useState(false);
    const [rowName, setRowName] = React.useState("");
    const dispatch = useDispatch();
 
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });
    
    const handleDone = ()=>{     
      
       if(selectedTrainedModel.length !== 0 && rowName.length === 0){
        props.handleClose();
        return;
       }

      if(rowName !== selectedTrainedModel )
     {  
          dispatch(setSelectedTrainedModel(rowName));
          handleChangeSelectedTab();
          setIsPredSelected(true);
         
     } else if (rowName === selectedTrainedModel){
          dispatch(setSelectedTrainedModel(""));
          dispatch(setSelectedPipelinePrediction([]));
          dispatch(setSelectedPipelineNamePrediction(""));
          setIsPredSelected(false);
    } 

      props.handleClose();
    }

    const fetchAllModelsAndSet = async()=>{

      try{
        // const response = await axios.get(GET_ALL_MODELS);

        const response = await axios.get("dasdsadas");
        // setAllModelsData(response.data);
        setIsDataLoading(false);
        setHasError(false);
      } catch(err){
        setHasError(true);
        setIsDataLoading(false);
      }
      
   }


   const handleSwitch = ()=>{
     setModelsPage(!allModelsPage);
     setModelsDetailPage(!modelsDetailsPage);
   }



  const handleCloseDialog = ()=>{      
    handleDone();
  }

  const handleChangeSelectedTab = ()=>{
    dispatch(setSelectedTab({"changed":true, tabSelected:"3"}));
  }
  
    useEffect(()=>{
      fetchAllModelsAndSet();
    },[]);


    return ( 
    <div>
      <ThemeProvider theme={darkTheme}>
      <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="xl" fullWidth={true} >
      
          <DialogTitle> Predict </DialogTitle>
            <DialogContent sx={{textAlign:'center'}}>   
            <Box sx={{ height: "120%", width: '90%', margin:"auto",borderRadius:"5px" }}  bgcolor="#000" >
            {!isDataLoading && allModelsPage && 
              <>
               
                  <AllModelsTable hasError={hasError} isLoading={isDataLoading} setIsDataLoading={setIsDataLoading} setRowName={setRowName} allModelsData={allModelsData} handleSwitch={handleSwitch} selectModel={setSelectedModelData} setIsPredSelected={setIsPredSelected} setAllModelVersions={setAllModelVersions}></AllModelsTable>
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
                !isDataLoading && modelsDetailsPage && <ModelDetails allModelVersions={allModelVersions} handleSwitch={handleSwitch} model_data={selectedModelData} />
              }
              
              </Box>
            </DialogContent>
            <DialogActions>
              
              <Button   onClick={()=>{handleCloseDialog(); }}>Ok</Button>
            </DialogActions>
        </Dialog>
      </ThemeProvider>
    </div> 
  );
}
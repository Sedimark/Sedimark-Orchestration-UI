import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useDispatch, useSelector} from 'react-redux';
import { clearPipelineStreaming, setBrokerEntityId , setPipelinesBlocks, setSelectedPipelineNameStreaming, clearPipelineProcessing, clearPipelineTrain, setMapData, setBlocksVariables,  setSelectedPipelineNamePreprocessing, setSelectedPipelineNameTrain, setSelectedPipelinePrediction, setSelectedPipelineNamePrediction} from "../../../../reducers/nodeSlice";
import { formatString } from '../../../../utils/formatString';

export default function AreYouSure(props) {
 
  const storedVariables = useSelector((state)=>state.blocksVariables);
  const storedPipelineBlocks = useSelector((state)=> state.pipelinesBlocks);
  const [isDialogFromPipelineStudio, setIsDialogFromPipelineStudio] = useState(false);
  const [selectedPipeline,setSelectedPipeline] = useState("");
  const dispatch = useDispatch();
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


  const deleteVariablesForPipeline = ()=>{
    if(props.pipelineName){
      let pipeline;
      if(Array.isArray(props.thePipelineName)) {
        pipeline = props.thePipelineName[0];
      } else {
        pipeline = props.thePipelineName;
      }
      const filteredVariables = [];

      for(const variable of storedVariables){
        if(variable["pipelineName"] !== pipeline){
            filteredVariables.push(variable);
        }
      }
      dispatch(setBlocksVariables(filteredVariables));
    }
  }

  const deleteSelectedPipeline = () => {

    if(props.pipelineType === "training"){
      
      dispatch(clearPipelineTrain());
      dispatch(setSelectedPipelineNameTrain(""));
      props.handleClose();

    } else if(props.pipelineType === "data_preprocessing"){
      dispatch(setSelectedPipelineNamePreprocessing(""));
      dispatch(clearPipelineProcessing());
      props.handleClose();

    } else if(props.pipelineType === "prediction"){
      dispatch(setMapData(""));
      dispatch(setSelectedPipelinePrediction([]));
      dispatch(setSelectedPipelineNamePrediction(""));
      props.handleClose();

    } else if(props.pipelineType === "streaming"){
      dispatch(setMapData(""));
      dispatch(clearPipelineStreaming());
      dispatch(setSelectedPipelineNameStreaming(""));
      props.handleClose();
    }
    deleteVariablesForPipeline();
    
    if(props.additionalSteps){
      props.additionalSteps();
    }

    //aici pe props.pipelineName avem numele la pipeline si vom sterge din redux toate block-urile ce apartin acestui pipeline
    
    let oldPipelineBlocksInfo ;
    let pipelineToCheck = "";
    if(storedPipelineBlocks){
      oldPipelineBlocksInfo = {...storedPipelineBlocks};
      if(Array.isArray(props.pipelineName)){
        pipelineToCheck = props.pipelineName[0];
      } else {
        pipelineToCheck = props.pipelineName
      }

      for(const [key,value] of Object.entries(oldPipelineBlocksInfo)){
        
        if(value === pipelineToCheck){
          delete oldPipelineBlocksInfo[key];
        }
      }
    }

    dispatch(setPipelinesBlocks(oldPipelineBlocksInfo));
    dispatch(setBrokerEntityId(""));
  }

  
 useEffect(()=>{
  setSelectedPipeline(props)

  if(props.pipelineType === "training"){
    if(Array.isArray(props.pipelineName)){
      setSelectedPipeline(props.pipelineName[0]);
    } else {
      setSelectedPipeline(props.pipelineName);
    }
    
  } else if(props.pipelineType === "data_preprocessing"){
    if(Array.isArray(props.pipelineName)){
      setSelectedPipeline(props.pipelineName[0]);
    } else {
      setSelectedPipeline(props.pipelineName);
    }
  } else if(props.pipelineType === "prediction"){
    setSelectedPipeline("prediction");
  } else if (props.pipelineType === "streaming"){
    if(Array.isArray(props.pipelineName)){
      setSelectedPipeline(props.pipelineName[0]);
    } else {
      setSelectedPipeline(props.pipelineName);
    }
  }

  if(props.pipelineStudio === true){
    setIsDialogFromPipelineStudio(true);
  } else {
    setIsDialogFromPipelineStudio(false);
  }
 },[props])


  const handleAction = ()=>{
    if(isDialogFromPipelineStudio){
      props.handler();
    } else if(props.isDialogCustom){
    
      props.handleAction();
    } else {
      deleteSelectedPipeline();
    }

    props.handleClose();
  }

  const getDialogText = ()=>{
    if(isDialogFromPipelineStudio){
      return `Are you sure you want to remove the pipeline from the view?`
    } else if(props.isDialogCustom){
      return `${props.customMessage}`;
    } else {
      return `Are you sure you want to remove ${formatString(selectedPipeline)} from the view?`
    }
  }
 
  

  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
           
        >
            <DialogTitle id="alert-dialog-title">
            {"Are you sure?"}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
               {`${getDialogText()}`}
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={props.handleClose}>No</Button>
            <Button onClick={handleAction} autoFocus>
                Yes
            </Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

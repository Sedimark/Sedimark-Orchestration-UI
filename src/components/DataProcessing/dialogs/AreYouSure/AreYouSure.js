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
import {  clearPipelineProcessing, clearPipelineTrain, setMapData, clearPipeline, setBlocksVariables,  setSelectedPipelineName, setStoredNodes, setSelectedPipelineNamePreprocessing, setSelectedPipelineNameTrain, setSelectedPipelinePrediction, setSelectedPipelineNamePrediction} from "../../../../reducers/nodeSlice";
import { setDatasetColumns } from '../../../../reducers/nodeSlice';
import { formatString } from '../../../../utils/formatString';

export default function AreYouSure(props) {

  const dispatch = useDispatch();
  const selectedPipelineTrain = useSelector((state)=> state.selectedPipelineTrain);
  const selectedPipelineDataPreprocessing = useSelector((state)=> state.selectedPipelineDataPreprocessing);
  const blocksVariables = useSelector((state)=> state.blocksVariables);
  const [selectedPipeline,setSelectedPipeline] = useState("");

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


  const deleteVariablesForPipeline = ()=>{
    console.log("all za variables are:");
    console.log(blocksVariables);
  }

  const deleteSelectedPipeline = () => {

    if(props.pipelineType == "training"){

      dispatch(setDatasetColumns([]));
      dispatch(setSelectedPipelineName(""));
      dispatch(clearPipelineTrain());
      dispatch(setSelectedPipelineNameTrain(""));
      props.handleClose();

    } else if(props.pipelineType == "data_preprocessing"){
      dispatch(setSelectedPipelineNamePreprocessing(""));
      dispatch(clearPipelineProcessing());
      dispatch(setBlocksVariables([]));
      props.handleClose();

    } else if(props.pipelineType == "prediction"){
      dispatch(setMapData(""));
      dispatch(setDatasetColumns([]));
      dispatch(clearPipeline([]));
      dispatch(setBlocksVariables([]));
      dispatch(setSelectedPipelinePrediction([]));
      dispatch(setSelectedPipelineNamePrediction(""));
      props.handleClose();

    }


    if(props.additionalSteps){
      props.additionalSteps();
    }
    
  }

  const selectPipelineNameBasedOnType = ()=>{
    
  }

  useEffect(()=>{
    selectPipelineNameBasedOnType();
  
  },[])

 useEffect(()=>{
  setSelectedPipeline(props)

  if(props.pipelineType == "training"){
    setSelectedPipeline(props.pipelineName);
  } else if(props.pipelineType == "data_preprocessing"){
    setSelectedPipeline(props.pipelineName[0]);
  } else if(props.pipelineType == "prediction"){
    setSelectedPipeline("prediction");
  }
 },[props])


 useEffect(()=>{
  console.log("blockVariables:");
  console.log(blocksVariables);
 },[blocksVariables])
 

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
                Are you sure you want to remove {formatString(selectedPipeline)} from the view?
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={props.handleClose}>No</Button>
            <Button onClick={deleteSelectedPipeline} autoFocus>
                Yes
            </Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

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

  const storedVariables = useSelector((state)=>state.blocksVariables);
  const [selectedPipeline,setSelectedPipeline] = useState("");
  const dispatch = useDispatch();
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


  const deleteVariablesForPipeline = ()=>{
    if(props.pipelineName){
      const pipeline = props.thePipelineName[0];
      console.log(storedVariables);
      const filteredVariables = [];
      for(const variable of storedVariables){
        if(variable["pipelineName"][0] !== pipeline){
            filteredVariables.push(variable);
        }
      }
      dispatch(setBlocksVariables(filteredVariables));
    }
  }

  const deleteSelectedPipeline = () => {

    if(props.pipelineType == "training"){

      dispatch(setSelectedPipelineName(""));
      dispatch(clearPipelineTrain());
      dispatch(setSelectedPipelineNameTrain(""));
      props.handleClose();

    } else if(props.pipelineType == "data_preprocessing"){
      dispatch(setSelectedPipelineNamePreprocessing(""));
      dispatch(clearPipelineProcessing());
      props.handleClose();

    } else if(props.pipelineType == "prediction"){
      dispatch(setMapData(""));
      dispatch(setSelectedPipelinePrediction([]));
      dispatch(setSelectedPipelineNamePrediction(""));
      props.handleClose();

    }
    deleteVariablesForPipeline();
    

    if(props.additionalSteps){
      props.additionalSteps();
    }
    
  }

  
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

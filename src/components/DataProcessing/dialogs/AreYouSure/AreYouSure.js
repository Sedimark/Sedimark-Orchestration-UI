import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useDispatch, useSelector} from 'react-redux';
import {  clearPipelineProcessing, clearPipelineTrain, addPipeline, clearPipeline, setBlocksVariables, setMappedEdges, setMappedNodes, setOrderedNodes, setSelectedPipelineName, setStoredNodes, setSelectedPipelineNamePreprocessing, setSelectedPipelineNameTrain} from "../../../../reducers/nodeSlice";
import { setDatasetColumns, setDatasetInfo } from '../../../../reducers/nodeSlice';
import { formatString } from '../../../../utils/formatString';

export default function AreYouSure(props) {

  const dispatch = useDispatch();
  const selectedPipelineTrain = useSelector((state)=> state.selectedPipelineTrain);
  const selectedPipelineDataPreprocessing = useSelector((state)=> state.selectedPipelineDataPreprocessing);
  const [selectedPipeline,setSelectedPipeline] = useState("");
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


  const deleteSelectedPipeline = () => {

    if(props.pipelineType == "training"){

      dispatch(setDatasetColumns([]));
      dispatch(setDatasetInfo([]));
      dispatch(setMappedEdges([]));
      dispatch(setMappedNodes([]));
      dispatch(setOrderedNodes([]));
      dispatch(clearPipeline([]));
      dispatch(setSelectedPipelineName(""));
      dispatch(setStoredNodes([]));
      dispatch(setBlocksVariables([]));
      dispatch(clearPipelineTrain());
      // the one below are for this specific type of pipeline

      dispatch(setSelectedPipelineNameTrain(""));

      localStorage.clear();
      props.handleClose();

    } else if(props.pipelineType == "data_preprocessing"){

      dispatch(setDatasetColumns([]));
      dispatch(setDatasetInfo([]));
      dispatch(setMappedEdges([]));
      dispatch(setMappedNodes([]));
      dispatch(setOrderedNodes([]));
      dispatch(clearPipeline([]));
      dispatch(setSelectedPipelineName(""));
      dispatch(setStoredNodes([]));
      dispatch(setBlocksVariables([]));
      // the one below are for this specific type of pipeline
      dispatch(setSelectedPipelineNamePreprocessing(""));
      dispatch(clearPipelineProcessing());
      localStorage.clear();
      props.handleClose();

    } else if(props.pipelineType == "predict"){

      dispatch(setDatasetColumns([]));
      dispatch(setDatasetInfo([]));
      dispatch(setMappedEdges([]));
      dispatch(setMappedNodes([]));
      dispatch(setOrderedNodes([]));
      dispatch(clearPipeline([]));
      dispatch(setSelectedPipelineName(""));
      dispatch(setStoredNodes([]));
      dispatch(setBlocksVariables([]));
      localStorage.clear();
      props.handleClose();

    }

    
  }

  const selectPipelineNameBasedOnType = ()=>{
    // if(props.pipelineType == "training"){
    //   setSelectedPipeline(pipe)
    // } else if(props.pipelineType == "data_preprocessing"){

    // } 
  }

  React.useEffect(()=>{
    selectPipelineNameBasedOnType();
  
  },[])

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
                Are you sure you want to remove {formatString(props.pipelineName)} from the view?
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

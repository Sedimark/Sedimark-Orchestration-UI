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
import { clearPipelineStreaming, setPipelinesBlocks, setSelectedPipelineNameStreaming, clearPipelineProcessing, clearPipelineTrain, setMapData, setBlocksVariables,  setSelectedPipelineNamePreprocessing, setSelectedPipelineNameTrain, setSelectedPipelinePrediction, setSelectedPipelineNamePrediction} from "../../../../reducers/nodeSlice";
import { formatString } from '../../../../utils/formatString';

export default function AreYouSureSimple(props) {

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

 

  
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
               {props.dialogText}
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={props.handleClose}>No</Button>
            <Button onClick={()=>{props.handleAction(); props.handleClose()}}>
                Yes
            </Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

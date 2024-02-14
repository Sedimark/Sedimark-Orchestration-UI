import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useDispatch, useSelector} from 'react-redux';
import {addPipeline, clearPipeline, setBlocksVariables, setMappedEdges, setMappedNodes, setOrderedNodes, setSelectedPipelineName, setStoredNodes} from "../../../../reducers/nodeSlice";
import { setDatasetColumns, setDatasetInfo } from '../../../../reducers/nodeSlice';

export default function AreYouSure(props) {

  const dispatch = useDispatch();
  const selectedPipeline = useSelector((state)=> state.selectedPipeline);
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const deleteSelectedPipeline = () => {
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

  React.useEffect(()=>{
    
  },[ ])

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
                Are you sure you want to remove {selectedPipeline} from the view?
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

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import style from "./TemplatesDialog.css";

export default function TemplatesDialog(props) {
 

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
                    maxWidth="md" 
                    fullWidth={true}
                >

                <DialogTitle id="alert-dialog-title">
                    Templates
                    <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  <div className='menu-pipelines'>
                      <div className='menu-pipelines-item'> Data pre-processing <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{props.handleClose(); }}> View </Button> </div>
                      <div className='menu-pipelines-item'> Training  <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{props.handleClose();  }}> View </Button> </div>
                      <div className='menu-pipelines-item'> Predict   <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{props.handleClose(); }}> View </Button> </div>
                      <div className='menu-pipelines-item'> Streaming   <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{props.handleClose(); }}> View </Button> </div>
                  </div>
               
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );

}

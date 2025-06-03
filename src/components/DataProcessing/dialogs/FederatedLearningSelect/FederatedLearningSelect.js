import * as React from 'react';
import { useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from 'react-router-dom';
import style from "./FederatedLearningSelect.css";
 
export default function FederatedLearningSelect(props) {

  const navigate = useNavigate();
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
            fullWidth="md"
            maxWidth="md"
        >
            <DialogTitle id="alert-dialog-title">
           
              <span>Federated Learning</span>
             <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
              
                  <div className='initial-menu-pipeline-manager'>
                    <Button  outlined variant='contained' onClick={()=>{navigate('/shamrock')}} sx={{width:"20%", padding:"10px",  margin:"auto", mt:"10px", mb:"10px" }} className='button-shadow'>  Shamrock 
                    </Button>  
                    <Button  outlined variant='contained' onClick={()=>{navigate()}} sx={{ width:"20%", padding:"10px",margin:"auto", mt:"10px", mb:"10px"}} > Fleviden 
                    </Button>
                  </div>

            </DialogContentText>
            </DialogContent>
            <DialogActions>
            
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

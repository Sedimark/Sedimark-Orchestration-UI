import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import {useDispatch} from 'react-redux';
import style from "./ChangeBlockName.css";

export default function ChangeBlockName(props) {

  const [newBlockName, setNewBlockName] = useState("");
  const [isBlockNameValid, setIsBlockNameValid] = useState(false);

  const dispatch = useDispatch();
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


   const checkBlockNameValidity = ( event)=>{
    const { target: { value } } = event;
        
        const newRegExpRule = new RegExp("^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*$");
        if(newRegExpRule.test(value)){
            setIsBlockNameValid(true);
        } else {
          setIsBlockNameValid(false);
        }
   }

   useEffect(()=>{
    setNewBlockName(props.name);
   },[props]);

 
  return (
    <ThemeProvider theme={darkTheme}>
          <Dialog
          open={props.open}
          onClose={props.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="md"
          fullWidth="md"
        >
            <DialogTitle id="alert-dialog-title">
            {"Change Block Name"}<div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
            </DialogTitle>
              <Divider/>
                <DialogContent>
                    <TextField id="outlined-basic" label="Change Name" variant="outlined" sx={{width:"70%", marginLeft:"15%"}} value={newBlockName} onChange={(evt)=>{setNewBlockName(evt.target.value.toLowerCase()); checkBlockNameValidity(evt) }}/>
                            <div className='block-name-description'>
                                <div className='info-icon-container'>
                                    <FontAwesomeIcon icon={faCircleInfo}/>
                                </div>
                                <div className='variable-description'>  A valid block name can be a single word or multiple words separated by underscores, containing only lowercase letters and numbers, with no spaces </div>
                            </div>
                          
                </DialogContent>
            <DialogActions>
            <Button onClick={()=>{props.handleAction(newBlockName)}} disabled={newBlockName.length === 0 || !isBlockNameValid}>Save</Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

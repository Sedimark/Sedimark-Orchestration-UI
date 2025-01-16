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
import axios from 'axios';
import { RENAME_PIPELINE } from '../../../../utils/apiEndpoints';
import toast from 'react-hot-toast';
import style from "./PipelineEditName.css";

export default function PipelineEditName(props) {

  const [newPipelineName, setNewPipelineName] = useState("");
  const [blockTheSave, setBlockTheSave] = useState(false);
  const [isPipelineNameValid, setisPipelineNameValid] = useState(false);
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
            setisPipelineNameValid(true);
        } else {
          setisPipelineNameValid(false);
        }
   }

   const blockAlert = (msg) => {
    toast.error(msg, {
        duration: 2000,
        position: 'top-right',
    })
};

const blockSuccess = (msg) => {
  toast.success(msg, {
      duration: 2000,
      position: 'top-right',
  })
}; 

   const requestToChangeName = async()=>{
    try{
      const resp = await axios.put(RENAME_PIPELINE,{
        "current_name":props.pipelineCurrentName,
        "new_name":newPipelineName
      });
      setBlockTheSave(true);
      blockSuccess("The pipeline was successfully saved!!")
      setTimeout(()=>{
        props.handleClose();
      },1000)
      
    } catch(err){
      console.log(err);
      blockAlert("There was an error when saving the pipeline name!")
      
    }
   }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && isPipelineNameValid) {
        requestToChangeName();
    }
};

useEffect(()=>{
  setNewPipelineName(props.pipelineCurrentName);
},[props])



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
            {"Change Pipeline Name"}<div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
            </DialogTitle>
              <Divider/>
                <DialogContent>
                    <TextField id="outlined-basic" label="Change Name" onKeyDown={handleKeyDown} variant="outlined" sx={{width:"70%", marginLeft:"15%"}} value={newPipelineName} onChange={(evt)=>{setNewPipelineName(evt.target.value.toLowerCase()); checkBlockNameValidity(evt) }}/>
                            <div className='block-name-description'>
                                <div className='info-icon-container'>
                                    <FontAwesomeIcon icon={faCircleInfo}/>
                                </div>
                                <div className='variable-description'> A valid pipeline name can be a single word or multiple words separated by underscores, containing only lowercase letters and numbers, with no spaces </div>
                            </div>
                          
                </DialogContent>
            <DialogActions>
            <Button onClick={()=>{requestToChangeName()}} handleAction={(name)=>{requestToChangeName(name)}} disabled={newPipelineName.length === 0 || !isPipelineNameValid || blockTheSave}>Save</Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

export default function SelectPipelineType(props) {


  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
  const [selectedVersion, setSelectedVersion] = useState("");
  const [wasChangeMade, setWasChangeMade] = useState(false);
  const [firstRender, setFirstRender] = useState(false);
  const storedSelectedPipelineType = useSelector((state)=> state.pipelineStudioPipelineType);

  const handleChange = (event)=>{
    setWasChangeMade(true)
    setSelectedVersion(event.target.value);
   
  }

  const handleSave = ()=>{
    props.setPipelineType(selectedVersion);
  }

  useEffect(()=>{
    if(!firstRender){
      setFirstRender(false);
      setSelectedVersion(storedSelectedPipelineType);
    }
  },[storedSelectedPipelineType])
  
  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
           
        >
            <DialogTitle id="alert-dialog-title">
           
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
               Please select the type of pipeline you want to create
               <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedVersion}
                  label="Age"
                  onChange={handleChange}
                  sx={{"width":"90%","marginLeft":"5%","marginTop":"10px"}}
                >
                  
                 <MenuItem value={"pre-processing"}>{"pre-processing"}</MenuItem>
                 <MenuItem value={"predict"}>{"predict"}</MenuItem>
                 <MenuItem value={"train"}>{"train"}</MenuItem>
                 <MenuItem value={"streaming"}>{"streaming"}</MenuItem>
                </Select>
               
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={()=>{props.handleClose()}}>Cancel</Button>
            <Button onClick={()=>{props.handleClose(); handleSave()}} disabled={selectedVersion.length === 0 || !wasChangeMade} autoFocus>
                Save
            </Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

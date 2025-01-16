import * as React from 'react';
import { useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import {useDispatch} from 'react-redux';
import {SAVE_TEMPLATE} from "../../../../utils/apiEndpoints";
import TextField from '@mui/material/TextField';
import axios from 'axios';
import toast from 'react-hot-toast';
import style from "./BlockDescription.css"

export default function BlockDescription(props) {

  const [blockDescription, setBlockDescription] = useState("");
  const [numberOfCharacters, setNumberOfCharacters] = useState(0);
  const dispatch = useDispatch();
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

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

 const saveBlockDescription = async()=>{
    
    
    const blockData = props.blockTemplateMetadata;
    blockData.description = blockDescription;

    const blob = new Blob([blockData.code], { type: 'application/octet-stream' });
    const file = new File([blob], 'code.py');
    const formData = new FormData();
    formData.append('code', file);
    if(blockData.block_type === "loader" || blockData.block_type === "exporter"  ){
        formData.append("block_type",`data_${blockData.block_type}`);
    } else {
        formData.append("block_type",blockData.block_type);
    }
    formData.append("language","python");
    formData.append("name",blockData.name);
    formData.append("description",blockData.description);
    formData.append("user_id",blockData.user_id);


    try{
        const resp = await axios.post(SAVE_TEMPLATE,formData,{
            headers: {
                'Content-Type': 'multipart/form-data',
              },
        });
        blockSuccess("The block was succesfully saved as template!");
        setTimeout(()=>{
            props.handleClose();
        },1000)
        
    } catch(err){
        console.log(err);
        blockAlert("There was an error while saving the block as template!");
    }   
    
 }


  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth="lg"
            maxWidth="lg"
        >
            <DialogTitle id="alert-dialog-title">
            {"Enter Block Description"}
            </DialogTitle>
                <Divider></Divider>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <div style={{"width":"100%", "margin":"auto", "display":"flex", "justifyContent":"center", "flexDirection":"column"}}>
                    <TextField id="outlined-basic" label="Block Description" value={blockDescription} onChange={(evt)=>{setBlockDescription(evt.target.value); setNumberOfCharacters(evt.target.value.length)}} variant="outlined" multiline rows={4} sx={{width:"60%", margin:"auto"}} />    
                    <div className='number-of-characters-counter'>{numberOfCharacters}/200</div>
                </div>
                
                
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={props.handleClose}>Cancel</Button>
            <Button onClick={saveBlockDescription} autoFocus  disabled={blockDescription.length === 0 || numberOfCharacters>200} >
                Save
            </Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

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
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {MAGE_SETTINGS} from "../../../../utils/apiEndpoints";
import {useDispatch} from 'react-redux';
import toast from 'react-hot-toast';
import axios from "axios";
import style from "./Settings.css";

export default function Settings(props) {

  const [newBlockName, setNewBlockName] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isBaseUrlValid, setIsBaseUrlValid] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


   const checkBaseUrlValid = ( event)=>{
    const { target: { value } } = event;
    
        const newRegExpRule = new RegExp(
            '^(https?:\\/\\/)?' +                // Optional scheme (http:// or https://)
            '(?:www\\.)?' +                     // Optional 'www.' (non-capturing group)
            '[\\w\\d-]+(?:\\.[\\w\\d-]+)+' +    // Domain and subdomains (e.g., example.com, sub.example.com)
            '(?:\\/[^\\s]*)?' +                 // Optional path (e.g., /overview)
            '(?:\\?[;&a-zA-Z0-9%_.,=+-]*)?' +   // Optional query string (e.g., ?query=123)
            '(?:#[\\w\\d-]*)?$'                 // Optional fragment (e.g., #section)
          );
          

        
        if(newRegExpRule.test(value)){
            return true;
        } else {
            return false;
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

   useEffect(()=>{
    setNewBlockName(props.name);
   },[props]);


   const update = async(payload, input_type)=>{
        
        try{
            const resp = await axios.post(MAGE_SETTINGS, payload);
            if(input_type === "email"){
                setIsEmailValid(false);
                blockSuccess("Email was updated successfully!");
            } else if(input_type === "password"){
                setIsPasswordValid(false);
                blockSuccess("Password was updated successfully!");
            } else if(input_type === "baseUrl"){
                blockSuccess("Base URL was updated successfully!");
                setIsBaseUrlValid(false);
            }

        } catch(err){
            blockAlert("There was an error while updating settings!");
            console.log(err);
           
        }
   }

   const handleKeyDown = (event, input_type)=>{

       
        if(input_type === "email" && event.key === 'Enter' && isEmailValid){
            update({email:email},"email");
        } else if(input_type === "password" && event.key === 'Enter' && isPasswordValid){
            update({password:password},"password");
        } else if(input_type === "baseUrl" && isBaseUrlValid){
            update({base_url:baseUrl},"baseUrl");
        }
   }




   const handleClickShowPassword = ()=>{
    setShowPassword(true);
   }

   const handleMouseDownPassword = ()=>{
    setShowPassword(false);
   }


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
            {"Settings"}<div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
            </DialogTitle>
              <Divider/>
                <DialogContent>
                    <div>Credentials for MageAI </div>
                    <div className='update-element-container'>
                        <TextField id="outlined-basic-1" label="Email" onKeyDown={(evt)=>{handleKeyDown(evt, "email")}} variant="outlined" sx={{width:"70%", marginLeft:"15%"}} value={email} onChange={(evt)=>{setEmail(evt.target.value); if(evt.target.value.length!=0){setIsEmailValid(true)} else {setIsEmailValid(false)}}}/>
                        <Button onClick={()=>{update({email:email},"email")}} disabled={!isEmailValid} variant='contained' sx={{width:"20%", m:"auto", mt:"20px"}}>Save</Button>
                    </div>
                        <Divider/>
                            <div className='update-element-container'>
                                                <TextField
                                    id="outlined-basic-2"
                                    type={showPassword ? 'text' : 'password'}
                                    onKeyDown={(evt) => handleKeyDown(evt, "password")}
                                    label="Password"
                                    variant="outlined"
                                    sx={{ width: "70%", marginLeft: "15%" }}
                                    value={password}
                                    onChange={(evt) => {
                                    setPassword(evt.target.value);
                                    setIsPasswordValid(evt.target.value.length !== 0);
                                    }}
                                    InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                        </InputAdornment>
                                    ),
                                    }}
                                />
                                <Button
                                    onClick={() => update({ password: password }, "password")}
                                    variant='contained'
                                    disabled={!isPasswordValid}
                                    sx={{ width: "20%", m: "auto", mt: "20px" }}
                                >
                                    Save
                                </Button>
                             </div>
                         <Divider/>
                    <div className='update-element-container'>
                        <TextField id="outlined-basic-3" label="Base URL" onKeyDown={(evt)=>{handleKeyDown(evt, "baseUrl")}} placeholder='http://www.my-page.com' variant="outlined" sx={{width:"70%", marginLeft:"15%"}} value={baseUrl} onChange={(evt)=>{setBaseUrl(evt.target.value.toLowerCase()); if(evt.target.value!=0 && checkBaseUrlValid(evt) ){ setIsBaseUrlValid(true)} else {setIsBaseUrlValid(false)} }}/>
                        <Button onClick={()=>{update({base_url:baseUrl},"baseUrl")}} variant='contained' disabled={!isBaseUrlValid} sx={{width:"20%", m:"auto", mt:"20px"}}>Save</Button>
                    </div>   
                </DialogContent>
            <DialogActions>
            
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

import * as React from 'react';
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import { CREATE_FOLDER, GET_MODELS } from '../../../../utils/apiEndpoints';
import { useDispatch, useSelector } from 'react-redux';
import {  faScrewdriverWrench, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import {setShamrockModelName, setShamrockValueIsModified} from "../../../../reducers/nodeSlice";
import toast   from 'react-hot-toast';
import axios from 'axios';
import style from "./ModelUpload.css";


export default function ModelUpload(props) {
 
    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [allModels, setAllModels] = useState([]);
    const [thereWasAnError, setThereWasAnError] = useState(false);
    const [wasSomethingChanged, setWasSomethingChanged] = useState(false);
    const [selectedModelValue, setSelectedModelValue] = useState("");
    const shamrockModelName = useSelector((state)=>state.shamrockModelName);

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;

    const MenuProps = {
      PaperProps: {
        style: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width: 250,
        },
      },
    };

   

    const blockAlert = (msg) => {
      toast.error(msg, {
          duration: 4000,
          position: 'top-right',
      })
  };

    const blockSuccess = (msg) => {
      toast.success(msg, {
          duration: 2000,
          position: 'top-right',
      })
    }; 


       
    const saveModel = async()=>{
        dispatch(setShamrockModelName(selectedModelValue));
        dispatch(setShamrockValueIsModified(true));
        props.handleClose();
    }

    const handleChange = (event)=>{
      const { target: { value } } = event;
      setSelectedModelValue(value);
    }

    
      const fetchAllTheModels = async()=>{
      
        setLoading(true);
        const fullModelsArray = [];

        try{
          const resp = await axios.get(GET_MODELS);
      
          for(const model of resp.data){
            fullModelsArray.push(model.name);
          }
          setLoading(false);
          
        } catch(err){
          setLoading(false);
          setWasSomethingChanged(false);
          setThereWasAnError(true);
          console.log(err);
        }
        setWasSomethingChanged(true);
        setAllModels(fullModelsArray);

    }

    

    useEffect(()=>{
        fetchAllTheModels();
        if(shamrockModelName && shamrockModelName.length!==0){
          setSelectedModelValue(shamrockModelName);
        }
      },[])

  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="sm"
            fullWidth={true}  
        >
            <DialogTitle id="alert-dialog-title">
            {"Model Upload"}
            <div className="close-button-save-pipeline" onClick={()=>{props.handleClose()}}> x </div>
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
             
             {
              loading && !thereWasAnError && 
                 <div className="loading-circle-container" >
                      <div className="loading-circle"></div>
                      <p className="loading-text-graphs">Loading models...</p>
                </div>
             }

             {
              thereWasAnError &&
                <div className='error-container'>
                          <FontAwesomeIcon icon={faCircleExclamation} className='error-icon error-msg-big'/>
                          <p className='error-msg-big'>There was an error while fetching the models.</p>
                          <p className='error-msg-big'>Please try again later!</p>  
                      </div>  

             }


             {allModels.length!==0 && !loading && 
                    <div>
                        <FormControl sx={{ m: 1, width: "90%", pt:"20px", pb:"20px" }}>
                          <InputLabel id="demo-multiple-name-label">Select Model</InputLabel>
                          <Select
                            labelId="demo-multiple-name-label"
                            id="demo-multiple-name"
                            
                            value={selectedModelValue}
                            onChange={(event)=>{setWasSomethingChanged(true); handleChange(event) }}
                            input={<OutlinedInput label="Name" />}
                            MenuProps={MenuProps}
                          >
                            {allModels.map((model) => (
                              <MenuItem
                                key={model}
                                value={model}
                                
                              >
                                {model}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div> 
              }
                   

            </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>{saveModel()}} disabled={!wasSomethingChanged || selectedModelValue.length === 0 }>
                            Save 
                </Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

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
import {GET_PIPELINE_TEMPLATES, POST_TEMPLATE, CREATE_TRIGGER} from "../../../../utils/apiEndpoints";
import {useDispatch} from 'react-redux';
import {addPipelinePreprocessing, setSelectedPipelineNamePreprocessing, setSelectedTab} from "../../../../reducers/nodeSlice";
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from "react-redux/es/hooks/useSelector";
import axios from 'axios';
import style from "./PipelineNameSet.css";

export default function PipelineNameSet(props) {

  const [newPipelineName, setNewPipelineName] = useState("");
  const [pipelineNameValid, setIsPipelineNameValid] = useState(false);
  const [pipelineIsBeingSaved, setPipelineIsBeingSaved] = useState(false);
  const pipelinePreprocessing = useSelector((state)=>state.selectedPipelineDataPreprocessing);

  const dispatch = useDispatch();
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const checkPipelineValidity = ()=>{
    
    const newRegExpRule = new RegExp("^[a-z]+( [a-z]+)*$");

      if(newRegExpRule.test(newPipelineName.toLowerCase())){
          setIsPipelineNameValid(true);
      } else {
          setIsPipelineNameValid(false);
      }

  }

 
  const generatePipeline = async()=>{
    setPipelineIsBeingSaved(true);
    let pipelineTemplates = []; 

    try{
      const resp = await axios.get(GET_PIPELINE_TEMPLATES);
      pipelineTemplates = resp.data;
    } catch (err){
      console.log(err);
      setPipelineIsBeingSaved(false);
      toast.error("There was an error while fetching pipeline templates!", {
        duration: 2000,
        position: 'top-right',
    });
    }



    if(pipelineTemplates.length !== 0 && pipelineTemplates.includes("ngsi_ld")!==-1){
        try{
          const resp = await axios.post(POST_TEMPLATE,{
            pipeline_name: newPipelineName,
            template_uuid: "ngsi_ld"
          });
        }  catch(err){
          console.log(err);
          setPipelineIsBeingSaved(false);
          toast.error("There was a problem while saving the pipeline!", {
            duration: 2000,
            position: 'top-right',
        });
        }
    } else {
      //erroare
      setPipelineIsBeingSaved(false);
      toast.error("There are no templates available!", {
        duration: 2000,
        position: 'top-right',
    });
    }

    //here we need to create a trigger

    const newDate = Date.now();
    const formattedPipelineName = newPipelineName.split(" ").join("_");

    try{
      const response = await axios.post(CREATE_TRIGGER,{
          name: formattedPipelineName,
          trigger_type:"api",
          interval:"",
          start_time:newDate,
      });
      
  } catch(err){
    
      console.log(err);
      toast.error("There was an error when creating a trigger for the pipeline!", {
        duration: 2000,
        position: 'top-right',
     });
  
    return ;
  }

    toast.success("Pipeline was succesfully created!", {
        duration: 2000,
        position: 'top-right',
    });

    dispatch(addPipelinePreprocessing(formattedPipelineName));
    dispatch(setSelectedPipelineNamePreprocessing(formattedPipelineName));
    dispatch(setSelectedTab({"changed":true, tabSelected:"1"}));
    props.handleClose();

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
            {"Set Pipeline Name"}<div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
            </DialogTitle>
              <Divider/>
                <DialogContent>
                    <TextField id="outlined-basic" error={!pipelineNameValid} label="Set Name" variant="outlined" sx={{width:"70%", marginLeft:"15%"}} value={newPipelineName} onChange={(evt)=>{ setPipelineIsBeingSaved(false); setNewPipelineName(evt.target.value.toLowerCase()); checkPipelineValidity();}}/>
                            <div className='block-name-description'>
                                <div className='info-icon-container'>
                                    <FontAwesomeIcon icon={faCircleInfo}/>
                                </div>
                                <div className='variable-description'>  Pipeline name can only contain lowercase letters and spaces!  </div>
                            </div>
                          
                </DialogContent>
            <DialogActions>
            <Button onClick={()=>{generatePipeline()}} disabled={newPipelineName.length === 0 || !pipelineNameValid || pipelineIsBeingSaved || pipelineIsBeingSaved}>Save</Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

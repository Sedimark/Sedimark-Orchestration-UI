import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {GET_PIPELINE_TEMPLATES} from "../../../../utils/apiEndpoints";
import { faBoxOpen, faArrowLeft,faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextField } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import style from "./TemplatesDialog.css";


export default function TemplatesDialog(props) {
 

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const navigate = useNavigate();
  const [allTemplates, setAllTemplates] = useState([]);
  const [allTemplatesList, setAllTemplatesList] = useState(false);
  const [nextStepVisible, setNextStepVisible] = useState(false);
  const [selectedPipelineTemplate, setSelectedPipelineTemplate] = useState({});
  const [loading, setLoading] = useState(true);
  const [pipelineNameSetView, setPipelineNameSetView] = useState(false);
  const [pipelineName, setPipelineName] = useState("");
  const [pipelineNameValid, setIsPipelineNameValid] = useState(false);
  const [firstPipelineTry, setFirstPipelineTry] = useState(false);

  const blockAlert = (msg) => {
      toast.error(msg, {
          duration: 2000,
          position: 'top-right',
      })
  };
  

  const fetchPipelineTemplates = async(template_type)=>{
    try{
      const resp = await axios.get(GET_PIPELINE_TEMPLATES(template_type));    
      setAllTemplates(resp.data);
      // setLoading(false);
    } catch(err){
      // setLoading(false);
      console.log(err);
      blockAlert("There was an error while fetching the templates!");
    }
  }

  const checkPipelineValidity = ()=>{
    
    const newRegExpRule = new RegExp("^[a-z]+( [a-z]+)*$");

      if(newRegExpRule.test(pipelineName.toLowerCase().trim())){
          setIsPipelineNameValid(true);
      } else {
          setIsPipelineNameValid(false);
      }

  }

  const createPipeline = ()=>{
    //this application will create the pipeline
    // so from template a pipeline will be created and will be spawn on the UI
    /*
      Tasks
        1. Make the third menu where the user can see the steps that are taking place to create and render 
        the pipeline
        2. Make a request to create the pipeline from the template
        3. Render the pipeline on the user interface
    */
  }
 
  const handleBack = ()=>{
    if(pipelineNameSetView){
      setNextStepVisible(true);
      setPipelineNameSetView(false);
    } else {
      setAllTemplatesList(false);
      setNextStepVisible(false);
      setAllTemplates([]);
      setLoading(true);
      setSelectedPipelineTemplate({}) 
    }
    
  }
 
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
                   {allTemplatesList ? <span><FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{handleBack()}} className="left-icon-studio"/></span> : <span>Templates</span>} 
                    <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
                </DialogTitle>
                <DialogContent>
                 
                <DialogContentText id="alert-dialog-description">
                  
                  {
                    pipelineNameSetView ?
                    <div className='menu-pipelines'>
                      <div className='pipeline-set-name-container'>
                          <TextField
                            label="Pipeline Name"
                            variant="outlined"
                            value={pipelineName}
                            error={!pipelineNameValid && !firstPipelineTry}
                            sx={{ width: '600px', marginLeft:"15%" }}  // Set width here
                            onChange={(e) => {setFirstPipelineTry(false); setPipelineName(e.target.value); checkPipelineValidity();}}
                          />
                           <div className='block-name-description'>
                                <div className='info-icon-container'>
                                    <FontAwesomeIcon icon={faCircleInfo}/>
                                </div>
                                <div className='variable-description'>  Pipeline name can only contain lowercase letters and spaces!  </div>
                            </div>
                      </div>                  
                    </div>
                      :
                      <>
                                {
                                    allTemplatesList ?
                                      <div className='menu-pipelines'>
                                        {
                                          loading && allTemplates.length === 0 &&
                                          <div className="" >
                                            <div className=""></div>
                                            <p className="">Loading...</p>
                                          </div>
                                        }
                                        {(allTemplates.length == 0 && !loading) ?
                                            <div>
                                                <FontAwesomeIcon icon={faBoxOpen}  className="no-templates-icon"/>
                                                <div className='no-templates-message'>There are no templates available!</div>
                                            </div>
                                            :
                                            <div className="pipeline-templates-container">
                                              {allTemplates.map((temp)=>{
                                                
                                                return (<div>
                                                            <div className='catalog-pipeline-container'>
                                                              <div className='catalog-block-container-data-loader-title' title={`template`}>
                                                                  {temp.name}
                                                              </div>
                                                                <FontAwesomeIcon icon={faCircleInfo}  className=""/> 
                                                              <div>
                                                                {JSON.parse(temp.details)["desc"]}
                                                              </div>
                                                            </div>
                                                            <Checkbox edge="end"  sx={{
                                                            color: "#e0e9ff",
                                                            '&.Mui-checked': {
                                                              color: "#e0e9ff",
                                                            },
                                                          }} 
                                                            onChange = {()=>{ if(selectedPipelineTemplate === temp) {setSelectedPipelineTemplate({})} else {setSelectedPipelineTemplate(temp)} }}
                                                            checked = {selectedPipelineTemplate === temp}
                                                          />
                                                          </div>)
                
                                              })}
                                            </div>
                                        }
                                      </div>
                                    :
                                    <div className='menu-pipelines'>
                                      <div className='menu-pipelines-item'> Data models <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{ fetchPipelineTemplates("data_models");  setAllTemplatesList(true); setNextStepVisible(true);  }}> View </Button> </div>
                                      <div className='menu-pipelines-item'> Federated Learning  <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{ fetchPipelineTemplates("federated_learning"); setAllTemplatesList(true); setNextStepVisible(true); }}> View </Button> </div>
                                    </div>
                                }
                      
                      </>
                         
                  }
               
                  
               
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                  { nextStepVisible && <Button onClick={()=>{setNextStepVisible(false); setPipelineNameSetView(true)}} disabled={Object.keys(selectedPipelineTemplate).length === 0}> Next </Button>}
                  { pipelineNameSetView && <Button onClick={()=>{createPipeline()}} disabled={!pipelineNameValid || pipelineName.length === 0 }> Generate </Button> }
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );

}

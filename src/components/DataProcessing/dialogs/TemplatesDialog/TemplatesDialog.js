import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {GET_PIPELINE_TEMPLATES, FETCH_PIPELINES, POST_TEMPLATE } from "../../../../utils/apiEndpoints";
import { faBoxOpen, faArrowLeft,faCircleInfo, faCircleXmark,faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';
import {useDispatch} from 'react-redux';
import {setTabIndex} from "../../../../reducers/nodeSlice";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from "react-redux/es/hooks/useSelector";
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
    const dispatch = useDispatch();
  const storedVariables = useSelector((state)=>state.blocksVariables);
  const tabIndexStored = useSelector((state)=> state.tabIndex);
  const [allTemplates, setAllTemplates] = useState([]);
  const [allTemplatesList, setAllTemplatesList] = useState(false);
  const [nextStepVisible, setNextStepVisible] = useState(false);
  const [selectedPipelineTemplate, setSelectedPipelineTemplate] = useState({});
  const [loading, setLoading] = useState(true);
  const [pipelineNameSetView, setPipelineNameSetView] = useState(false);
  const [pipelineName, setPipelineName] = useState("");
  const [pipelineNameValid, setIsPipelineNameValid] = useState(false);
  const [firstPipelineTry, setFirstPipelineTry] = useState(true);
  const [thereWasAnError, setThereWasAnError] = useState(false);
  const [allPipelines, setAllPipelines] = useState([]);
  const [closeBtnDisplayed, setCloseBtnDisplayed] = useState(false);
  const [lastMenuDisplayed, setLastMenuDisplayed] = useState(false);
  const [pipelineBeingCreated, setPipelineBeingCreated] = useState(false);
  const [pipelineCreationDone, setPipelineCreationDone] = useState(false);
  const [pipelineCreationError, setPipelineCreationError] = useState(false);
  const allTabs = useSelector((state)=> state.allTabs);

  const blockAlert = (msg) => {
      toast.error(msg, {
          duration: 2000,
          position: 'top-right',
      })
  };
  

  const fetchPipelineTemplates = async(template_type)=>{

    try{
      const resp = await axios.get(GET_PIPELINE_TEMPLATES(template_type));    
      setAllPipelines(resp.data.map((pipe)=>pipe.name));
      setLoading(false);
    } catch(err){
      setLoading(false);
      setThereWasAnError(true); 
      console.log(err);
      blockAlert("Error!");
      return;
    }
    
    try{
      const resp = await axios.get(GET_PIPELINE_TEMPLATES(template_type));    
      setAllTemplates(resp.data);
      setLoading(false);
    } catch(err){
      setLoading(false);
      setThereWasAnError(true);
      console.log(err);
      blockAlert("Error!");
    }
  }

  const checkPipelineValidity = (pipelineName)=>{
    
    const newRegExpRule = new RegExp("^[a-z]+( [a-z]+)*$");
      
      if(allPipelines.find(pip => pip === pipelineName.split(" ").join("_"))){
        setIsPipelineNameValid(false);
        blockAlert("This pipeline already exists!");
        return;
      }

      if(newRegExpRule.test(pipelineName.toLowerCase().trim())){
          setIsPipelineNameValid(true);
      } else {
          setIsPipelineNameValid(false);
      }

  }

  const loadInTheUI = (pipeline)=>{

    const filteredVariables = [];  

    for(const variable of storedVariables){
      if( variable["pipelineName"] && variable["pipelineName"][0] !== pipeline){
          filteredVariables.push(variable);
      }
    }

    let newTabs = [];

    if(allTabs){
      newTabs = [...allTabs];
    }

     let newTabName;
      if(!tabIndexStored || tabIndexStored.length == 0){
        newTabName = `Tab 1`;
        dispatch(setTabIndex([1]));
        newTabs.push({
          "name":newTabName,
          "pipelineName": pipeline,
          "pipelineType": selectedPipelineTemplate,
          "tabOrder":1
        });

      } else {
        newTabName = `Tab ${tabIndexStored[tabIndexStored.length-1]+1}`;
        newTabs.push({
          "name":newTabName,
          "pipelineName": pipeline,
          "pipelineType": selectedPipelineTemplate,
          "tabOrder":tabIndexStored[tabIndexStored.length-1]+1
        });
        const newTabArr = [...tabIndexStored];
        newTabArr.push(tabIndexStored[tabIndexStored.length-1]+1);
        dispatch(setTabIndex(newTabArr));
      } 

    setPipelineBeingCreated(false);
    setPipelineCreationDone(true);
  }

  const createPipeline = async()=>{
    //this application will create the pipeline
    // so from template a pipeline will be created and will be spawn on the UI
    /*
      Tasks
        2. Make a request to create the pipeline from the template
        3. Render the pipeline on the user interface
    */
      setPipelineBeingCreated(true);
        try{
          const resp = await axios.post(POST_TEMPLATE,{
            "pipeline_name":pipelineName,
            "template_uuid":selectedPipelineTemplate.name
          });

          loadInTheUI(pipelineName);

        } catch(err){
          setPipelineCreationError(true);
          blockAlert("Error!");
        }

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
                    <
                    Dialog
                    open={props.open}
                    onClose={props.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description" 
                    maxWidth="md" 
                    fullWidth={true}
                  >
 
                <DialogTitle id="alert-dialog-title">
                   {allTemplatesList ? <> {!lastMenuDisplayed && <span><FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{handleBack()}} className="left-icon-studio"/></span>} </>  : <span>Templates</span>} 
                    <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
                </DialogTitle>
                <DialogContent>
                 
                <DialogContentText id="alert-dialog-description">
                  
                 {
                      lastMenuDisplayed &&
                      <div className='menu-pipelines'>

                        {
                          pipelineBeingCreated && 

                            <div class="pipeline-wrapper">
                                <h1 class="title">🚧 Building the pipeline</h1>
                                  <div className="loading-circle-container" style={{marginTop:"20px"}}>
                                    <div className="loading-circle"></div>
                                    <p className="loading-text">Loading...</p>
                                  </div>
                              </div>

                          }

                        {
                          pipelineCreationError && 

                             <div className='error-container'>
                                <FontAwesomeIcon icon={faScrewdriverWrench} className='error-icon error-msg-big'/>
                                <p className='error-msg-big'>There was an error while generating the pipeline!</p> 
                            </div>  

                        }
                          
                          
                      </div>
                  }

                  {
                   !lastMenuDisplayed && ( pipelineNameSetView ?
                    <div className='menu-pipelines'>
                      <div className='pipeline-set-name-container'>
                          <TextField
                            label="Pipeline Name"
                            variant="outlined"
                            value={pipelineName}
                            error={!pipelineNameValid && !firstPipelineTry}
                            sx={{ width: '600px', marginLeft:"15%", marginTop:"20px" }}  // Set width here
                            onChange={(e) => {setFirstPipelineTry(false); setPipelineName(e.target.value); checkPipelineValidity(e.target.value);}}
                          />
                           <div className='block-name-description'>
                                <div className='info-icon-container'>
                                    <FontAwesomeIcon icon={faCircleInfo}/>
                                </div>
                                <div className='variable-description' style={{"paddingRight":"10px", "paddingBottom":"10px"}} >  Pipeline name can only contain lowercase letters and spaces, and must be at least 2 characters long!  </div>
                            </div>
                      </div>                  
                    </div>
                      :
                      <>
                                {
                                    allTemplatesList ?
                                      <div className='menu-pipelines'>
                                        {
                                          (loading && allTemplates.length === 0 && !thereWasAnError) &&
                                          <div className="" >
                                            <div className=""></div>
                                            <p className="">Loading...</p>
                                          </div>
                                        }
                                        {
                                            thereWasAnError && 
                                          
                                            <div className='error-pipeline-templates'>
                                                <FontAwesomeIcon icon={faCircleXmark} className='error-icon'/>
                                                <p>There was an error while loading the pipeline templates</p>
                                                <p>Please try again later!</p>  
                                            </div>
                                        }
                                        {(allTemplates.length == 0 && !loading && !thereWasAnError) ?
                                            <div>
                                                <FontAwesomeIcon icon={faBoxOpen}  className="no-templates-icon"/>
                                                <div className='no-templates-message'>There are no templates available!</div>
                                            </div>
                                            :
                                            <div className={`pipeline-templates-container ${(allTemplates.length!==0 && !loading && !thereWasAnError)? "expanded":""}`}>
                                              {allTemplates.map((temp)=>{
                                                    
                                                return (<div>
                                                            <div className='catalog-pipeline-container'>
                                                              <div className='catalog-block-container-data-loader-title' title={`template`}>
                                                                  {temp.name}
                                                              </div>
                                                                <FontAwesomeIcon icon={faCircleInfo}  className=""/> 
                                                              <div>
                                                                {JSON.parse(temp.details)["descr"]}
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
                                      <div className='menu-pipelines-item'> Data models <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{ fetchPipelineTemplates("data_models");  setAllTemplatesList(true); setNextStepVisible(true); setThereWasAnError(false); }}> View </Button> </div>
                                      <div className='menu-pipelines-item'> Federated Learning  <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{ fetchPipelineTemplates("federated_learning"); setAllTemplatesList(true); setNextStepVisible(true); setThereWasAnError(false); }}> View </Button> </div>
                                    </div>
                                }
                      </>
                   ) 
                  }

                </DialogContentText>
                </DialogContent>
                <DialogActions>
                  { nextStepVisible && <Button onClick={()=>{setNextStepVisible(false); setPipelineNameSetView(true)}} disabled={Object.keys(selectedPipelineTemplate).length === 0}> Next </Button>}
                  { pipelineNameSetView && <Button onClick={()=>{setLastMenuDisplayed(true); setCloseBtnDisplayed(true); setPipelineNameSetView(false); createPipeline()}} disabled={!pipelineNameValid || pipelineName.length === 0 }> Generate </Button> }
                  { closeBtnDisplayed && <Button onClick={()=>{props.handleClose()}}> Done </Button> }
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );

}
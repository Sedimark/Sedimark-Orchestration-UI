import * as React from 'react';
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
import Checkbox from '@mui/material/Checkbox';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import style from "./AssetManager.css";
import { useEdges } from 'reactflow';
import { load } from 'js-yaml';

export default function AssetManager(props) {
 

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const navigate = useNavigate();
  const [allTemplates, setAllTemplates] = React.useState([]);
  const [allTemplatesList, setAllTemplatesList] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

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
                   {allTemplatesList ? <span><FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{setAllTemplatesList(false); setAllTemplates([]); setLoading(true)}} className="left-icon-studio"/></span> : <span>Asset Manager</span>} 
                    <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
                </DialogTitle>
                <DialogContent>
                 
                <DialogContentText id="alert-dialog-description">
                {
                    allTemplatesList ?
                      <div className='menu-pipelines'>
                        {
                          loading && 
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
                                console.log(temp);
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
                                            onChange = {()=>{}}
                                            checked = {false}
                                          />
                                          </div>)

                              })}
                            </div>
                        }
                      </div>
                    :
                    <div className='menu-pipelines'>
                        <div className='menu-pipelines-item'> Weather Information <div><Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{fetchPipelineTemplates("data_models"); setAllTemplatesList(true)}}> Asset Details </Button>  <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{fetchPipelineTemplates("data_models"); setAllTemplatesList(true)}}> View Pipeline </Button></div></div>
                        <div className='menu-pipelines-item'> Bike Traffic <div><Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{fetchPipelineTemplates("data_models"); setAllTemplatesList(true)}}> Asset Details </Button>  <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{fetchPipelineTemplates("data_models"); setAllTemplatesList(true)}}> View Pipeline </Button></div></div>
                    </div>
                }
                  
               
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );

}

import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper'; 
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ImportPipelineZip from '../ImportPipelineZIP/ImportPipelineZIP';
import { faCodeBranch, faScrewdriverWrench,faSquarePollHorizontal, faFile } from '@fortawesome/free-solid-svg-icons';
import { Typography } from '@mui/material';
import { formatString } from '../../../../utils/formatString';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {FETCH_PIPELINES, DELETE_PIPELINE, FETCH_ALL_PIPELINES} from "../../../../utils/apiEndpoints";
import axios from "axios";
import style from "./ChangePipelineName.css";
import PipelineEditName from '../PipelineEditName/PipelineEditName';

export default function ChangePipelineName(props) {
 
  const [searchedString, setSearchedString] = React.useState("");
  const [filteredPipelines,setfilteredPipelines] = React.useState([]);
  const [allPipelines, setAllPipelines] = React.useState([
    "anomaly_annotator",
    "ml_flow_lightgbm",
    "ml_flow_ludwig",
    "rabbit_mq_streaming"
]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedPipeline,setSelectedPipeline] = React.useState("");
  const [onlyOneOptionSelected, setOnlyOneOptionSelected] = React.useState(false);
  const [foundPipeline, setFoundPipeline] = useState(true);
  const [checked, setChecked] = useState([]);
  const [pipelinesToDelete, setPipelinesToDelete] = useState([]);
  const [hasError, setHasError] = React.useState(false);
  const [pipeline, setPipeline] = React.useState("");
  const [pipelineEditNameOpen, setPipelineEditNameOpen] = React.useState(false);
  const [pipelineNameToChange, setPipelineNameToChange] = React.useState("");

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const searchListByDatasetName = (list, str)=> {
    const filteredList = list.filter(item => {
      const searchStr = str.toLowerCase();
      const datasetName = item.toLowerCase();
  
      return datasetName.includes(searchStr);
    });
  
    return filteredList;
  }

  const updateSearch = (evt)=>{
    setSearchedString(evt.target.value);
    const updatedPipelines = searchListByDatasetName(allPipelines,evt.target.value);
    setfilteredPipelines(updatedPipelines);
  }

  const fetchAllThePipelines = async()=>{
    let finalPipelineArray = [];
    setIsLoading(true);
    try{
      const resp = await axios.get(FETCH_ALL_PIPELINES);
      finalPipelineArray = [...finalPipelineArray, ...resp.data];
      setHasError(false);
    } catch(err){
      setIsLoading(false);
      setHasError(true);
    }
    

    setIsLoading(false);
    setAllPipelines(finalPipelineArray);
    setfilteredPipelines(finalPipelineArray);

  }


  useEffect(()=>{
    fetchAllThePipelines();

  },[])


  const refreshPipelines = async()=>{
    fetchAllThePipelines();
  }
 
  return (  
               <div>
                <Paper
                  component="form"
                  onSubmit={(evt)=>{evt.preventDefault()}}
                  sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: "100%" }}
              >
                  <IconButton sx={{ p: '10px' }} aria-label="menu">
                  <MenuIcon />
                  </IconButton>
                  <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search Pipeline"
                  inputProps={{ 'aria-label': 'search google maps' }}
                  onChange={(evt)=>{updateSearch(evt)}}
                  />
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                  <IconButton onClick={()=>{}} type="button" sx={{ p: '10px' }} aria-label="search">
                  <SearchIcon />
                  </IconButton> 
                    </Paper>
                    <List dense sx={{ 
                        width: '100%', 
                        bgcolor: 'background.paper', 
                        marginTop: "10px", 
                        borderRadius: "3px", 
                        height: "500px", 
                        overflowY: "scroll",
                        // Scrollbar styling
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(128, 128, 128, 0.3)',
                          borderRadius: '10px',
                          '&:hover': {
                            background: 'rgba(128, 128, 128, 0.5)',
                          },
                        },
                        // Firefox
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(128, 128, 128, 0.3) rgba(0, 0, 0, 0.1)',
                      }}>
                        <ListItem
                            key={"my-key"}
                            secondaryAction={
                                <div className='dataset-select-toolbox'>
                                <p>Select</p>
                                
                                </div>
                            }
                            disablePadding
                            sx={{
                            padding:"15px",
                            pointerEvents:"none"
                            }}
                            >
                            <ListItemButton>
                                
                                <ListItemText  id={'fd3432'}  disableTypography
                                primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>Pipeline Name</Typography>} />
                            </ListItemButton>
                            </ListItem>
                        {
                        isLoading &&
                        <div className="loading-circle-container">
                            <div className="loading-circle"></div>
                            <p className="loading-text delete-pipeline-loading-text">Loading...</p>
                        </div>
                        }
                        { !isLoading && allPipelines.length!=0 && 
                            
                        <>
                            {
                                filteredPipelines.map((value) => {
                                    const labelId = `checkbox-list-secondary-label-${value.name}`;
                                
                                    return (
                                    <ListItem
                                        key={value.name}
                                        secondaryAction={
                                        <div className='dataset-select-toolbox'>
                                        
                                            <Button outlined variant='contained'
                                             onClick={()=>{setPipelineNameToChange(value.name); setPipelineEditNameOpen(true)}}>Change Name</Button>
                                        </div>
                                        }
                                        disablePadding
                                    > 
                                        <ListItemButton onClick={()=>{ 
                                            const currentIndex = checked.indexOf(value.name);
                                            const newChecked = [...checked];
                                            
                                            if (currentIndex === -1) {
                                                newChecked.push(value.name);
                                            } else {
                                                newChecked.splice(currentIndex, 1);
                                            }

                                            setChecked(newChecked);
                                        }}>
                                        <ListItemAvatar>
                                            <p className='select-dialog-list'><FontAwesomeIcon icon={faCodeBranch}/></p> 
                                        </ListItemAvatar>
                                        <ListItemText  id={labelId}  disableTypography
                                        primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>{formatString(value.name)}</Typography>} />
                                        </ListItemButton>
                                    </ListItem>
                                    );
                                    
                                })
                            
                            }
                        </>
                          
                        }
                        {
                          !isLoading && !hasError && allPipelines.length!=0 && filteredPipelines == 0 &&
                         <div className="no-results-pipeline-manager">
                            <FontAwesomeIcon icon={faFile} className='no-results-pipeline-manager-icon'/> 
                            <p> No results </p>
                        </div>
                        }
                        {hasError &&
                            <div className="no-result-container pipeline-manager-error">
                                <FontAwesomeIcon icon={faScrewdriverWrench} className='empty-node-container' /> 
                                <p> We have encountered an error! Please try again later</p>
                            </div>
                        }

                      {
                        !isLoading && !hasError && allPipelines.length === 0 &&
                        <div className="no-results-pipeline-manager">
                            <FontAwesomeIcon icon={faSquarePollHorizontal} className='no-results-pipeline-manager-icon'/> 
                            <p> There are no pipelines </p>
                        </div>
                      }
                 
                    </List>
                {pipelineEditNameOpen && <PipelineEditName open={pipelineEditNameOpen} pipelineCurrentName={pipelineNameToChange} handleClose={()=>{setPipelineEditNameOpen(false); refreshPipelines()}} />}
               </div>        
    );

}

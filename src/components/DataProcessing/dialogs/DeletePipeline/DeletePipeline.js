import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { createTheme } from '@mui/material/styles';
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
import toast from 'react-hot-toast';
import Checkbox from '@mui/material/Checkbox';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { faCodeBranch, faScrewdriverWrench, faSquarePollHorizontal, faFile } from '@fortawesome/free-solid-svg-icons';
import { Typography } from '@mui/material';
import { formatString } from '../../../../utils/formatString';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {FETCH_PIPELINES, DELETE_PIPELINE, DELETE_FILES_MAGE} from "../../../../utils/apiEndpoints";
import AreYouSure from '../AreYouSure/AreYouSure';
import axios from "axios";
import style from "./DeletePipeline.css";
import { setSelectedPipelineNamePreprocessing, clearPipelineProcessing, clearPipelineTrain, setSelectedPipelineNameTrain, setMapData, clearPipelineStreaming, setSelectedPipelineNameStreaming } from '../../../../reducers/nodeSlice';
import { FETCH_ALL_PIPELINES } from '../../../../utils/apiEndpoints';
import { useDispatch, useSelector } from 'react-redux';


export default function DeletePipeline(props) {
  
  const dispatch = useDispatch(); 
  const preprocessingPipeline = useSelector((state)=> state.selectedPipelineDataPreprocessing);
  const trainingPipeline = useSelector((state)=> state.selectedPipelineTrain);
  const streamingPipeline = useSelector((state)=> state.selectedPipelineStreaming);
  const [searchedString, setSearchedString] = React.useState("");
  const [areYouSureOpen, setAreYouSureOpen] = React.useState(false);
  const [filteredPipelines,setfilteredPipelines] = React.useState([]);
  const [streamingPipelines, setStreamingPipelines] = React.useState([]);
  const [allPipelines, setAllPipelines] = React.useState([]);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [checked, setChecked] = useState([]);
  const [hasError, setHasError] = React.useState(false);
  

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
      
      try{
        const resp = await axios.get(FETCH_PIPELINES("streaming"));
        setStreamingPipelines(resp.data);
      } catch(err){
        setIsLoading(false);
        setHasError(true);
        setIsDeleting(false);
      }

      setIsLoading(false);
      setAllPipelines(finalPipelineArray);
      setfilteredPipelines(finalPipelineArray);
      setIsDeleting(false);
  }


  useEffect(()=>{
    fetchAllThePipelines();
  },[])

  const handleToggle = (value) => () => {
   
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
  
    setChecked(newChecked);
  };

  const blockAlert = (msg) => {
    toast.error(msg, {
        duration: 2000,
        position: 'top-right',
    })
};

  const deletePipelineFromView = (pipelineToDelete)=>{
    if(preprocessingPipeline[0] === pipelineToDelete){
       dispatch(setSelectedPipelineNamePreprocessing(""));
       dispatch(clearPipelineProcessing());
    } else if(trainingPipeline[0] === pipelineToDelete){
        dispatch(clearPipelineTrain());
        dispatch(setSelectedPipelineNameTrain(""));
    } else if (streamingPipeline[0] === pipelineToDelete){
        dispatch(setMapData(""));
        dispatch(clearPipelineStreaming());
        dispatch(setSelectedPipelineNameStreaming(""));
    }
  }

  const deletePipeline = async()=>{
    
    setIsLoading(true);
    setIsDeleting(true);
    for(const pipeline of checked){

      try{
        const resp = await axios.delete(DELETE_PIPELINE(pipeline));
        if(streamingPipelines.includes(pipeline)){
          const resp = await axios.delete(DELETE_FILES_MAGE, {
            data: {
              type: "folders",
              name: pipeline
            }
          });
          
        }
        deletePipelineFromView(pipeline);
      } catch(err){
        blockAlert("There was a problem while deleting the pipeline!");
        console.log("err");
        setIsLoading(false);
        setIsDeleting(false);
        return; 
      }
     
    }
    
    setChecked([]);
    fetchAllThePipelines();
    setIsDeleting(false);

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
                    <List dense sx={{ width: '100%', bgcolor: 'background.paper', marginTop:"10px" }}>
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
                                        
                                            <Checkbox
                                                edge="end"
                                                onChange={handleToggle(value.name)}
                                                checked={checked.indexOf(value.name) !== -1}
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
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
                        {hasError &&
                            <div className="no-result-container pipeline-manager-error">
                                <FontAwesomeIcon icon={faScrewdriverWrench} className='empty-node-container' /> 
                                <p> We have encountered an error! Please try again later</p>
                            </div>
                        }

                       {
                        !isLoading && !hasError && allPipelines.length == 0 &&
                        <div className="no-results-pipeline-manager">
                            <FontAwesomeIcon icon={faSquarePollHorizontal} className='no-results-pipeline-manager-icon'/> 
                            <p> There are no pipelines </p>
                        </div>
                        } 
                        {
                          !isLoading && !hasError && allPipelines.length!=0 && filteredPipelines == 0 &&
                         <div className="no-results-pipeline-manager">
                            <FontAwesomeIcon icon={faFile} className='no-results-pipeline-manager-icon'/> 
                            <p> No results </p>
                        </div>
                        }
                        
                    </List>
                    <Button variant='contained' onClick={()=>{setAreYouSureOpen(true)}} disabled={checked.length === 0 || isDeleting} sx={{backgroundColor:"red", color:"#fff", mt:"10px", fontWeight:"bold", ml:"40%", '&:hover': {
                        backgroundColor: '#fc5549', // Background color on hover
                        transform: 'scale(1.01)', // Slightly scale up on hover
                        },}}>{(checked.length === 1 || checked.length === 0) ? "Delete pipeline" : "Delete pipelines"} <DeleteForeverIcon sx={{marginLeft:"10px"}}/> </Button>

                  { areYouSureOpen && <AreYouSure open={areYouSureOpen} isDialogCustom={true} customMessage={checked.length === 1 ? `Are you sure you want to delete this pipeline?` : `Are you sure you want to delete this pipelines?` } handleClose={()=>{setAreYouSureOpen(false)}} handleAction={()=>{deletePipeline()}} />}
               </div>

    );
 
}

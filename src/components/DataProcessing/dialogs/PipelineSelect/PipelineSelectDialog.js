import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeBranch, faScrewdriverWrench, faSquarePollHorizontal, faFile } from '@fortawesome/free-solid-svg-icons';
import Paper from '@mui/material/Paper'; 
import { Typography } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import { formatString } from '../../../../utils/formatString';
import { FETCH_PIPELINES, FETCH_PIPELINE_DATA } from "../../../../utils/apiEndpoints";
import axios from "axios";
import {setSelectedTab, addPipelineTrain, addPipelinePreprocessing, setSelectedPipelineNameTrain, setSelectedPipelineNamePreprocessing, addPipelineStreaming, setSelectedPipelineNameStreaming, setPipelinesBlocks} from "../../../../reducers/nodeSlice";
import {useDispatch} from 'react-redux';
import {checkAndFormat} from "../../../../utils/checkAndFormat";
import { useSelector } from "react-redux/es/hooks/useSelector";
import {  setBlocksVariables} from '../../../../reducers/nodeSlice';
import FormControlLabel from '@mui/material/FormControlLabel';
import style from "./PipelineSelectDialog.css";


export default function PipelineSelectDialog(props) {
  
  const dispatch = useDispatch();
  const storedVariables = useSelector((state)=>state.blocksVariables);
  const pipelineTrain = useSelector((state)=>state.selectedPipelineTrain);
  const pipelineStreaming = useSelector((state)=>state.selectedPipelineStreaming);
  const pipelinePreprocessing = useSelector((state)=>state.selectedPipelineDataPreprocessing);
  const storedPipelineBlocks = useSelector((state)=> state.pipelinesBlocks);
  const [checked, setChecked] = React.useState([]);
  const [filteredPipelines,setfilteredPipelines] = React.useState([]);
  const [searchedString, setSearchedString] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [allPipelines, setAllPipelines] = React.useState([]);
  const [dialogName, setDialogName] = React.useState("");
  const [wasRunned, setWasRunned] = React.useState(false);
  const [selectedPipeline,setSelectedPipeline] = React.useState("");
  const [onlyOneOptionSelected, setOnlyOneOptionSelected] = React.useState(false);
  const [pipeline, setPipeline] = React.useState("");
  const [hasError, setHasError] = React.useState(false);
  const [foundPipeline, setFoundPipeline] = React.useState(false);




  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const restoreChecksBasedOnStoredData = (data)=>{
    if(data.length === 0 || pipeline.length === 0){
      return;
    }
    const filteredPipelines = data.filter((dt)=> {
      return  dt === pipeline[0] ;
    });

    const filteredPipelinesNames = filteredPipelines.length !== 0? filteredPipelines[0] : [];
    if(filteredPipelinesNames.length !== 0){

      setChecked([filteredPipelinesNames]);
    }

  }
  
  const fetchAllPipelines = async()=>{


    if(props.pipelineType === "data_preprocessing"){
      try{
        const resp = await axios.get(FETCH_PIPELINES("data_preprocessing"));
        
        setAllPipelines(resp.data);
        setfilteredPipelines(resp.data);
        restoreChecksBasedOnStoredData(resp.data);
        setIsLoading(false);
        setHasError(false);
      } catch(err){
        setIsLoading(false);
        setHasError(true);
      }
     

    } else if(props.pipelineType === "train"){
      try{
        const resp = await axios.get(FETCH_PIPELINES("train"));
        setAllPipelines(resp.data);
        setfilteredPipelines(resp.data);
        restoreChecksBasedOnStoredData(resp.data);
        setIsLoading(false);
        setHasError(false);
      } catch(err){
        setIsLoading(false);
        setHasError(true);
      }

    } else if(props.pipelineType === "streaming"){
      try{
        const resp = await axios.get(FETCH_PIPELINES("streaming"));
        setAllPipelines(resp.data);
        setfilteredPipelines(resp.data);
        restoreChecksBasedOnStoredData(resp.data);
        setIsLoading(false);
        setHasError(false);
      } catch(err){
        setIsLoading(false);
        setHasError(true);
      }
    }
  }
  

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


   const fetchAndSaveBlockNames = async(pipeline_name)=>{
      // cand cineva selecteaza un pipeline noi salvam in redux fiecare block cu numele lui si practic
      // o sa salvezi cheie valoare adica numele block-ului la cheie si la valoare o sa salvezi numele pipeline-ului
      let pipeline_blocks;
      try{
        const resp = await axios.get(FETCH_PIPELINE_DATA(pipeline_name));
        pipeline_blocks = resp.data.pipeline.blocks;

      } catch(err){
        console.log(err);
      }
 

      let blocksInfoObj ;
      if(storedPipelineBlocks){
        blocksInfoObj = {...storedPipelineBlocks };
      } else {
        blocksInfoObj = {};
      }

      

      for(const block of pipeline_blocks){
        blocksInfoObj[checkAndFormat(block.name)] = pipeline_name;
      }

      dispatch(setPipelinesBlocks(blocksInfoObj));
   }

  const addCorespondingPipeline = async()=>{
   
    
    if(isLoading){
        return;
    }
    
    if(selectedPipeline){
      let pipeline;
      if(Array.isArray(selectedPipeline)) {
        pipeline = selectedPipeline;
      } else {
        pipeline = selectedPipeline
      }
      const filteredVariables = [];
      await fetchAndSaveBlockNames(pipeline);
       

      for(const variable of storedVariables){
        if( variable["pipelineName"] && variable["pipelineName"][0] !== pipeline){
            filteredVariables.push(variable);
        }
      }
      dispatch(setBlocksVariables(filteredVariables));
    }

    if(props.pipelineType === "train"){
     
      if(selectedPipeline.length === 0){
        dispatch(addPipelineTrain([]));
      }

        
      if(pipelineTrain.length !== 0 && pipelineTrain[0] !== selectedPipeline)
      {  
        dispatch(addPipelineTrain(selectedPipeline));
        dispatch(setSelectedPipelineNameTrain(selectedPipeline));
        dispatch(setSelectedTab({"changed":true, tabSelected:"2"}));
      } else if(pipelineTrain.length === 0 ){
        dispatch(addPipelineTrain(selectedPipeline));
        dispatch(setSelectedPipelineNameTrain(selectedPipeline));
        dispatch(setSelectedTab({"changed":true, tabSelected:"2"}));
      } 

    } else if (props.pipelineType === "data_preprocessing"){
      
        if(selectedPipeline.length === 0){
          dispatch(addPipelinePreprocessing([]));
        } 

        /** This are the lines of code for pre-processing pipeline */
    
        if(pipelinePreprocessing.length !== 0 && pipelinePreprocessing[0] !== selectedPipeline)
        {
          dispatch(addPipelinePreprocessing(selectedPipeline));
          dispatch(setSelectedPipelineNamePreprocessing(selectedPipeline));
          dispatch(setSelectedTab({"changed":true, tabSelected:"1"}));
        } else if(pipelinePreprocessing.length === 0 ){
          
          dispatch(addPipelinePreprocessing(selectedPipeline));
          dispatch(setSelectedPipelineNamePreprocessing(selectedPipeline));
          dispatch(setSelectedTab({"changed":true, tabSelected:"1"}));
        }

        /** -------------------------------------------------------- */

      } if(props.pipelineType === "streaming"){
      
          if(selectedPipeline.length === 0){
            dispatch(addPipelineStreaming([]));
          }


        if(!pipelineStreaming){
          dispatch(addPipelineStreaming(selectedPipeline));
          dispatch(setSelectedPipelineNameStreaming(selectedPipeline));
          dispatch(setSelectedTab({"changed":true, tabSelected:"4"}));
          return;
        }
          
        if(pipelineStreaming.length !== 0 && pipelineStreaming[0] !== selectedPipeline)
        {  
          dispatch(addPipelineStreaming(selectedPipeline));
          dispatch(setSelectedPipelineNameStreaming(selectedPipeline));
          dispatch(setSelectedTab({"changed":true, tabSelected:"4"}));
        } else if(pipelineStreaming.length === 0 ){
          dispatch(addPipelineStreaming(selectedPipeline));
          dispatch(setSelectedPipelineNameStreaming(selectedPipeline));
          dispatch(setSelectedTab({"changed":true, tabSelected:"4"}));
        } 
  
      }
  }


  const handleRadioClick = (value)=>{
    if(value!=undefined){
        setSelectedPipeline(value);
        setOnlyOneOptionSelected(false);
        setFoundPipeline(false);
    }
 }

  const handleDialogTitle = ()=>{
    if(props.pipelineType === "data_preprocessing"){
      setDialogName("Pipelines - preprocessing");
      setPipeline(pipelinePreprocessing);
    } else if (props.pipelineType === "train"){
      setDialogName("Pipelines - train");
      setPipeline(pipelineTrain);
    } else if (props.pipelineType === "streaming"){
      setDialogName("Pipelines - streaming");
      setPipeline(pipelineStreaming);
    } 
  }

  const checkIfPipelineIsSelected = (all_pipelines, the_pipeline) => {
    let pipelineSelected = false;
    
    
    for(const pipeline of all_pipelines){
      if(Array.isArray(the_pipeline)){
        if(pipeline === the_pipeline[0]){
          pipelineSelected = true;
        }
      } else {
        if(pipeline === the_pipeline){
          pipelineSelected = true;
        }
      }
      
    }
    return pipelineSelected;
  }

  React.useEffect(()=>{
  
    if(wasRunned){
      fetchAllPipelines();
    }
  },[wasRunned])

  React.useEffect(()=>{
    if(!wasRunned){
      handleDialogTitle();
    }
    setWasRunned(true);
  },[])


  React.useEffect(()=>{
  
    setOnlyOneOptionSelected(!checkIfPipelineIsSelected(filteredPipelines, pipeline[0]));
    setFoundPipeline(checkIfPipelineIsSelected(filteredPipelines, pipeline[0]));

  },[filteredPipelines])


  return (
    
    <div>
      <ThemeProvider theme={darkTheme}>
        <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="lg"  fullWidth={true} >
  
             <DialogTitle> {dialogName} </DialogTitle>
              <DialogContent>   
             
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
                      isLoading && !hasError &&
                      <div className="loading-circle-container">
                        <div className="loading-circle"></div>
                        <p className="loading-text">Loading...</p>
                      </div>
                     }
                     { !isLoading && !hasError  && allPipelines.length!=0 && 
                        
                     <RadioGroup value={selectedPipeline} onClick={(val)=>{handleRadioClick(val.target.value)}}>
  
                      {
                           filteredPipelines.map((value) => {
                            const labelId = `checkbox-list-secondary-label-${value}`;
                           
                             return (
                               <ListItem
                                 key={value}
                                 secondaryAction={
                                   <div className='dataset-select-toolbox'>
                                     {value !== pipeline[0] ?
                                      <FormControlLabel value={value} control={<Radio />}  /> :
                                      <p className='pipeline-selected-text'>Selected</p>
                                     }
                                     
                                   </div>
                                 }
                                 disablePadding
                               > 
                                 <ListItemButton onClick={()=>{ if(value !== pipeline[0]) { handleRadioClick(value)}}}>
                                   <ListItemAvatar>
                                     <p className='select-dialog-list'><FontAwesomeIcon icon={faCodeBranch}/></p> 
                                   </ListItemAvatar>
                                   <ListItemText  id={labelId}  disableTypography
                                   primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>{formatString(value)}</Typography>} />
                                 </ListItemButton>
                               </ListItem>
                             );
                            
                          })
                          
                      }
  
                     </RadioGroup>                
                     }
                     {hasError &&
                        <div className="no-result-container">
                            <FontAwesomeIcon icon={faScrewdriverWrench} className='empty-node-container' /> 
                            <p> We have encountered an error! Please try again later</p>
                        </div>
                     }
                    {
                        !isLoading && !hasError &&allPipelines.length!=0 && filteredPipelines == 0 &&
                        <div className="no-results-pipeline-manager">
                          <FontAwesomeIcon icon={faFile} className='no-results-pipeline-manager-icon'/> 
                          <p> No results </p>
                      </div>
                    }

                     {
                      !isLoading && !hasError && allPipelines.length === 0 &&
                      <div className="no-result-container">
                        <FontAwesomeIcon icon={faSquarePollHorizontal} className='empty-node-container'/> 
                        <p> There are no pipelines </p>
                      </div>
                     }
                     
                   </List>
              </DialogContent>
              <DialogActions>
                <Button onClick={props.handleClose}>Close</Button>
                <Button onClick={()=>{props.handleClose();  addCorespondingPipeline()}} disabled={onlyOneOptionSelected || isLoading || hasError || foundPipeline }>Apply</Button>
              </DialogActions>
            
        </Dialog>
        </ThemeProvider>
      </div> 
    );

}

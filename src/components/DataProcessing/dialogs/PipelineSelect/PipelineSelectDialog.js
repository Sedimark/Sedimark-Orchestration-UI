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
import {setAllTabs,  setPipelinesBlocks, setTabIndex} from "../../../../reducers/nodeSlice";
import {useDispatch} from 'react-redux';
import {checkAndFormat} from "../../../../utils/checkAndFormat";
import { useSelector } from "react-redux/es/hooks/useSelector";
import {  setBlocksVariables, setSelectedTab} from '../../../../reducers/nodeSlice';
import FormControlLabel from '@mui/material/FormControlLabel';
import toast from 'react-hot-toast';
import style from "./PipelineSelectDialog.css";


export default function PipelineSelectDialog(props) {
  
  const dispatch = useDispatch();
  const storedVariables = useSelector((state)=>state.blocksVariables);
  const storedPipelineBlocks = useSelector((state)=> state.pipelinesBlocks);
  const allTabs = useSelector((state)=> state.allTabs);
  const tabIndexStored = useSelector((state)=> state.tabIndex);
  const [checked, setChecked] = React.useState([]);
  const [filteredPipelines,setfilteredPipelines] = React.useState([]);
  const [searchedString, setSearchedString] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [allPipelines, setAllPipelines] = React.useState([]);
  const [dialogName, setDialogName] = React.useState("");
  const [wasRunned, setWasRunned] = React.useState(false);
  const [selectedPipeline,setSelectedPipeline] = React.useState({});
  const [onlyOneOptionSelected, setOnlyOneOptionSelected] = React.useState(false);
  const [pipeline, setPipeline] = React.useState("");
  const [hasError, setHasError] = React.useState(false);
  const [foundPipeline, setFoundPipeline] = React.useState(false);
  const [pipelineType , setPipelineType] = React.useState("") ;
  const [noValueSelected, setNoValueSelected] = React.useState(true);

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

      try{
        const resp = await axios.get(FETCH_PIPELINES(""));
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

  const blockNotifyError = (text)=>{
    toast.alert(text);
  }

   const fetchAndSaveBlockNames = async(pipeline_name , newTabName )=>{
    
      let pipeline_blocks;
      
      try{
        const resp = await axios.get(FETCH_PIPELINE_DATA(pipeline_name));
        console.log(resp);
        pipeline_blocks = resp.data.pipeline.blocks;

      } catch(err){
        console.log(err);
        blockNotifyError("There was an error while fetching the pipeline");
        return;
      }
 

      console.log("pipeline_blocks:");
      console.log(pipeline_blocks);

      let blocksInfoObj ;
      if(storedPipelineBlocks){
        blocksInfoObj = {...storedPipelineBlocks };
      } else { 
        blocksInfoObj = {};
      }

      for(const block of pipeline_blocks){
        blocksInfoObj[checkAndFormat(block.name)] = {
          "pipeline_name": pipeline_name,
          "tabName": newTabName
        }
      }

    
      dispatch(setPipelinesBlocks(blocksInfoObj));
   }

  const addCorespondingPipeline = async()=>{

    if(isLoading){
        return;
    }

    let pipeline;
    
   

    if(selectedPipeline){
      
      if(Array.isArray(selectedPipeline)) {
        pipeline = selectedPipeline;
      } else {
        pipeline = selectedPipeline
      }
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
          "pipelineType": pipelineType,
          "tabOrder":1
        });

      } else {
        newTabName = `Tab ${tabIndexStored[tabIndexStored.length-1]+1}`;
        newTabs.push({
          "name":newTabName,
          "pipelineName": pipeline,
          "pipelineType": pipelineType,
          "tabOrder":tabIndexStored[tabIndexStored.length-1]+1
        });
        const newTabArr = [...tabIndexStored];
        newTabArr.push(tabIndexStored[tabIndexStored.length-1]+1);
        dispatch(setTabIndex(newTabArr));
      } 
      
      await fetchAndSaveBlockNames(pipeline , newTabName);


      dispatch(setAllTabs(newTabs));

      setTimeout(()=>{
        dispatch(setSelectedTab({"changed":true, tabSelected:newTabName}));
      },100)
 
      dispatch(setBlocksVariables(filteredVariables));
    }
 
  }


  const handleRadioClick = (value)=>{
    
    if(value!=undefined){
        setSelectedPipeline(value.name);
        setPipelineType(value.tag); 
        setOnlyOneOptionSelected(false);
        setFoundPipeline(false);
        setNoValueSelected(false);
    }
 }
 
 const getFullPipelineObj = (pipeline_name)=>{
  return filteredPipelines.find(pipe=>pipe.name === pipeline_name);
 }

  React.useEffect(()=>{
  
    if(wasRunned){
      fetchAllPipelines();
    }
  },[wasRunned])

  React.useEffect(()=>{
    setWasRunned(true);
  },[])


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
                      isLoading && !hasError &&
                      <div className="loading-circle-container">
                        <div className="loading-circle"></div>
                        <p className="loading-text">Loading...</p>
                      </div>
                     }
                     { !isLoading && !hasError  && allPipelines.length!=0 && 
                        
                     <RadioGroup value={selectedPipeline} onClick={(val)=>{if(val.target.value!== undefined){handleRadioClick(getFullPipelineObj(val.target.value));}}}>
  
                      {
                           filteredPipelines.map((value) => {
                            const labelId = `checkbox-list-secondary-label-${value.name}`;
                            
                             return (
                               <ListItem
                                 key={value.name}
                                 secondaryAction={
                                   <div className='dataset-select-toolbox'>
                                     {value.name !== pipeline[0] ?
                                      <FormControlLabel value={value.name} control={<Radio />}  /> :
                                      <p className='pipeline-selected-text'>Selected</p>
                                     }
                                     
                                   </div>
                                 }
                                 disablePadding
                               > 
                                 <ListItemButton onClick={()=>{ if(value.name !== pipeline[0]) { handleRadioClick(value)}}}>
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
                <Button onClick={()=>{props.handleClose();  addCorespondingPipeline()}} disabled={onlyOneOptionSelected || isLoading || hasError || noValueSelected  }>Load</Button>
              </DialogActions>
            
        </Dialog>
        </ThemeProvider>
      </div> 
    );

}

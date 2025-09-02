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
import filterBlocksWithNonNullDefault from "../../../../utils/filterBlocksWithNonNullDefault";
import isObject from '../../../../utils/isObject';
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

  const blockAlert = (msg)=>{
    toast.error(msg, {
              duration: 2000,
              position: 'top-right',
    });
  }

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

  
  const generateVariablesForSubPipe = async(subPipelineBlocks, parentPipeline)=>{
    /*
      This functions populates the big blocksVariables value in the 
      redux and by using this in the redux we will have prepopulated default
      values as well as 
    */
 

    //first we collect all the pipelines names
    const pipelineNames = [];

    // here are the variables we are going to store in react redux
    const variablesForStore = [];

    //we iterate over the blocks that have default values 
    // and are of type trigger to collect the default values
    // which represents the pipeline names and those pipeline names
    // will be pushed into the pipelineNames array

    for(const subPipeBlock of subPipelineBlocks){
      for (const [key, value] of Object.entries(subPipeBlock["configuration"])) {
            // we verify for the variable
            if(value["type"] == "trigger"){
                pipelineNames.push(value["default"]);
            } 
        }
    }

    // we iterate over the pipelines that are stored in pipelineNames
    let pipeline_blocks;
    for(const pipeline of pipelineNames){
      // STEP 1 - we fetch the blocks for this specific pipeline
      try{
          const resp = await axios.get(FETCH_PIPELINE_DATA(pipeline));
          //fetch the pipeline blocks
          pipeline_blocks = resp.data.pipeline.blocks;
          // for this pipelines blocks we will just iterate and find those 
          // with default values and populate the big vector with all the 
          // values from this
          for(const blck of pipeline_blocks){
            // if there is a configuration
            if(Object.keys(blck["configuration"]).length !== 0){
                // iterate in a key value pairs manner
                // and for each default value we find
                // we push that value to the big array of values
              
              // iterate over config obj
              for(const [key,value]  of Object.entries(blck["configuration"])){
                // we check for a default value

                /*
                 Task
                  [] check if the value is actually an object or not
                  [] for value check if the value is an object and also
                  [] check if it is an object if it has a type key inside it
                */
                
                  if((typeof value === 'object' && value !== null) && value["type"] && value["default"]){

                      // if there is a default_value we push it to the vector
                      // and we use it further down the line
                        variablesForStore.push( {
                        "block_name": formatString(blck["name"]),
                        "variable_name": key , 
                        "value": value["default"], 
                        "nodeId": "", 
                        "pipelineName": pipeline,
                        "tabName": `${pipeline}-${parentPipeline}`,
                        "parentPipeline": parentPipeline
                      });

                  }
              }
            }
          }

        } catch(err){
          console.log(err);
          blockNotifyError("There was an error while fetching variables for the sub pipeline!");
          return [];
        }      
    }
    

    return variablesForStore;
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
      const datasetName = item.name.toLowerCase();
  
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
    toast.error(text);
  }

  const spawnTabForPipeline = async(pipeline, subPipelineType)=>{

    // all the logic needs to be done in here
    // we need to store all the pipelines and the types
    // and then afterwards we may store it

    let finalTabsArr = [];
    

    // here we will spawn a tab for the pipeline
    // specified in the parameters
    // and this is going to be used when there is 
    // a default_value for my specific use case
    
    // Initialize newTabs

    let storedAllTabs = allTabs; 

    let newTabs = storedAllTabs ? [...storedAllTabs] : [];
    

    // Initialize tabIndexStored if it's undefined
    const currentTabIndexStored = tabIndexStored || [];
    
    // Determine new tab name and order
    let newTabName, tabOrder;
    if (!currentTabIndexStored.length) {
        tabOrder = 1;
    } else {
        const lastIndex = currentTabIndexStored[currentTabIndexStored.length - 1];
        tabOrder = lastIndex + 1;
    }

      newTabs.push({
          "name": `${selectedPipeline}-${pipeline}`,
          "parentPipeline": selectedPipeline,
          "pipelineName": pipeline,
          "pipelineType": subPipelineType,
          "tabOrder": tabOrder,
          "isChained":true,
      });

      const fetchedSuccess = await fetchAndSaveBlockNames(pipeline, newTabName);
      if (!fetchedSuccess) {
          return;
      }

      // Update tab indices
      const newTabArr = currentTabIndexStored.length 
          ? [...currentTabIndexStored, currentTabIndexStored[currentTabIndexStored.length - 1] + 1]
          : [1];
      
      dispatch(setTabIndex(newTabArr));
      dispatch(setAllTabs(newTabs));

      setTimeout(() => {
          dispatch(setSelectedTab({ "changed": true, tabSelected: newTabName }));
      }, 100);

  }

  const handleDefaultChainedValues = async(pipelineBlocks, pipelineParentName, tabName)=>{
    // function that for the variables that represent chained pipelines
    // and do have a default value will spawn in a new tab the pipeline
    // from the default value and also will store it inside blocksStored
    // value from redux store
    

    /*
      Steps :
        [x] find in a for loop for the variables the ones that have type trigger
        [] for each one 
          [x] validate if the value linked is ok ( the pipeline of type does exist in the right category)!
          [] spawn new tab with pipeline
          [] return the value inside the redux for the specific pipeline
    */

      // here we store all the values that are needed to be stored in store for the
      // store component and what we do is that here we will store the variables for store
      // here they will get saved and stored all at once
      const blockValuesForStore = [];
      //here we will store the values that have the trigger as well as a default value
      // and we need to set a default value for each and every one starting from here 
      let blocksWithTriggerAndDefValue = [];

      const pipeValuesNewTab = [];

     

      for(const pipelineBlock of pipelineBlocks){
        // here we check if at least one variable is of type trigger
        const hasBlockTrigger = Object.values(pipelineBlock["configuration"]).find((blockConfig)=>{
          return blockConfig["type"] === "trigger";
        });
        
        //here we check for all the values that have a default value

        if(hasBlockTrigger){
          blocksWithTriggerAndDefValue.push(pipelineBlock);
          continue;
        }
      }

      // here we have block with triggers 
      // for the blocks with triggers we need to fetch also the variables
      // and append them acordingly

      const variablesForSubPipelines = await generateVariablesForSubPipe(blocksWithTriggerAndDefValue, pipelineParentName);
      
      const filteredBlocks = filterBlocksWithNonNullDefault(pipelineBlocks);

      if(filteredBlocks && filteredBlocks.length !=0 ){
          blocksWithTriggerAndDefValue.push(...filteredBlocks);
      }

      if(variablesForSubPipelines && variablesForSubPipelines.length!=0){
         blocksWithTriggerAndDefValue.push(...variablesForSubPipelines);
      }
     

     for (const block of blocksWithTriggerAndDefValue) {
      // Changed Object.values to Object.entries
        Object.entries(block["configuration"]).forEach(([key, blockConfig]) => { // 'key' is the property name, 'blockConfig' is its value

          // if it is of type trigger we need to spawn a new pipeline
          // and of course if it has default trigger
            if (blockConfig["type"] === "trigger" && blockConfig["default"]) {
              
              const pipelineTag = blockConfig["tag"];
              const pipelineName = blockConfig["default"];
              

              let isContained = false;

              for(const pipe of allPipelines){
                if( pipe["tag"] === pipelineTag && pipe["name"] === pipelineName )
                {
                  isContained = true;
                  break;
                }
              }
              
              if (!isContained) {
                
                blockAlert(`Default value specified for ${block["name"]} is invalid!`);
                return ; // Exits the current iteration of the forEach callback
              }
 
              // spawn a new tab for the newly created pipelines

              pipeValuesNewTab.push({
                "pipelineTag":pipelineTag,
                "pipelineName":pipelineName
              });

              // and then this function will render the subchained pipeline
              // addCorespondingPipeline(pipelineName,true);
              // store inside redux
              const newVarValue = {
                "block_name": formatString(block["name"]),
                "variable_name": key, // Use 'key' here if you want the configuration property name
                "value": blockConfig["default"], // Assuming processedObj["default"] should be blockConfig["default"] based on context
                "nodeId": "", // will be completed at a future time
                "pipelineName": pipelineParentName,
                "tabName": tabName
              }

              blockValuesForStore.push(newVarValue);
              
            } else if(blockConfig["default"]){
              //else if there is a default value for other type of value
              
              const newVarValue = {
                "block_name": formatString(block["name"]),
                "variable_name": key, 
                "value": blockConfig["default"], 
                "nodeId": "", 
                "pipelineName": pipelineParentName,
                "tabName": tabName
              }

              blockValuesForStore.push(newVarValue);

            }

          });
        } 

        return {blockValuesForStore, pipeValuesNewTab};
  }

  const fetchAndSaveBlockNames = async(pipeline_name , newTabName )=>{
    
      let pipeline_blocks;
      let chainedBlocks = [];
      let newTabPipelines;

      try{
        const resp = await axios.get(FETCH_PIPELINE_DATA(pipeline_name));
        pipeline_blocks = resp.data.pipeline.blocks;
        let collectedDataForChainedPipelines = await handleDefaultChainedValues(pipeline_blocks, pipeline_name, newTabName); 
        chainedBlocks = collectedDataForChainedPipelines["blockValuesForStore"];
        newTabPipelines = collectedDataForChainedPipelines["pipeValuesNewTab"];

      } catch(err){
        console.log(err);
        blockNotifyError("There was an error while fetching the pipeline");
        return {
          success: false,
          chainedBlocks:[]
        };
      }


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

      return {
          success: true,
          chainedBlocks: chainedBlocks,
          newTabPipelines: newTabPipelines
      };
   }

  const addCorespondingPipeline = async (selectedPipeline, isChained) => {
    if (isLoading) {
        return;
    }

    let pipeline = Array.isArray(selectedPipeline) ? selectedPipeline : selectedPipeline;
    
    if (selectedPipeline) {
       
        // from globally stored variables we filter those that
        // have the name of the pipeline 
        const filteredVariables = storedVariables.filter(variable => 
            !(variable["pipelineName"] && variable["pipelineName"][0] === pipeline)
        );
        
        // Initialize newTabs
        let newTabs = allTabs ? [...allTabs] : [];

        // Initialize tabIndexStored if it's undefined
        const currentTabIndexStored = tabIndexStored || [];
        
        // Determine new tab name and order

        // so based off the last index stored what it happens is that
        // [] Update tabOrder based of lastIndexStored
        // [] give name based of tabOrder.. - not the case
      

        let newTabName, tabOrder;
        if (!currentTabIndexStored.length) {
            newTabName = 'Tab 1';
            tabOrder = 1;
        } else {
            const lastIndex = currentTabIndexStored[currentTabIndexStored.length - 1];
            tabOrder = lastIndex + 1;
            newTabName = `Tab ${tabOrder}`;
        }

        // Add new tab
        newTabs.push({
            "name": newTabName,
            "pipelineName": pipeline,
            "pipelineType": pipelineType,
            "tabOrder": tabOrder,
            "isChained":isChained
        });

        const fetchedSuccessData = await fetchAndSaveBlockNames(pipeline, newTabName);
        if (!fetchedSuccessData["success"]) {
            return;
        }

        // after the fetch was done you may need to update the local vector
        // such that when you update the global state it reflects
        // the latest valid functionality

        //based off tabOrder you may update the vector 
        // this is the magic line of code that we are using
        

        for(const chBlk of fetchedSuccessData["newTabPipelines"]){
           tabOrder++;
           newTabs.push({
              "name": `${selectedPipeline}-${chBlk["pipelineName"]}`,
              "parentPipeline": selectedPipeline,
              "pipelineName": chBlk["pipelineName"],
              "pipelineType": chBlk["pipelineTag"],
              "tabOrder": tabOrder,
              "isChained":true,
          });
          
        }
        
        const newTabArr = currentTabIndexStored.length 
            ? [...currentTabIndexStored, currentTabIndexStored[currentTabIndexStored.length - 1] + 1]
            : [1];
        
        dispatch(setTabIndex(newTabArr));
        dispatch(setAllTabs(newTabs));

        setTimeout(() => {
            dispatch(setSelectedTab({ "changed": true, tabSelected: newTabName }));
        }, 100);   

        dispatch(setBlocksVariables([...filteredVariables, ...fetchedSuccessData["chainedBlocks"]]));
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
                <Button onClick={()=>{props.handleClose();  addCorespondingPipeline(selectedPipeline,false)}} disabled={onlyOneOptionSelected || isLoading || hasError || noValueSelected  }>Load</Button>
              </DialogActions>
            
        </Dialog>
        </ThemeProvider>
      </div> 
    );

}

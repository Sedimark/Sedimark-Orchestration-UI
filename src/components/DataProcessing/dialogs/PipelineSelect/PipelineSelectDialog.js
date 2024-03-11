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
import { faCodeBranch, faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';
import Paper from '@mui/material/Paper'; 
import { Typography } from '@mui/material';
import RadioGroup from '@mui/material/RadioGroup';
import style from "./PipelineSelectDialog.css";
import Radio from '@mui/material/Radio';
import { formatString } from '../../../../utils/formatString';
import {FETCH_MINIO_FILE, FETCH_PIPELINES} from "../../../../utils/apiEndpoints";
import axios from "axios";
import {setSelectedTab, addPipelineTrain, addPipelinePreprocessing, setSelectedPipelineName, setSelectedPipelineNameTrain, setSelectedPipelineNamePreprocessing} from "../../../../reducers/nodeSlice";
import {useDispatch} from 'react-redux';
import { useSelector } from "react-redux/es/hooks/useSelector";
import { setDatasetColumns, setDatasetInfo, setDatasetColumnNames, setSelectedView } from '../../../../reducers/nodeSlice';
import FormControlLabel from '@mui/material/FormControlLabel';



export default function PipelineSelectDialog(props) {

  
  const dispatch = useDispatch();
  const nodes = useSelector((state)=>state.nodes);
  const pipelineTrain = useSelector((state)=>state.selectedPipelineTrain);
  const pipelinePreprocessing = useSelector((state)=>state.selectedPipelineDataPreprocessing);
  const [checked, setChecked] = React.useState([]);
  const [dataSetSearch,setDatasetSearch] = React.useState(true);
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

  const parseAndSetColumns = (data_to_parse)=>{
    
    const allColumns = [];
    for(const obj of data_to_parse){
        allColumns.push(obj.column_name);
    }
    
    dispatch(setDatasetColumns(allColumns));
}

const parseBucketName = (inputString)=>{
  if (inputString.includes('_')) {
    inputString = inputString.split("_").join("-");
  } 

  if (inputString.includes(' ')) {
    inputString =  inputString.split(' ').join("-");
  } 

  return inputString;
}


  const parseAndSetColumnNames = (allColumnsData)=>{
    const allColumnNames = [];
    for(const column of allColumnsData){
      allColumnNames.push(column.column_name);
    }
    dispatch(setDatasetColumnNames(allColumnNames));
  } 

const fetchAndParseMinioJson = async (bucket_name) => {

    let jsonFileLink;
    let jsonFileData;
  
    try{
        jsonFileLink = await axios.get(FETCH_MINIO_FILE(parseBucketName(bucket_name)));
        jsonFileLink = jsonFileLink.data.url;
    } catch(err){
        parseAndSetColumns([]);
        dispatch(setDatasetInfo([]));
        console.log(err);
        setIsLoading(false);
        setHasError(true);
        return;
    }
    
    try{
        jsonFileData = await axios.get(jsonFileLink);
        parseAndSetColumns(jsonFileData.data);
        parseAndSetColumnNames(jsonFileData.data);
        dispatch(setDatasetInfo(jsonFileData.data));

    } catch(err){
        console.log(err);
        setIsLoading(false);
        setHasError(true);
    }
  };

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    
    if(newChecked.length == 1){
      if(currentIndex != -1){
        newChecked.pop();
      } else {
        newChecked.pop();
        newChecked.push(value);
      }
    } else {
      if (currentIndex === -1) {
        newChecked.push(value);
      } 
    }
    if(newChecked.length!=0){
      fetchAndParseMinioJson(newChecked[0]);
    }

    setChecked(newChecked);
  };


  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const restoreChecksBasedOnStoredData = (data)=>{
    if(data.length == 0 || pipeline.length == 0){
      return;
    }
    const filteredPipelines = data.filter((dt)=> {
      return  dt.name == pipeline[0] ;
    });

    const filteredPipelinesNames = filteredPipelines.length!=0? filteredPipelines[0].name : [];
    if(filteredPipelinesNames.length !=0){

      setChecked([filteredPipelinesNames]);
    }

  }
  
  const fetchAllPipelines = async()=>{
     try{
      const resp = await axios.get(FETCH_PIPELINES);
      if(resp.data.length!=0){
        const filteredData = resp.data.filter((item) => item.type == props.pipelineType);
        setAllPipelines(filteredData);
        setfilteredPipelines(filteredData);
        restoreChecksBasedOnStoredData(resp.data);
        setIsLoading(false);
      }
     } catch(err){
      setIsLoading(false);
      setHasError(true);
      console.log(err);
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


  const addCorespondingPipeline = ()=>{
   
    if(isLoading){
        return;
    }

    if(props.pipelineType == "train"){

      if(selectedPipeline.length == 0){
        dispatch(addPipelineTrain([]));
      }

        
      if(pipelineTrain.length !=0 && pipelineTrain[0] != selectedPipeline)
      {  
        dispatch(addPipelineTrain(selectedPipeline));
        dispatch(setSelectedPipelineName(selectedPipeline));
        dispatch(setSelectedPipelineNameTrain(selectedPipeline));
        dispatch(setSelectedTab({"changed":true, tabSelected:"2"}));
        return;
      } else if(pipelineTrain.length == 0 ){
        dispatch(addPipelineTrain(selectedPipeline));
        dispatch(setSelectedPipelineName(selectedPipeline));
        dispatch(setSelectedPipelineNameTrain(selectedPipeline));
        dispatch(setSelectedTab({"changed":true, tabSelected:"2"}));
        return;
      } 

    } else if (props.pipelineType == "data_preprocessing"){
      
        if(selectedPipeline.length == 0){
          dispatch(addPipelinePreprocessing([]));
        }
    
        if(pipelinePreprocessing.length !=0 && pipelinePreprocessing[0] != selectedPipeline)
        {
          dispatch(addPipelinePreprocessing(selectedPipeline));
          dispatch(setSelectedPipelineName(selectedPipeline));
          dispatch(setSelectedPipelineNamePreprocessing(selectedPipeline));
          dispatch(setSelectedTab({"changed":true, tabSelected:"1"}));
          return;
        } else if(pipelinePreprocessing.length == 0 ){
          dispatch(addPipelinePreprocessing(selectedPipeline));
          dispatch(setSelectedPipelineName(selectedPipeline));
          dispatch(setSelectedPipelineNamePreprocessing(selectedPipeline));
          dispatch(setSelectedTab({"changed":true, tabSelected:"1"}));
          return;
        }
      }
  }


  const handleRadioClick = (value)=>{
    setSelectedPipeline(value.target.value);
    setOnlyOneOptionSelected(false);
    
 }

  const handleDialogTitle = ()=>{
    if(props.pipelineType == "data_preprocessing"){
      setDialogName("Pipelines - preprocessing");
      setPipeline([pipelinePreprocessing]);
    } else if (props.pipelineType == "train"){
      setDialogName("Pipelines - train");
      setPipeline(pipelineTrain);
    }
  }

  const checkIfPipelineIsSelected = (all_pipelines, the_pipeline) => {
    let pipelineSelected = false;

    for(const pipeline of all_pipelines){
      if(pipeline.name == the_pipeline){
        pipelineSelected = true;
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
  },[filteredPipelines])

  


  return (
    
    <div>
      <ThemeProvider theme={darkTheme}>
        <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="600" fullWidth={true} >
  
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
                      isLoading &&
                      <div className="loading-circle-container">
                        <div className="loading-circle"></div>
                        <p className="loading-text">Loading...</p>
                      </div>
                     }
                     { !isLoading && 
                        
                     <RadioGroup onClick={(val)=>{handleRadioClick(val)}}>
  
                      {
                           filteredPipelines.map((value) => {
                            const labelId = `checkbox-list-secondary-label-${value.name}`;
                        
                             return (
                               <ListItem
                                 key={value.name}
                                 secondaryAction={
                                   <div className='dataset-select-toolbox'>
                                     {value.name != pipeline[0] ?
                                      <FormControlLabel value={value.name} control={<Radio />}  /> :
                                      <p className='pipeline-selected-text'>Selected</p>
                                     }
                                     
                                   </div>
                                 }
                                 disablePadding
                               > 
                                 <ListItemButton>
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
                     
                   </List>
              </DialogContent>
              <DialogActions>
                <Button onClick={props.handleClose}>Close</Button>
                <Button onClick={()=>{props.handleClose();  addCorespondingPipeline()}} disabled={onlyOneOptionSelected || isLoading || hasError}>Apply</Button>
              </DialogActions>
            
        </Dialog>
        </ThemeProvider>
      </div> 
    );

}

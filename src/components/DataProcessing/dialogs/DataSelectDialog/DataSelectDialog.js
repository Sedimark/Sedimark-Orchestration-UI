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
import Checkbox from '@mui/material/Checkbox';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import Paper from '@mui/material/Paper'; 
import { Typography } from '@mui/material';
import style from "./DataSelectDialog.css";
import DataSetInfo from './DataSetInfo';
import {FETCH_MINIO_FILE, FETCH_PIPELINES} from "../../../../utils/apiEndpoints";
import axios from "axios";
import {addNode, addPipeline, setNodes, clearPipeline} from "../../../../reducers/nodeSlice";
import {useDispatch} from 'react-redux';
import { useSelector } from "react-redux/es/hooks/useSelector";
import { setDatasetColumns, setDatasetInfo,setIsPipelineFetching } from '../../../../reducers/nodeSlice';


export default function DataSelectDialog(props) {

  
  const dispatch = useDispatch();
  const nodes = useSelector((state)=>state.nodes);
  const pipeline = useSelector((state)=>state.selectedPipeline);
  const [checked, setChecked] = React.useState([]);
  const [dataSetSearch,setDatasetSearch] = React.useState(true);
  const [dataSets, setDataSets] = React.useState([]);
  const [selectedDatasetId,setSelectedDatasetId] = React.useState("");
  const [selectedDatasetName, setSelectedDatasetName] = React.useState("");
  const [filteredPipelines,setfilteredPipelines] = React.useState([]);
  const [searchedString, setSearchedString] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [allPipelines, setAllPipelines] = React.useState([]);
  const [dialogName, setDialogName] = React.useState("");

  const handleDisplayDataSetInfo = (datasetId) =>{
    if(datasetId){
      setSelectedDatasetId(datasetId);
      const  foundDataset = dataSets.filter(dt => dt.id === datasetId);
      if(foundDataset.length !=0){
        setSelectedDatasetName(foundDataset[0].dataset_name);;
      }
    }
    setDatasetSearch(!dataSetSearch);
  }

  const parseAndSetColumns = (data_to_parse)=>{
    
    const allColumns = [];
    for(const obj of data_to_parse){
        allColumns.push(obj.column_name);
    }

    dispatch(setDatasetColumns(allColumns));
}

const fetchAndParseMinioJson = async (bucket_name) => {

    let jsonFileLink;
    let jsonFileData;
    try{
        jsonFileLink = await axios.get(FETCH_MINIO_FILE(bucket_name.split("_").join("-")));
        jsonFileLink = jsonFileLink.data.url;
    } catch(err){
        console.log(err);
    }
    
    try{
        jsonFileData = await axios.get(jsonFileLink);
        parseAndSetColumns(jsonFileData.data);
        dispatch(setDatasetInfo(jsonFileData.data));

    } catch(err){
        console.log(err);
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
      return  dt == pipeline[0];
    });
    if(filteredPipelines.length !=0){
      setChecked(filteredPipelines);
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
      console.log(resp.data);
     } catch(err){
      console.log(err);
     }
  }
  


  const searchListByDatasetName = (list, str)=> {
    console.log(str)   ;
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
    console.log(updatedPipelines);
    setfilteredPipelines(updatedPipelines);
  }

  const addCorespondingPipeline = ()=>{

    if(pipeline.length == 0){
      dispatch(addPipeline(checked[0]));
      return;
    }
   
    if(pipeline.length !=0 && pipeline[0] != checked[0])
    {
      dispatch(addPipeline(checked[0]));
    }
       
  }

  const handleDialogTitle = ()=>{
    if(props.pipelineType == "data_preprocessing"){
      setDialogName("Pipelines - preprocessing");
    } else if (props.pipelineType == "train"){
      setDialogName("Pipelines - train");
    }
  }

  
  React.useEffect(()=>{
    handleDialogTitle();
    fetchAllPipelines();
    
  },[])

 
  return (
    
  <div>
    <ThemeProvider theme={darkTheme}>
      <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="600" fullWidth="true" >

           <DialogTitle> {dialogName} </DialogTitle>
            <DialogContent>   
             {
                dataSetSearch &&
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
              
              } 
              {
                dataSetSearch &&
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
                   { !isLoading && filteredPipelines.map((value,index) => {
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
                          <ListItemButton>
                            <ListItemAvatar>
                              <p className='select-dialog-list'><FontAwesomeIcon icon={faCodeBranch}/></p> 
                            </ListItemAvatar>
                            <ListItemText  id={labelId}  disableTypography
                            primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>{value.name}</Typography>} />
                          </ListItemButton>
                        </ListItem>
                      );
                     
                   })}
                 </List>
              }

            </DialogContent>
            <DialogActions>
              <Button onClick={props.handleClose}>Close</Button>
              <Button onClick={()=>{props.handleClose();  addCorespondingPipeline()}}>Apply</Button>
            </DialogActions>
          
      </Dialog>
      </ThemeProvider>
    </div> 
  );
}

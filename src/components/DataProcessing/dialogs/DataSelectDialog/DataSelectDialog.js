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
import { faDatabase } from '@fortawesome/free-solid-svg-icons';
import Paper from '@mui/material/Paper'; 
import { Typography } from '@mui/material';
import style from "./DataSelectDialog.css";
import DataSetInfo from './DataSetInfo';
import {DATASET_FETCH_ALL_DATASETS} from "../../../../utils/apiEndpoints";
import axios from "axios";
import {addNode, addDataset, setNodes, clearDataset} from "../../../../reducers/nodeSlice";
import {useDispatch} from 'react-redux';
import { useSelector } from "react-redux/es/hooks/useSelector";


export default function DataSelectDialog(props) {
  
  
  const dispatch = useDispatch();
  const nodes = useSelector((state)=>state.nodes);
  const dataset = useSelector((state)=>state.selectedDataset);
  const [checked, setChecked] = React.useState([]);
  const [dataSetSearch,setDatasetSearch] = React.useState(true);
  const [dataSets, setDataSets] = React.useState([]);
  const [selectedDatasetId,setSelectedDatasetId] = React.useState("");
  const [selectedDatasetName, setSelectedDatasetName] = React.useState("");
  const [filteredDatasets,setFilteredDatasets] = React.useState([]);
  const [searchedString, setSearchedString] = React.useState("");
  

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
    setChecked(newChecked);
  };


  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const restoreChecksBasedOnStoredData = (data)=>{
    
    if(data.length == 0 || dataset.length == 0){
      return;
    }
    const filteredDataset = data.filter((dt)=> {
      return  dt.dataset_name == dataset[0].dataset_name
    });
    if(filteredDataset.length !=0){
      setChecked(filteredDataset);
    }

  }

  
  const fetchAllData = () =>{
    
    const fetchedData = [
      {
          "id": 1,
          "dataset_name": "Heart Failure",
          "dataset_id": 1,
          "dataset_info_id": 1,
          "database_name": "heart_failure"
      },
      {
          "id": 2,
          "dataset_name": "Red Wine",
          "dataset_id": 2,
          "dataset_info_id": 2,
          "database_name": "red_wine"
      },
      {
          "id": 3,
          "dataset_name": "Water Potability",
          "dataset_id": 3,
          "dataset_info_id": 3,
          "database_name": "water_potability"
      },
      {
          "id": 4,
          "dataset_name": "White Wine",
          "dataset_id": 4,
          "dataset_info_id": 4,
          "database_name": "white_wine"
      }
  ]
   setFilteredDatasets(fetchedData);
   setDataSets(fetchedData);
   setDatasetSearch(fetchedData);
   restoreChecksBasedOnStoredData(fetchedData);
      
   
  }
  


  const searchListByDatasetName = (list, str)=> {
    
    const filteredList = list.filter(item => {
      const searchStr = str.toLowerCase();
      const datasetName = item.dataset_name.toLowerCase();
  
      return datasetName.includes(searchStr);
    });
  
    return filteredList;
  }

  const updateSearch = (evt)=>{
    setSearchedString(evt.target.value);
    const updatedDataset = searchListByDatasetName(dataSets,evt.target.value);
    setFilteredDatasets(updatedDataset);
  }

  const addCorespondingDataset = ()=>{
  

    if(dataset.length == 0){
      dispatch(addDataset(checked[0]));
      return;
    }
   
    if(dataset.length !=0 && dataset[0].dataset_name != checked[0].dataset_name)
    {
      dispatch(addDataset(checked[0]));
    }
       
  }
 
  const addCorespondingNode = () =>{
    
   if(checked.length != 0){
      for(let node of nodes){
        if(node.nodeData.type == "Dataset"){
          return;
        } 
      }
      const newNode = {type:"Dataset"}
      dispatch(addNode(newNode))  
   } else if(checked.length == 0) {
    dispatch(clearDataset({}))
     const newNodeList = [];
     for(let node of nodes){
      if(node.nodeData.type !== "Dataset"){
        newNodeList.push(node);
      } 
    }
    dispatch(setNodes(newNodeList));
   }
   
  }
  
  React.useEffect(()=>{
    fetchAllData();
  },[])

 
  return (
    
  <div>
    <ThemeProvider theme={darkTheme}>
      <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="600" fullWidth="true" >

           <DialogTitle> Datasets </DialogTitle>
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
                    placeholder="Search Dataset"
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
                            <p>More Info</p>
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
                          primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>DataSet Name</Typography>} />
                        </ListItemButton>
                      </ListItem>
                   {filteredDatasets.map((value,index) => {
                     const labelId = `checkbox-list-secondary-label-${value}`;
                      return (
                        <ListItem
                          key={value.id}
                          secondaryAction={
                            <div className='dataset-select-toolbox'>
                              <Checkbox
                                edge="end"
                                onChange={handleToggle(value)}
                                checked={checked.indexOf(value) !== -1}
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                              <Button variant="outlined" onClick={()=>{handleDisplayDataSetInfo(value.id)}}>Info</Button>
                            </div>
                          }
                          disablePadding
                        > 
                          <ListItemButton>
                            <ListItemAvatar>
                              <p className='select-dialog-list'><FontAwesomeIcon icon={faDatabase}/></p> 
                            </ListItemAvatar>
                            <ListItemText  id={labelId}  disableTypography
                            primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>{value.dataset_name}</Typography>} />
                          </ListItemButton>
                        </ListItem>
                      );
                     
                    
                   })}
                 </List>
              }

              {
                !dataSetSearch &&
                <DataSetInfo handleDisplayDataSetInfo={handleDisplayDataSetInfo} selectedDatasetId={selectedDatasetId} selectedDatasetName={selectedDatasetName}/>
              }

            </DialogContent>
            <DialogActions>
              <Button onClick={props.handleClose}>Close</Button>
              <Button onClick={()=>{props.handleClose(); addCorespondingNode(); addCorespondingDataset()}}>Apply</Button>
            </DialogActions>
          
      </Dialog>
      </ThemeProvider>
    </div> 
  );
}

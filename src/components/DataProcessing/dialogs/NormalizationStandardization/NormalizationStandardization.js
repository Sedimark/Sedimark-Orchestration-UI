import React, {useState, useEffect} from 'react';
import styles from "./Normalization.css";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from "react-redux/es/hooks/useSelector";
import {DATASET_FETCH_DATASET_INFO , DATASET_FETCH_DATASET_SNIPPET} from "../../../../utils/apiEndpoints";
import {useDispatch} from 'react-redux';
import { Typography } from '@mui/material';
import {setNormalizationColumns,setStandardizationColumns} from "../../../../reducers/nodeSlice";
import { faTableColumns } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from "axios";


export default function NormalizationStandardization(props){

    const dispatch = useDispatch();
    const standarizationColumns = useSelector((state)=>state.standardizationColumns);
    const normalizationColumns = useSelector((state)=>state.normalizationColumns);
    const [datasetName, setDatasetName] = useState("");
    const [isLoadingId , setIsLoadingId] = useState(true);
    const [datasetId, setDatasetId] = useState(0);
    const [fetchedDatasetInfo, setFetchedDatasetInfo] = useState({});
    const [snippet, setSnippet] = useState([]);
    const [rows, setRows] = useState([]);
    const [checkedStandardization, setCheckedStandardization] = useState([]);
    const [checkedNormalization, setCheckedNormalization] = useState([]);
    const dataset = useSelector((state)=>state.selectedDataset);
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });
    const columns = [{field:"id", headerName:"ID", width:60},{field:"column_name", headerName:"Column Name", width:320},{field:"sample_data", headerName:"Sample Data", width:230}]

    const parseAndSetData = (data)=>{
      setDatasetName(data[0].dataset_name);
      setDatasetId(data[0].id);
      fetchDatasetInfo(data[0].id);
      fetchDatasetSnippet(data[0].id);
    }


    const parseAndSetRows = (data)=>{
      const sampleObj = data[0];
      const allColumns = Object.keys(sampleObj);
      const rowsData = [];
      let i = 1;
      for(const columnName of allColumns){
          const newObj = {
            id:i,
            column_name:columnName,
            sample_data:data[0][columnName]
          }
          i++;
          rowsData.push(newObj);
      }
      setRows(rowsData);
    } 

    
    const fetchDatasetInfo = (datasetId)=>{
        axios.get(DATASET_FETCH_DATASET_INFO(datasetId))
        .then(resp => {  setFetchedDatasetInfo(resp.data)})
        .catch(err => {console.log(err)})
      }
  
      const fetchDatasetSnippet = (datasetId) =>{
        axios.get(DATASET_FETCH_DATASET_SNIPPET(datasetId))
        .then(resp => { setSnippet(resp.data); parseAndSetRows(resp.data);})
        .catch(err => {console.log(err)})
      }

      const handleToggleStandardization = (value) => () => {
        const currentIndex = checkedStandardization.findIndex((item,index) => {return item.column_name === value.column_name && item.sample_data === value.sample_data;});
        const newChecked = [...checkedStandardization];
    
        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
    
        setCheckedStandardization(newChecked);
      };

      const handleToggleNormalization = (value) => () => {
        const currentIndex = checkedNormalization.findIndex((item,index) => {return item.column_name === value.column_name && item.sample_data === value.sample_data;});
        const newChecked = [...checkedNormalization];
    
        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
    
        setCheckedNormalization(newChecked);
      };
    
    useEffect(()=>{
        parseAndSetData(dataset)
    },[dataset])

    
    const handleSelection = (dataset, processName)=>{
      if(processName == "Standardization"){
        const standardizationCols = [];
        for(const datasetId of dataset){
          standardizationCols.push(rows[datasetId-1]);
        }
        dispatch(setStandardizationColumns(standardizationCols));
      } else if(processName == "Normalization"){
        const normalizationCols = [];
        for(const datasetId of dataset){
          normalizationCols.push(rows[datasetId-1]);
        }
        dispatch(setNormalizationColumns(normalizationCols));
      } 
    }

    const handleDone = ()=>{
      dispatch(setNormalizationColumns(checkedNormalization));
      dispatch(setStandardizationColumns(checkedStandardization));

      props.handleClose();
    }


    useEffect(()=>{
      setCheckedStandardization(standarizationColumns);
    },[standarizationColumns])

    useEffect(()=>{
      setCheckedNormalization(normalizationColumns);
    },[normalizationColumns])


    return (
    <div>
        <ThemeProvider theme={darkTheme}>
          <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="300" fullWidth="true" >
    
               <DialogTitle>Select columns for Standardization and Normalization</DialogTitle>
                <DialogContent sx={{textAlign:'center'}}>   
                
                <Box sx={{ height: 400, width: '90%', margin:"auto",borderRadius:"5px" }}  bgcolor="black" >
                <p className="section-title">Standardization</p>
                <List dense sx={{ width: '100%', bgcolor: 'background.paper', marginTop:"10px",borderRadius:"5px", padding:"10px" }}>
                     <ListItem
                        key={"my-key"}
                        secondaryAction={
                          <div className='dataset-select-toolbox'>
                            <p>Select</p>
                          
                          </div>
                        }
                        disablePadding
                        sx={{
                         padding:"5px",
                         pointerEvents:"none"
                        }}
                      >
                        <ListItemButton>
                          
                          <ListItemText  id={'fd3432'}  disableTypography
                          primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>Column Name</Typography>} />
                        </ListItemButton>
                      </ListItem>
                   {rows.map((value) => {
                     const labelId = `checkbox-list-secondary-label-${value}`;
                     
                      return (
                        <ListItem
                          key={value.id}
                          secondaryAction={
                            <div className='dataset-select-toolbox'>
                              <Checkbox
                                edge="end"
                                onChange={handleToggleStandardization(value)}
                                checked={checkedStandardization.find(item => {return item.column_name === value.column_name && item.sample_data === value.sample_data;})}
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                              
                            </div>
                          }
                          disablePadding
                        > 
                          <ListItemButton>
                            <ListItemAvatar>
                              <p className='select-dialog-list'><FontAwesomeIcon icon={faTableColumns}/></p> 
                            </ListItemAvatar>
                            <ListItemText  id={labelId}  disableTypography
                            primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>{value.column_name}</Typography>} />
                          </ListItemButton>
                        </ListItem>
                      );
                     
                   })}
                 </List>
                 </Box>
                 
                 
                 <Box sx={{ height: 400, width: '90%', margin:"auto",borderRadius:"5px" ,marginTop:"480px"}}  bgcolor="black" >
                 <p className="section-title">Normalization</p>
                <List dense sx={{ width: '100%', bgcolor: 'background.paper', marginTop:"10px",borderRadius:"5px", padding:"10px" }}>
                    <ListItem
                        key={"my-key"}
                        secondaryAction={
                          <div className='dataset-select-toolbox'>
                            <p>Select</p>
                          
                          </div>
                        }
                        disablePadding
                        sx={{
                         padding:"5px",
                         pointerEvents:"none"
                        }}
                      >
                        <ListItemButton>
                          
                          <ListItemText  id={'fd3432'}  disableTypography
                          primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>Column Name</Typography>} />
                        </ListItemButton>
                      </ListItem>
                   {rows.map((value) => {
                     const labelId = `checkbox-list-secondary-label-${value}`;
                     
                      return (
                        <ListItem
                          key={value.id}
                          secondaryAction={
                            <div className='dataset-select-toolbox'>
                              <Checkbox
                                edge="end"
                                onChange={handleToggleNormalization(value)}
                                checked={checkedNormalization.find(item => {return item.column_name === value.column_name && item.sample_data === value.sample_data;})}
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                              
                            </div>
                          }
                          disablePadding
                        > 
                          <ListItemButton>
                            <ListItemAvatar>
                              <p className='select-dialog-list'><FontAwesomeIcon icon={faTableColumns}/></p> 
                            </ListItemAvatar>
                            <ListItemText  id={labelId}  disableTypography
                            primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>{value.column_name}</Typography>} />
                          </ListItemButton>
                        </ListItem>
                      );
                     
                   })}
                 </List>
                 </Box>
                </DialogContent>

                <DialogActions>
                  <Button onClick={props.handleClose}>Close</Button>
                  <Button onClick={()=>{handleDone()}}>Done</Button>
                </DialogActions>
              
          </Dialog>
          </ThemeProvider>
        </div> 
      );
}
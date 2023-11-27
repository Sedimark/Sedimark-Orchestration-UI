import React, {useState, useEffect} from 'react';
import styles from "./Imputation.css";
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptopCode } from '@fortawesome/free-solid-svg-icons';
import { Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from "react-redux/es/hooks/useSelector";
import {DATASET_FETCH_DATASET_INFO , DATASET_FETCH_DATASET_SNIPPET} from "../../../../utils/apiEndpoints";
import axios from "axios";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import {useDispatch} from 'react-redux';
import { setImputationAlgs, setConstantValueImputationColumns, setStoredConstantValueImputationValues } from '../../../../reducers/nodeSlice';
import { faTableColumns } from '@fortawesome/free-solid-svg-icons';



export default function Imputation(props){
    const dispatch = useDispatch();
    const imputationAlgs = useSelector((state)=>{return state.imputationAlgs});
    const constant_value_imputation_columns = useSelector((state)=>{return state.constant_value_imputation_columns});
    const constant_value_imputation_values = useSelector((state)=>{return state.constant_value_imputation_values});
    const [datasetName, setDatasetName] = useState("");
    const [isLoadingId , setIsLoadingId] = useState(true);
    const [datasetId, setDatasetId] = useState(0);
    const [fetchedDatasetInfo, setFetchedDatasetInfo] = useState({});
    const [snippet, setSnippet] = useState([]);
    const [constValueImputationView, setConstantValueImputationView] = useState(false);

    const [checked, setChecked] = React.useState([]);
    const [rows, setRows] = useState([]);
    const [constantValueImputationRows, setConstantValueImputationRows] = useState([]);
    const [checkedConstantValue, setCheckedConstantValue] = useState([]);
    const [constantValueImputationValues, setConstantValueImputationValues] = useState([]);
    const [initialRender, setInitialRender] = useState(true);

    const dataset = useSelector((state)=>state.selectedDataset);

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
      [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
      },
      [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
      },
    }));
    
    const StyledTableRow = styled(TableRow)(({ theme }) => ({
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:last-child td, &:last-child th': {
        border: 0,
      },
    }));

    
    
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });
    const columns = [{field:"id", headerName:"ID", width:60},{field:"column_name", headerName:"Column Name", width:320},{field:"sample_data", headerName:"Sample Data", width:230}]
    const allImputationAlgs = ["KNN Imputation","Constant Value Imputation"];
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

      const enableViewBasedOnSelection = (selectedAlg)=>{
        if(selectedAlg == "KNN Imputation"){
          dispatch(setImputationAlgs(["KNN Imputation"]));
          setConstantValueImputationView(false);
          
          dispatch(setConstantValueImputationColumns([]))
        }
        else if(selectedAlg == "Constant Value Imputation"){
            setConstantValueImputationView(true);
            
            dispatch(setImputationAlgs(["Constant Value Imputation"]));
            dispatch(setConstantValueImputationColumns([]))
        } else {
          setConstantValueImputationView(false);
         
          dispatch(setImputationAlgs([]));
          dispatch(setConstantValueImputationColumns([]))
        }
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
        enableViewBasedOnSelection(newChecked[0]);
        setChecked(newChecked);
      };

      const handleToggleConstVal = (value) => () => {
        const currentIndex = checkedConstantValue.findIndex((item,index) => {return item.column_name === value.column_name && item.sample_data === value.sample_data;});
        const newChecked = [...checkedConstantValue];
        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
        setCheckedConstantValue(newChecked);
        dispatch(setConstantValueImputationColumns(newChecked));
        const constValsImputation = constantValueImputationValues;
        for(const val in newChecked.length){
          constValsImputation.push("");
        }
        
        setConstantValueImputationValues(constValsImputation);
      };

      const handleDone = ()=>{
        props.handleClose();
      }

      const updateConstValue = (evt,index)=>{
        const storedValues = [...constantValueImputationValues];
        storedValues[index] = evt.target.value;
        
        setConstantValueImputationValues(storedValues);      
     }

     const submitTheNewValues = ()=>{
      dispatch(setStoredConstantValueImputationValues(constantValueImputationValues));
     }
 
      useEffect(()=>{
        parseAndSetData(dataset);
      },[dataset])

      useEffect(()=>{
        setChecked(imputationAlgs);
       
        if(imputationAlgs == "Constant Value Imputation"){
         
          setConstantValueImputationView(true);
        } 
      },[imputationAlgs])

      useEffect(()=>{
        setCheckedConstantValue(constant_value_imputation_columns);
      },[constant_value_imputation_columns])

    useEffect(()=>{
      if (initialRender) {
        setConstantValueImputationValues(constant_value_imputation_values);
        setInitialRender(false);
      } 
  
    },[constant_value_imputation_values])

    return (
    <div>
        <ThemeProvider theme={darkTheme}>
          <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="300" fullWidth="true" >
               <DialogTitle>Imputation</DialogTitle>
                <DialogContent sx={{textAlign:'center'}}>
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
                          primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}> Imputation algorithm</Typography>} />
                        </ListItemButton>
                      </ListItem>
                   {allImputationAlgs.map((value,index) => {
                     const labelId = `checkbox-list-secondary-label-${value}`;
                     
                      return (
                        <ListItem
                          key={index} 
                          secondaryAction={
                            <div className='dataset-select-toolbox'>
                              <Checkbox
                                edge="end"
                                onChange={handleToggle(value)}
                                checked={checked.indexOf(value) !== -1}
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                            </div>
                          }
                          disablePadding
                        > 
                          <ListItemButton>
                            <ListItemAvatar>
                                <p className='select-dialog-list'><FontAwesomeIcon icon={faLaptopCode}/></p> 
                            </ListItemAvatar>
                            <ListItemText  id={labelId}  disableTypography
                            primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>{value}</Typography>} />
                          </ListItemButton>
                        </ListItem>
                      );
                    
                   })}
                 </List> 

                 {constValueImputationView && 
                 <div className='section'>
                    <h1>Constant Value Imputation</h1>
                    <Box sx={{ height: 400, width: '90%', margin:"auto",borderRadius:"5px" }}  bgcolor="black" >
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
                                  onChange={handleToggleConstVal(value)}
                                  checked={checkedConstantValue.find(item => {return item.column_name === value.column_name && item.sample_data === value.sample_data;})}
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
                  <div>
                    {checkedConstantValue.map((val, index)=>{
                      return(
                      <div className='select-box'>
                      <p>{val.column_name}</p>
                        <div>
                          <input className='const-val-input' value={constantValueImputationValues[index]} onChange={(evt)=>updateConstValue(evt,index)}  placeholder='Insert value'/>
                        </div>
                        
                        </div>
                      );
                    })}
                      <Button variant="outlined" onClick={()=>{submitTheNewValues()}}>SUBMIT</Button>
                  </div>
                  </Box>
                 </div>
                 }
                 
                
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


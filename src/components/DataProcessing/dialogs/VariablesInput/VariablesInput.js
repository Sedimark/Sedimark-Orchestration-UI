import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { styled } from '@mui/system';
import styles from "./VariablesInput.css";
import toast, { Toaster } from 'react-hot-toast';
import {useDispatch} from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from "react-redux/es/hooks/useSelector";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import { faBoxOpen, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FETCH_MINIO_FILE } from '../../../../utils/apiEndpoints';
import {
  Unstable_NumberInput as BaseNumberInput,
  numberInputClasses,
} from '@mui/base/Unstable_NumberInput';

import { setBlocksVariables } from '../../../../reducers/nodeSlice';
import axios from "axios";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
 



export default function VariablesInput(props){

    const dispatch = useDispatch();
    const pipelineProcessing = useSelector((state)=>state.selectedPipelineDataPreprocessing);
    const pipelineTrain = useSelector((state)=>state.selectedPipelineTrain);
    const activeTab = useSelector((state)=> state.selectedView);
    const isDataFetching = useSelector((state)=>state.is_data_fetching);
    const datasetColumns = useSelector((state)=> state.dataset_columns);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [columns, setColumns] = useState([]);
    const [variableValues, setVariableValues] = useState([]);
    const [variablesInput, setVariablesInput] = useState({});
    const [nodeNameId, setNodeNameId] = useState();
    const [columnNames, setColumnNames] = useState([]);
    const [wasSomethingChanged, setWasSomethingChanged] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState("");
    const [variablesPresent, setVariablesPresent] = useState(true);
    const [areMultipleVariables, setAreMultipleVariables] = useState(false);
    const [purifiedVariables, setPurifiedVariables] = useState([]);
    let blocksVariablesStored = useSelector((state)=> state.blocksVariables);
    const updateObjectInArray = (arr, newObj)=>{
      const indexToUpdate = arr.findIndex(obj => obj.variable_name === newObj.variable_name);
      if (indexToUpdate !== -1) {
        return arr.map((obj, index) => (index === indexToUpdate ? newObj : obj));
      } else {
        return [...arr, newObj];
      }
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
      setColumnNames(allColumnNames);
    } 

    const fetchAndParseMinioJson = async (bucket_name) => {

      setIsDataLoading(true);
      let jsonFileLink;
      let jsonFileData;
      
      const zaParsed = parseBucketName(bucket_name[0])

      try{
          jsonFileLink = await axios.get(FETCH_MINIO_FILE(zaParsed));
          jsonFileLink = jsonFileLink.data.url;
          
      } catch(err){
          console.log(err);
          setIsDataLoading(false);
          blockAlert("There was an error while fetching the columns!!");
          return;
      }
      
      try{
          jsonFileData = await axios.get(jsonFileLink);
          parseAndSetColumnNames(jsonFileData.data);
          setIsDataLoading(false);
      } catch(err){
          blockAlert("There was an error while fetching the columns!!");
          setIsDataLoading(false);
          console.log(err);
      }
    };



    const handleChangeNumber = (variableName, event, type)=>{
      const { target: { value } } = event;
      if (!isNaN(value)) {
        const newValue = {...variablesInput};
          newValue[variableName] = value;
        setVariablesInput(newValue);
      }

      let inputedValuesVariables = [...variableValues];
      let objToStore = {
        block_name:props.fullNodeName,
        variable_name:variableName,
        value:value,
        type:type
      }

      inputedValuesVariables = updateObjectInArray(inputedValuesVariables, objToStore);
      setVariableValues(inputedValuesVariables);
      
    }

    const handleChange = (event, type, variableName) => {
    
      const { target: { value } } = event;
      let inputedValuesVariables = [...variableValues];
      let objToStore = {
        block_name:props.fullNodeName,
        variable_name:variableName,
        value:value,
      }
  
      const newValue = {...variablesInput};
      newValue[variableName] = value;
      setVariablesInput(newValue);
      inputedValuesVariables = updateObjectInArray(inputedValuesVariables, objToStore);
      setVariableValues(inputedValuesVariables);
      
    };

    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });

    const parseAndSet = (oldValues,newValues)=>{
      let parsedArray = [];
       for(const value of oldValues){
        if(value.block_name !== props.fullNodeName){
            parsedArray.push(value);
        }
       }
    
       parsedArray = [...parsedArray, ...newValues];
       return parsedArray;
    }

    const blockAlert = (msg) => {
      toast.error(msg, {
          duration: 2000,
          position: 'top-right',
      })
    }; 
    
    const createObjToStore = ()=>{
      
      let inputedValuesVariables = [...variableValues];
      let objToStore;
      for(const key in variablesInput){
         objToStore = {
          block_name:props.fullNodeName,
          variable_name:key,
          value:variablesInput[key],
          nodeId:nodeNameId,
          pipelineName:selectedPipeline
        }
        inputedValuesVariables = updateObjectInArray(inputedValuesVariables, objToStore);
        setVariableValues(inputedValuesVariables);
      }
    
      blocksVariablesStored = parseAndSet(blocksVariablesStored, inputedValuesVariables);
      
      dispatch(setBlocksVariables(blocksVariablesStored)); 
    }

    const handleDone = ()=>{
        props.handleClose();
        createObjToStore();
           
    }

    const convertToSnakeCase = (inputString)=>{
      let lowercaseString = inputString.toLowerCase();
      let snakeCaseString = lowercaseString.replace(/\s+/g, '_');
       return snakeCaseString;
    }

   useEffect(()=>{
    if(isDataFetching == false){
      setIsDataLoading(false);
    } else {
      setIsDataLoading(true);
    }
   },[isDataFetching])

   useEffect(()=>{
    setColumns(datasetColumns);
   },[datasetColumns])


   const createVariableInputObjects = (data, storedVars)=>{
    
      const obj = {...variablesInput};
      for(const value of data){
        if(value.type == "multiple_selection"){
          obj[value.varName] = [];
        } else if(value.type == "number"){
          obj[value.varName] = "";
        } else {
          obj[value.varName] = "";
        }
      }

    let foundBlocks = [];
    for(const block of storedVars){
       if(block.block_name == props.fullNodeName){
         foundBlocks.push(block);
       }
     }

     if(foundBlocks.length != 0){
      for(const block of foundBlocks){
        obj[block.variable_name] = block.value;
      }
     }
      setVariablesInput(obj);
   }

   const retrievePipelineBasedOnTab = (the_active_tab)=>{
  
      if(the_active_tab == 1){
        setSelectedPipeline(pipelineProcessing);
      } else {
        setSelectedPipeline(pipelineTrain);
      }
   }

   const parsePhantomVariables = ()=>{
      let phantomVariable = false;
      const allBlockVariables = [];

     for(const varInstance of props.variablesData){
        if(varInstance.type && (varInstance.type == "string" || varInstance.type == "number" || varInstance.type == "multiple_selection"))
        {
          allBlockVariables.push(varInstance);
        } 

        if(varInstance.type == "multiple_selection"){
          setAreMultipleVariables(true);
        }

     }
     
     setPurifiedVariables(allBlockVariables);
     if(allBlockVariables.length == 0){
      setVariablesPresent(false);
     }
     
   }

   
   useEffect(()=>{
      createVariableInputObjects(props.variablesData, blocksVariablesStored); 
   },[blocksVariablesStored])
  

   useEffect(()=>{
    setNodeNameId(convertToSnakeCase(props.fullNodeName));
    
   },[]) 

   useEffect(()=>{
    retrievePipelineBasedOnTab(activeTab);
   },[activeTab])

   useEffect(()=>{ 

    if(selectedPipeline.length !=0 && areMultipleVariables){
      fetchAndParseMinioJson(selectedPipeline);
    }
   },[selectedPipeline, areMultipleVariables])


   useEffect(()=>{
     parsePhantomVariables();
   },[])


    return (
    <div>
      <ThemeProvider theme={darkTheme}>
      <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="lg" fullWidth="true" >
    
            <DialogTitle> {props.fullNodeName} </DialogTitle>
            <DialogContent sx={{textAlign:'center'}}>   
            <Box sx={{ height: "120%", width: '90%', margin:"auto",borderRadius:"5px" }}  bgcolor="#000" >
            {!isDataLoading && 
              <>
              <div className='section-title'>
                    <h1>Variables</h1>
                </div>  
                {purifiedVariables.map((value, index)=>{
                  if(value.type == "string"){
                    return(
                    <FormControl key={index} sx={{ marginBottom: "40px", width: "60%" }}>
                      <TextField value={variablesInput[value.varName] || ''}  onChange={(event)=>{ setWasSomethingChanged(true); handleChange(event,"text",value.varName)}} id={`outlined-basic-${index}`} label={`${value.varName}`} variant="outlined" />
                       {value["description"] && <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> {value["description"]} </div> } 
                    </FormControl>
                    
                    );
                    
                  } else if(value.type == "number"){
                    
                    return(
                    <FormControl key={index} sx={{ marginBottom: "30px", width: "60%" }}>
                      <FormHelperText sx={{ fontSize:"1.1rem" }}>{value.varName}</FormHelperText>
                      <TextField
                        aria-label={`${value.varName}`}
                        placeholder="Type a number…"
                        value={variablesInput[value.varName]}
                        onChange={(event)=>{ setWasSomethingChanged(true); handleChangeNumber(value.varName,event,"number")}}
                      />
                      {value["description"] && <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> {value["description"]} </div> } 
                  </FormControl>
                    );

                  } else if(value.type == "multiple_selection"){
                    
                    return(
                      <FormControl key={index} sx={{ marginBottom: "40px", width: "60%" }}>
                          <InputLabel id="demo-multiple-checkbox-label">{`${value.varName}`}</InputLabel>
                          <Select
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            multiple
                            value={variablesInput[value.varName]}
                            onChange={(event)=>{ setWasSomethingChanged(true); handleChange(event,"multiple",value.varName)}}
                            input={<OutlinedInput label="Columns" />}
                            renderValue={(selected) => selected.join(', ')}
                            MenuProps={MenuProps}
                          >
                            {(columnNames || []).map((column) => (
                              <MenuItem key={column} value={column}>
                                <Checkbox checked={variablesInput[value.varName].indexOf(column) > -1} />
                                <ListItemText primary={column} />
                              </MenuItem>
                            ))}
                          </Select>
                          {value["description"] && <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> {value["description"]} </div> } 
                      </FormControl>
                    );
                  }
                })}
                </>
              } 
              {
                isDataLoading &&
                <div className='data-loading-container'>
                  <div className="loading-circle-container">
                      <div className="loading-circle"></div>
                      <p className="loading-text">Loading...</p>
                  </div>
                </div>
              }
              {
                  !variablesPresent &&
                  <div className='no-variables-info-container'>
                    <FontAwesomeIcon icon={faBoxOpen} className='empty-node-container' /> 
                     <p> There are no variables present</p>
                  </div>
              }
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={props.handleClose}>Close</Button>
              <Button  disabled={!wasSomethingChanged} onClick={()=>{handleDone()}}>Done</Button>
            </DialogActions>
        </Dialog>
      </ThemeProvider>
    </div> 
      );
}



const blue = {
  100: '#DAECFF',
  200: '#80BFFF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};


const StyledInputRoot = styled('div')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  display: grid;
  grid-template-columns: 1fr 19px;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;
  column-gap: 8px;
  padding: 4px;

  &.${numberInputClasses.focused} {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
  }

  &:hover {
    border-color: ${blue[400]};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledInputElement = styled('input')(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  grid-column: 1/2;
  grid-row: 1/3;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: inherit;
  border: none;
  border-radius: inherit;
  padding: 8px 12px;
  outline: 0;
`,
);

const StyledButton = styled('button')(
  ({ theme }) => `
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  appearance: none;
  padding: 0;
  width: 19px;
  height: 19px;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1;
  box-sizing: border-box;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 0;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    cursor: pointer;
  }

  &.${numberInputClasses.incrementButton} {
    grid-column: 2/3;
    grid-row: 1/2;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border: 1px solid;
    border-bottom: 0;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }

  &.${numberInputClasses.decrementButton} {
    grid-column: 2/3;
    grid-row: 2/3;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border: 1px solid;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }
  & .arrow {
    transform: translateY(-1px);
  }
`,
);


import React, {useState, useEffect, useRef} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { styled } from '@mui/system';
import styles from "./VariablesInput.css";
import toast from 'react-hot-toast';
import {useDispatch} from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from "react-redux/es/hooks/useSelector";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import {  IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { faBoxOpen, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { FETCH_MINIO_FILE, FETCH_PIPELINE_DATA } from '../../../../utils/apiEndpoints';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  Unstable_NumberInput as BaseNumberInput,
  numberInputClasses,
} from '@mui/base/Unstable_NumberInput';
import formatName from '../../../../utils/formatName';
import { setBlocksVariables, setLinkedTabToDelete, setPipelinesBlocks, setTabIndex, setAllTabs, setSelectedTab, setSelectedView } from '../../../../reducers/nodeSlice';
import {checkAndFormat} from "../../../../utils/checkAndFormat";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // Import the UTC plugin
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
 

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff', // Thumb color when checked (usually white)
      '& + .MuiSwitch-track': {
        backgroundColor: '#2196f3', // Blue for light mode when checked (Material Blue 500)
        opacity: 1,
        border: 0,
        ...theme.applyStyles('dark', {
          backgroundColor: '#1976d2', // Darker blue for dark mode when checked (Material Blue 700)
        }),
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#2196f3', // Blue for focus visible thumb (Material Blue 500)
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[100],
      ...theme.applyStyles('dark', {
        color: theme.palette.grey[600],
      }),
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
      ...theme.applyStyles('dark', {
        opacity: 0.3,
      }),
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#E9E9EA', // Unchecked track color (light grey, common for off state)
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
    ...theme.applyStyles('dark', {
      backgroundColor: '#39393D', // Unchecked track color for dark mode (dark grey)
    }),
  },
}));


export default function VariablesInput(props){

    const dispatch = useDispatch();
    const dateFieldRef = useRef(null);
    const [defaultDate, setDefaultDate] = useState("");
    const [isDateOk, setIsDateOk] = useState(false);
    //** Data related to pipeline names */
    const storedPipelineBlocks = useSelector((state)=> state.pipelinesBlocks);
    const allTabs = useSelector((state)=> state.allTabs);
    const tabIndexStored = useSelector((state)=> state.tabIndex);
    const storedPipelinesBlockInfo = useSelector((state)=> state.pipelinesBlocks);
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
    const [dropdownValues, setDropDownValues] = useState({});
    const [rulesForVariables, setRulesForVariables] = useState({});
    const [hasInputError, setHasInputError] = useState({});
    const [formHasError, setFormHasError] = useState(false);
    const [hasDate, setHasDate] = useState(false);
    const [showPassword, setShowPassword] = useState({});
    const [allEmptyFields, setAllEmptyFields] = useState(false);
    const [hasTriggerVar, setHasTriggerVar] = useState(false);
    const [linkedPipeline, setLinkedPipeline] = useState("");
    const [pipelineType , setPipelineType] = useState("");
    const [parentPipeline, setParentPipeline] = useState("");
    const [pipelineLinkedInitialValue, setPipelineLinkedInitialValue] = useState("");
    const [variableNameTrigger, setVariableNameTrigger] = useState("");
    const storedVariables = useSelector((state)=>state.blocksVariables);
    

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
      const rule = rulesForVariables[variableName];
      
      if(rule){
        const errMonitor = {...hasInputError};
        const parsedNumber = Number.parseInt(value);
        if(parsedNumber < rule.min_value || parsedNumber > rule.max_value){
          errMonitor[variableName] = true;
          setHasInputError(errMonitor);
          return;
        } else {
          errMonitor[variableName] = false;
        }
        setHasInputError(errMonitor);
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

    function removeSlashesFromRegexString(regexString) {
      
      if (regexString.startsWith('/')) {
        regexString = regexString.substring(1);
      }
  
      if (regexString.endsWith('/')) {
        regexString = regexString.substring(0, regexString.length - 1);
      }
    
      return regexString;
    }

    const handleChange = (event, type, variableName) => {

      let { target: { value } } = event;
  
      if(type === "text"){
        
        if(rulesForVariables[variableName]){
          const rule = removeSlashesFromRegexString(rulesForVariables[variableName]);
        
          const newRegExpRule = new RegExp(rule);
          const errMonitor = {...hasInputError};

          if(value.length != 0){
            if(!newRegExpRule.test(value)){
              errMonitor[variableName] = true;
              setHasInputError(errMonitor);
              
            } else {
              errMonitor[variableName] = false;
            }
            setHasInputError(errMonitor);
    
          } else {
            errMonitor[variableName] = false;
            setHasInputError(errMonitor);
          }
        }

      } 

      // if it is boolean we need to pick up the value from checked
      // not from other things 

     if(type == "boolean"){
        setWasSomethingChanged(true);
        value = event.target.checked;
     }
    
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


  const getPipelineName = ()=>{
    for(const [key, value] of Object.entries(storedPipelinesBlockInfo)){
        if(key == formatName(props.fullNodeName)){
          return value.pipeline_name;
        }
    }
      return "";
  }
   


    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });

    const parseAndSet = (oldValues,newValues)=>{

      

      let parsedArray = [];
       for(const value of oldValues){
        if(value.block_name !== props.fullNodeName || value.tabName !== props.tabName){
            parsedArray.push(value);
        }
      }

      const parsedNewValues = [];
      for(const val of newValues){
        if(val["value"].length !== 0){
          parsedNewValues.push(val);
        }
      }
      

       parsedArray = [...parsedArray, ...parsedNewValues];
       return parsedArray;
    }

    const blockAlert = (msg) => {
      toast.error(msg, {
          duration: 2000,
          position: 'top-right',
      });
    }; 
    
    
    const createObjToStore = ()=>{
      
      
      let inputedValuesVariables = [...variableValues];
      let objToStore;

      let pipelineName = "";
    
      for(const [key, value] of Object.entries(storedPipelinesBlockInfo)){
        if(key == formatName(props.fullNodeName)){
          pipelineName = value.pipeline_name;
          break;
        }
      }

      setParentPipeline(pipelineName);
      
      for(const key in variablesInput){

         objToStore = {
          block_name:props.fullNodeName,
          variable_name:key,
          value:variablesInput[key],
          nodeId:nodeNameId,
          pipelineName:pipelineName,
          tabName:props.tabName
        }
    
        // here the object in the final objects array needs to be updated
        // to do that we have to find it and update it with the new value
        inputedValuesVariables = updateObjectInArray(inputedValuesVariables, objToStore);
        setVariableValues(inputedValuesVariables);
      }
      
      blocksVariablesStored = parseAndSet(blocksVariablesStored, inputedValuesVariables);
      dispatch(setBlocksVariables(blocksVariablesStored)); 
      
    }

     
    const blockNotifyError = (text)=>{
        toast.error(text);
    }


    const closeTab = (tabInfo)=>{
        
        const fullTabInfo = allTabs.find(item=>item.name === tabInfo["name"]);
        const newTabIndexes = tabIndexStored.filter( tab => tab !== fullTabInfo.tabOrder);
        dispatch(setTabIndex(newTabIndexes));
        const newTabArr = allTabs.filter(item=>item.name !== tabInfo["name"]);
        const newVariables = blocksVariablesStored.filter(item=>  item.tabName !== fullTabInfo.name);
        
        let pipelineName = "";
    
        for(const [key, value] of Object.entries(storedPipelinesBlockInfo)){
          if(key == formatName(props.fullNodeName)){
            pipelineName = value.pipeline_name;
            break;
          }
        }

        sessionStorage.removeItem(`${fullTabInfo.tabOrder}-${pipelineName}-runData`);
        sessionStorage.removeItem(`${fullTabInfo.tabOrder}-${pipelineName}-running-steps`);
        dispatch(setBlocksVariables(newVariables));
    
        dispatch(setAllTabs(newTabArr));
        if(newTabArr.length > 0){
          // setSelectedTabHere(newTabArr[0]);
          dispatch(setSelectedView(newTabArr[0]));
        } else {
          dispatch(setTabIndex(null));
        }
     
    }


    const fetchAndSaveBlockNames = async(pipeline_name , newTabName )=>{
        
          let pipeline_blocks;
          
          try{
            const resp = await axios.get(FETCH_PIPELINE_DATA(pipeline_name));
            pipeline_blocks = resp.data.pipeline.blocks;
    
          } catch(err){
            console.log(err);
            blockNotifyError("There was an error while fetching the pipeline");
            return false;
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
    
          return true;
    }

  
    const handleSpawnPipeline = async()=>{
        

        // we check to see if there was made a change to the variable variableNameTrigger
        //if yes it means that the function that changes the name of the trigger function
        // was called and indeed it means that it was updated

        if (variableNameTrigger == ""){
          // no updates to the linked pipeline dropdown menu
          return;
        }

        // we check to see if the old value matches the new value
        // we iterate over old values , values that are stored
       
        // check if the new_value matches the old value
        let oldLinkedValue;
        for(const block of blocksVariablesStored){
          if (block["variable_name"] == variableNameTrigger){
             oldLinkedValue = block["value"];
             if(linkedPipeline === block["value"]){
              // here it means that it was triggered at some point but the final value is the same
              // with the old value, no need to update the pipeline in this scenario
              return;
             }
          }
        }

        let storedAllTabs = allTabs;
        //check if there is already a tab spawned 
        // to check if a pipeline is already spawned you need to check the parent pipeline
        // and take a look at the old pipeline
        //we iterate and check
        // oldLinkedValue - the value of the old pipeline selected

        // logic for deleting the old tab and spawning a new one with the new variable name
        let pipelineName = "";
    
        for(const [key, value] of Object.entries(storedPipelinesBlockInfo)){
          if(key == formatName(props.fullNodeName)){
            pipelineName = value.pipeline_name;
            break;
          }
        }


        //first we find the tab
        let tabToDelete ;
        for(const tab of allTabs){
          if(tab["parentPipeline"] === pipelineName && tab["pipelineName"] === oldLinkedValue ){
              //we delete the pipeline and then 
              tabToDelete = tab; 
          }
        }

        // now we delete the tab
        // if there is a tab found then we delete it 
        // if not we move forward
                
        if(tabToDelete){
          dispatch(setLinkedTabToDelete(tabToDelete.name));
        }
      
        // logic for creating a new tab

        let pipeline = linkedPipeline; 

        // Initialize newTabs
        let newTabs = storedAllTabs ? [...storedAllTabs] : [];


        // remove the tab that is going to be deleted
        if(tabToDelete){
          // we remove the tab that is going to be deleted 
          // because the operation is async and it takes time till it gets 
          //deleted 

          newTabs = newTabs.filter(item => item.name !== tabToDelete.name )
        }
        

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
              "name": `${pipeline}-${pipelineName}`,
              "parentPipeline": pipelineName,
              "pipelineName": pipeline,
              "pipelineType": pipelineType,
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
  
          
          
          // setTimeout(()=>{
          //   const filteredVariables = storedVariables.filter(variable => 
          //     !(variable["pipelineName"] && variable["pipelineName"][0] === pipeline)
          //   );
          //   dispatch(setBlocksVariables(filteredVariables));
          // },500)
          

    }

    const handleDone = ()=>{
        if(hasTriggerVar){
            handleSpawnPipeline();
          }
        props.handleClose();
        createObjToStore();
        
    } 

    const convertToSnakeCase = (inputString)=>{
      let lowercaseString = inputString.toLowerCase();
      let snakeCaseString = lowercaseString.replace(/\s+/g, '_');
       return snakeCaseString;
    }

   useEffect(()=>{
    if(isDataFetching === false){
      setIsDataLoading(false);
    } else {
      setIsDataLoading(true);
    }
   },[isDataFetching])

   useEffect(()=>{
    setColumns(datasetColumns);
   },[datasetColumns])


   useEffect(()=>{
    
    if(Object.keys(variablesInput).length > 0){
      
      for(const key of Object.keys(variablesInput)){
          if(typeof variablesInput[key] === "string" && variablesInput[key].length!==0 ){
            setAllEmptyFields(false);
            return;
          } else if(Array.isArray(variablesInput[key]) && variablesInput[key].length!==0){
            setAllEmptyFields(false);
            return;
          } 
      }
      setAllEmptyFields(true);
    }

   },[variablesInput])

   const createVariableInputObjects = async(data, storedVars)=>{
    
      const obj = {...variablesInput};
      const errorMonitorObj = {};
  
      for(const value of data){
      
        if(value.type === "multiple_selection"){

          if(value.default){
            obj[value.varName] = [value.default];
          } else {
            obj[value.varName] = [];
          }
          
          errorMonitorObj[value.varName] = false;
        } else if (value.type === "drop_down" || value.type === "trigger" ) {
          
          if(value.default){
            obj[value.varName] = [value.default];
          } else {
            obj[value.varName] = [];
          }

          let updatedDropdownValues = dropdownValues;
          updatedDropdownValues[value.varName]  = value["values"];
          setDropDownValues(updatedDropdownValues);
          errorMonitorObj[value.varName] = false;
            
            //setare valoare initiala pentru a verifica ulterior daca s-a schimbat
            // si daca s-a schimbat atunci cande vei salva valorile noi o sa stergi
            // pipeline-ul vechi si o sa il spawnezi pe unul nou ...

            
            if (value.type === "trigger"){
              setHasTriggerVar(true);
            }

        } else if(value.type === "number" || value.type === "int"){
            
            if(value.default){
            obj[value.varName] = `${value.default}`;
            } else {
              obj[value.varName] = "";
            }

            if(value.range){
              const newRules = rulesForVariables;
              newRules[value.varName] = value.range;
              setRulesForVariables(newRules);
            }
            errorMonitorObj[value.varName] = false;
        } else if(value.type === "string" || value.type === "str" || value.type === "secret" ){
                obj[value.varName] = "";

                if(value.default){
                obj[value.varName] = `${value.default}`;
                } else {
                  obj[value.varName] = "";
                }

                if(value.regex){
                  const newRules = rulesForVariables;
                  newRules[value.varName] = value.regex;
                  setRulesForVariables(newRules);
                }
                errorMonitorObj[value.varName] = false;

        } else if(value.type === "boolean"){
              
                obj[value.varName] = false;

                if(value.default){
                obj[value.varName] = value.default;
                } else {
                  obj[value.varName] = false;
                }

          errorMonitorObj[value.varName] = false;
                
        } else if(value.type === "date"){
          obj[value.varName] = [];
          
            if(value.default){
                  obj[value.varName] = [value.default];
            } else {
                  obj[value.varName] = [];
            }

          errorMonitorObj[value.varName] = false;
        }
      }
     
   // we search for the blocks that have stored values
   // like when we set up a value for a block this value for the block is saved in redux
   // and then afterwards the value will be fetched from redux store and it will be 
   // passed to the actual variable 

   
    let foundBlocks = [];
    // here we search for the specific block 
    for(const block of storedVars){
       if(block.block_name === props.fullNodeName && block.tabName === props.tabName){
         foundBlocks.push(block);
       }
     }
     // if there are blocks found we plug the value for the specific variable
    
     if(foundBlocks.length != 0){
      for(const block of foundBlocks){

        obj[block.variable_name] = block.value;
      }
     }

      setVariablesInput(obj);
      setHasInputError(errorMonitorObj);
   }

   const parsePhantomVariables = ()=>{
      let phantomVariable = false;
      const allBlockVariables = [];
    
     for(const varInstance of props.variablesData){

        if(varInstance.type && (varInstance.type === "string" || varInstance.type === "str" || varInstance.type === "int" || varInstance.type === "secret" || varInstance.type === "number" || varInstance.type === "multiple_selection" || varInstance.type === "drop_down" || varInstance.type === "date" || varInstance.type === "trigger" || varInstance.type === "boolean" ))
        {
          allBlockVariables.push(varInstance);
        } 

        if(varInstance["tag"]){
          setPipelineType(varInstance["tag"]);
        }

        if(varInstance.type === "multiple_selection"){
          setAreMultipleVariables(true);
        }
        // here we store the type of pipeline block
        setPipelineType(varInstance);

     }


     setPurifiedVariables(allBlockVariables);
     if(allBlockVariables.length === 0){
      setVariablesPresent(false);
     }
     
   }

   function transformDateFormat(dateString) {
    const parts = dateString.split("-");
    parts[0] = parts[0].toLowerCase();
    parts[2] = parts[2].toLowerCase();
    
    const transformedString = parts.join(".");
    
    return transformedString;
  }

   const handleDateChange = (newValue, dateFormat, type, variableName) => {
    
    try{
      const newDateUtc = newValue.utc().toDate(); // Convert Dayjs object to UTC JavaScript Date

      // Define comparison dates as UTC Date objects for accurate comparison
      const endOf2099Utc = new Date("2100-01-01T00:00:00Z"); // Upper bound: start of 2100 UTC
      const januaryFirst1900Utc = new Date('1899-12-31T00:00:00Z'); // Lower bound: start of 1900 UTC

      // Format the newDateUtc into the desired string format: YYYY-MM-DDTHH:mm:ssZ
      // This replaces the need for `transformDateFormat` for this specific output.
      const parsedDate = format(newDateUtc, "yyyy-MM-dd'T'HH:mm:ss'Z'");

      // Perform validation using UTC timestamps for consistency
      const isNewDateAfter1900 = newDateUtc.getTime() >= januaryFirst1900Utc.getTime();
      const isNewDateBeforeOrEqualsCurrentDate = newDateUtc.getTime() <= endOf2099Utc.getTime();


      const errMonitor = {...hasInputError};
      const variableInput = {...variablesInput};

      setWasSomethingChanged(true);

      console.log("isNewDateBeforeOrEqualsCurrentDate:");
      console.log(isNewDateBeforeOrEqualsCurrentDate);

      if(!isNewDateBeforeOrEqualsCurrentDate){
        errMonitor[variableName] = true;
        return;
      } else {
        errMonitor[variableName] = false;
      } 
      setHasInputError(errMonitor);

     

      let inputedValuesVariables = [...variableValues];
      let objToStore = {
        block_name:props.fullNodeName,
        variable_name:variableName,
        value:parsedDate,
        type:type
      }
      

      variableInput[variableName] = parsedDate;
      setVariablesInput(variableInput);
      inputedValuesVariables = updateObjectInArray(inputedValuesVariables, objToStore);
      setVariableValues(inputedValuesVariables);
      setIsDateOk(true);

    } catch(err){
      
      setIsDateOk(false);
      console.log(err);
      hasInputError[variableName] = true;
    }
   
  };
   
   useEffect(()=>{
      createVariableInputObjects(props.variablesData, blocksVariablesStored); 
   },[blocksVariablesStored])
  

   useEffect(()=>{
    setNodeNameId(convertToSnakeCase(props.fullNodeName));
   },[]) 


   useEffect(()=>{ 

    if(selectedPipeline.length !=0 && areMultipleVariables){
      fetchAndParseMinioJson(selectedPipeline);
    }
   },[selectedPipeline, areMultipleVariables])


   useEffect(()=>{
     parsePhantomVariables();
   },[])

  useEffect(()=>{
  
  

  for (const key in hasInputError) {
    if (hasInputError.hasOwnProperty(key)) {
       if (hasInputError[key] === true){
          setFormHasError(true);
          return;
       }
    }
    setFormHasError(false);
  }

  },[hasInputError])

 

  const checkDateOk = (varName)=>{
    
    let wasFound = false;
    for(const blockVar of blocksVariablesStored){
      if(blockVar["variable_name"] === varName){
        wasFound = true;
      }
    }
    return wasFound;
  }

 useEffect(()=>{

  for(const variable_pur of purifiedVariables){
    if(variable_pur.type === "date"){
      setHasDate(true);
    }
    if(!checkDateOk(variable_pur.varName)){
      setIsDateOk(false);
      return;
    }
  }
   setIsDateOk(true);
   
 },[purifiedVariables])


 const selectPipelineBasedOnStoredData = ()=>{
 
    for(const [key, value] of Object.entries(storedPipelinesBlockInfo)){
      if(key == formatName(props.fullNodeName)){
        setSelectedPipeline(value);
      }
    }
 }

 const handleClickShowPassword = (index) => {
  setShowPassword(prevState => ({
    ...prevState,
    [index]: !prevState[index], // Schimbă vizibilitatea doar pentru câmpul curent
  }));
};

 useEffect(()=>{
  selectPipelineBasedOnStoredData();
 },[storedPipelinesBlockInfo])

  
  return (
    <div>
      <ThemeProvider theme={darkTheme}>
      <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="lg" fullWidth={true} >
    
            <DialogTitle> {props.fullNodeName} </DialogTitle>
            <DialogContent sx={{textAlign:'center'}} >   
            <Box sx={{ height: "140%", width: '100%', padding:"10px", margin:"auto",borderRadius:"5px" }}  bgcolor="#000" >
            {!isDataLoading && 
              <>
              <div className='section-title'>
                    <h1>Variables</h1>
                </div>  
                {purifiedVariables.map((value, index)=>{
                  
                  if(value.type === "string" || value.type === "str"){
                    return(
                    <FormControl key={index} sx={{ marginBottom: "40px", width: "60%" }}>
                      <TextField error = {hasInputError[value.varName]} value={variablesInput[value.varName] || ''}  onChange={(event)=>{ setWasSomethingChanged(true); handleChange(event,"text",value.varName)}} id={`outlined-basic-${index}`} label={`${value.varName}`} variant="outlined" />
                       {hasInputError[value.varName] && value["example"] && <div className='input-err-msg'>A correct name should look like this: {value["example"]}   </div>} 
                       {value["description"] && <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> {value["description"]} </div> } 
                    </FormControl>
                    
                    );
                  } else if(value.type === "boolean"){
                    

                    return(
                      <FormGroup sx={{ margin:"auto",  width: "60%", padding: "20px" }}> 
                          <div className='switch-var-container'>
                            <div>
                               <FormControlLabel control={<IOSSwitch  checked={variablesInput[value.varName]} onChange={(event)=>{ setWasSomethingChanged(true); handleChange(event,"boolean", value.varName )}}/>}/>
                               <b>{value.varName}</b>
                            </div>
                          </div>
                          {value["description"] && <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> {value["description"]} </div> } 
                      </FormGroup>
                    );
                  } else if(value.type === "secret"){
                    return(
                    <FormControl key={index} sx={{ marginBottom: "40px", width: "60%" }}>
                      <TextField
                        error={hasInputError[value.varName]}
                        value={variablesInput[value.varName] || ''}
                        onChange={(event) => {
                          setWasSomethingChanged(true);
                          handleChange(event, "text", value.varName);
                        }}
                        id={`outlined-basic-${index}`}
                        label={`${value.varName}`}
                        variant="outlined"
                        type={showPassword[index] ? 'text' : 'password'}  
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => handleClickShowPassword(index)}
                                edge="end"
                              >
                                {showPassword[index] ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {hasInputError[value.varName] && value["example"] && (
                        <div className='input-err-msg'>A correct name should look like this: {value["example"]}</div>
                      )}
                      {value["description"] && (
                        <div className='variable-description'>
                          <FontAwesomeIcon icon={faCircleInfo} /> {value["description"]}
                        </div>
                      )}
                    </FormControl>
                    );
                  }  else if(value.type === "number" || value.type === "int"){
                    
                    return(
                    <FormControl key={index} sx={{ marginBottom: "30px", width: "60%" }}>
                      <FormHelperText sx={{ fontSize:"1.1rem" }}>{value.varName}</FormHelperText>
                      <TextField
                        error = {hasInputError[value.varName]}
                        aria-label={`${value.varName}`}
                        placeholder="Type a number…"
                        value={variablesInput[value.varName]}
                        onChange={(event)=>{ setWasSomethingChanged(true); handleChangeNumber(value.varName,event,"number")}}
                      />
                      {hasInputError[value.varName] && <div className='input-err-msg'>The number should be in range [{rulesForVariables[value.varName]["min_value"]} , {rulesForVariables[value.varName]["max_value"]}] </div>} 
                      {value["description"] && <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> {value["description"]} </div> } 
                  </FormControl>
                    );

                  } else if(value.type === "multiple_selection"){
                  
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
                  } else if(value.type === "drop_down"){
                    return(
                      <div>
                        <FormControl sx={{ m: 1, width: "60%" }}>
                          <InputLabel id="demo-multiple-name-label">{`${value.varName}`}</InputLabel>
                          <Select
                            labelId="demo-multiple-name-label"
                            id="demo-multiple-name"
                            
                            value={variablesInput[value.varName]}
                            onChange={(event)=>{setWasSomethingChanged(true); handleChange(event,"drop_down",value.varName) }}
                            input={<OutlinedInput label="Name" />}
                            MenuProps={MenuProps}
                          >
                            {dropdownValues[value.varName].map((variableName) => (
                              <MenuItem
                                key={variableName}
                                value={variableName}
                                
                              >
                                {variableName}
                              </MenuItem>
                            ))}
                          </Select>
                          {value["description"] && <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> {value["description"]} </div> } 
                        </FormControl>
                      </div>
                    )
                  } else if(value.type === "trigger"){
               
                    return(
                      <div>
                        <FormControl sx={{ m: 1, width: "60%" }}>
                          <InputLabel id="demo-multiple-name-label">{`${value.varName}`}</InputLabel>
                          <Select
                            labelId="demo-multiple-name-label"
                            id="demo-multiple-name"
                            
                            value={variablesInput[value.varName]}
                            onChange={(event)=>{ setVariableNameTrigger(value.varName); setLinkedPipeline(event.target.value); setWasSomethingChanged(true); handleChange(event,"trigger",value.varName) }}
                            input={<OutlinedInput label="Name" />}
                            MenuProps={MenuProps}
                          >
                            {dropdownValues[value.varName] && dropdownValues[value.varName].map((variableName) => (
                              <MenuItem
                                key={variableName}
                                value={variableName}
                                
                              >
                                {variableName}
                              </MenuItem>
                            ))}
                          </Select>
                          {value["description"] && <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> {value["description"]} </div> } 
                        </FormControl>
                      </div>
                    )
                  }  else if(value.type === "date"){
                    
                    return(
                      <>
                        <div>
                       
                        </div>

                          <div className="date-container">
                            <LocalizationProvider dateAdapter={AdapterDayjs} >  
                                
                              <DateTimePicker
                                  ref={dateFieldRef}
                                  label={`${value.varName}`}
                                  defaultValue={variablesInput[value.varName].length!=0? dayjs(variablesInput[value.varName][0]) : dayjs(variablesInput[value.varName][0])}
                                  format={`YYYY-MM-DDTHH:mm:ss[Z]`}
                                  sx={{width:"66%", mt:2}}
                                  
                                  onChange={(evt)=>{handleDateChange(evt,value.format,"date",value.varName)}}
                                />
                            </LocalizationProvider>       
                            {value["description"] && <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> {value["description"]} </div> }        
                          </div>
                      </>
                    )
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
                    <FontAwesomeIcon icon={faBoxOpen} className='no-variables-icon empty-node-container' /> 
                     <p> There are no variables present</p>
                  </div>
              }
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={props.handleClose}>Close</Button>
              <Button  disabled={!wasSomethingChanged || formHasError  || allEmptyFields } onClick={()=>{handleDone()}}>Done</Button>
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


import React, {useState, useEffect, useRef} from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import { faArrowLeft, faTriangleExclamation, faUpload } from '@fortawesome/free-solid-svg-icons';
import Select from '@mui/material/Select';
import toast   from 'react-hot-toast';
import {useSelector} from "react-redux/es/hooks/useSelector";
import { useDispatch } from 'react-redux';
import {setShamrockValues, setShamrockFileName, setFullYAMLDocument, setShamrockModelName, setShamrockValueIsModified, setSharmockPipelineName, setShamrockNodes,setShamrockEdges } from "../../../../reducers/nodeSlice";
import ArticleIcon from '@mui/icons-material/Article';
import { SeeTemplate } from "../SeeTemplate/SeeTemplate";
import yaml from "js-yaml";
import Divider from '@mui/material/Divider';
import { v4 as uuidv4 } from 'uuid';
import { GET_MODELS, GET_OPTIMIZERS, GET_LOSSES } from '../../../../utils/apiEndpoints';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { expectedSchema } from "../../../../utils/expectedSchema";
import axios from 'axios';
import style from "./ShamrockDialog.css";


const defaultConfig = {
    node: {
      port: 8182,
      node_id: "server"
    },
    dataset: {
      builtin_dataset: "mnist",
      n_splits: 1,
      split_index: 0,
      node_id: "server",
      n_workers_torch: 0
    },
    topology: {
      topology_name: "FederatedServer",
      local_epochs: 1,
      max_iter: 5,
      log_file: "metrics.txt"
    },
    model: {
      optimizer: "Adam",
      lr: 0.0001,
      batch_size: 512,
      loss: "BinaryCrossentropy",
      metrics: ["accuracy_score"]
    },
    seed: 12645,
    framework: "keras",
    log_file: "results/server.txt",
    stop_condition: {
      condition: "fed_server",
      max_aggr: 1000,
      max_time: 3000,
      metric_name: "accuracy_score",
      metric_min: 0.7
    }
  };


export const ShamrockDialog = (props)=>{
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const [yamlOutput, setYamlOutput] = useState("");
    const [displayMainMenu, setDisplayMainMenu] = useState(false);
    const fileInputRef = useRef(null);
    const storedShamrockValues = useSelector((state)=> state.shamrockValues);
    const shmarockFileName = useSelector((state)=> state.shamrockFileName);
    const uploadedFile = useSelector((state)=> state.uploadedFile);
    const fullYAMLDocument = useSelector((state)=> state.fullYAMLDocument);
    const [displayManuallySetValues, setDisplayManuallySetValues] = useState(false);
    const [displayUploadFile, setDisplayUploadFile] = useState(false);
    const [parsedYaml, setParsedYaml] = useState(null);
    const [isFullFormValid, setIsFullFormValid] = useState(false);
    const [valueChanged, setValueChanged] = useState(false);
    const [fileName, setName] = useState("");
    const [modelList, setModelList] = useState([]);
    const [completeModelList, setCompleteModelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modelUploadError, setModelUploadError] = useState(false);
    /* Handles loading optimizers */
    const [optimizers, setOptimizers] = useState([]);
    const [optimizersLoadedError, setOptimizersLoadedError] = useState(false);
    /* Handles loading losses */
    const [losses, setLosses] = useState([]);
    const [lossesLoadedError, setLossesLoadedError] = useState(false);
    const [modelWasSet, setModelWasSet] = useState(false);
    const [configurationMenuModel, setConfigurationMenuModel] = useState("");

    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });

    const [dialogMaxWidth, setDialogMaxWidth] = useState("sm");
    const [seeTemplateDialog, setSeeTemplateDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fullYAMLDocumentStored, setFullYAMLDocumentStored] = useState();
    const [selectedModelValue, setSelectedModelValue] = useState("");
    
    const [allModels, setAllModels] = useState([]);
    const dispatch = useDispatch();


    const nameGenerator = ()=>{

        let shortName = uniqueNamesGenerator({
        dictionaries: [adjectives, animals, colors],
        length: 2
        });

        return shortName;
    }

    useEffect(()=>{
      dispatch(setShamrockModelName(configurationMenuModel));
    },[configurationMenuModel])


     const spawnNodes = ()=>{
    
            const newNodes = [];
            const newEdges = [];
            let newId, secondId ;
    
            newId = uuidv4();
    
            newNodes.push({
                id: newId,
                type: 'loader',
                data: { nodeId: newId , label: 'Loader', config:{} , name: nameGenerator(), pipelineType:"", fromShamrock:true},
                position: { x: 500, y: 500 },
             });
    
    
            secondId = uuidv4();
    
            newNodes.push(
            {
                id: secondId,
                type: 'transformer',
                data: {  nodeId: secondId, label: 'Transformer', config:{}, name: nameGenerator(), fromShamrock:true},
                position: { x: 1200, y: 500 },
                pipelineType:""
            });
    
             newEdges.push({
                id:uuidv4(),
                source: newId,
                target:secondId,
                type:'default',
                sourceHandle:'right',
                targetHandle:'left',
                animated: false,
            });
               
            dispatch(setShamrockEdges(newEdges));
            dispatch(setShamrockNodes(newNodes));
    }

    const validateYamlStructure = (parsedData, schema) => {
      for (const key in schema) {
        if (!(key in parsedData)) {
          console.error(`Missing key: ${key}`);
          return `Error: Missing required field '${key}'`;
        }
    
        if (typeof schema[key] === "object" && !Array.isArray(schema[key])) {
          const subValidation = validateYamlStructure(parsedData[key], schema[key]);
          if (subValidation) return subValidation;
        } else {
          if (schema[key] === "array" && !Array.isArray(parsedData[key])) {
            return `Error: '${key}' should be an array`;
          }
          if (schema[key] !== "array" && typeof parsedData[key] !== schema[key]) {
            return `Error: '${key}' should be of type ${schema[key]}, but got ${typeof parsedData[key]}`;
          }
        }
      }
      return null; // No errors, valid YAML
    };
    

    const handleFileUpload = (event) => {
      
      const file = event.target.files[0]; // Get the selected file
    
      if (!file) {
        blockAlert("No file selected. Please choose a YAML file.");
        return;
      }
      
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension !== "yaml" && fileExtension !== "yml") {
        blockAlert("Invalid file type. Please upload a .yaml or .yml file.");
        return;
      }
      
      if (file.size === 0) {
        blockAlert("Error: The uploaded file is empty. Please select a valid YAML file.");
        setSelectedFile(null);
        setParsedYaml(null);
        return;
      }
    

      const formData = new FormData();
      formData.append("file", file);
    
      
      const reader = new FileReader();

    reader.onload = (e) => {

            if (!e.target.result.trim()) {
              blockAlert("Error: The file appears to be empty or contains only whitespace.");
              setParsedYaml(null);
              return;
            }

          try {
            const parsedData = yaml.load(e.target.result);
            
            // Validate YAML structure
            const validationError = validateYamlStructure(parsedData, expectedSchema);
            if (validationError) {
              blockAlert(validationError);
              return;
            }


            blockSuccess("File was uploaded successfully!");
            setFullYAMLDocumentStored(parsedData);
            setSelectedFile(file); 
            setName(file.name);


          } catch (err) {
            blockAlert("Error parsing YAML file. Please check the file format.");
            console.error("YAML Parsing Error:", err);
          }
      };

      reader.onerror = () => {
        blockAlert("Error reading the file. Please try again.");
        console.error("FileReader encountered an error.");
      };
    
      reader.readAsText(file);

    };
    
 
    const handleUpload = () => {
      if(!selectedFile){
        blockAlert("Please select a file!");
      } else if(configurationMenuModel.length === 0){
        blockAlert("Please select a model!");
      } else {

        dispatch(setShamrockValues({}));
        dispatch(setFullYAMLDocument(fullYAMLDocumentStored));
        dispatch(setShamrockFileName(fileName));
        dispatch(setShamrockValueIsModified(true));
        blockSuccess("File saved successfully!");
        spawnNodes();
        props.handleClose();
      }
    };

    const [selectedDropdownValues, setSelectedDropdownValues] = useState({
      "framework":'',
      "optimizer":'',
      "loss":'',
      "topology":''
    });

    const [inputtedValues, setInputtedValues] = useState({
        "n_splits":1,
        "split_index":1,
        "max_iter":1,
        "local_epochs":1,
        "lr":0.001,
        "batch_size":1,
        "max_aggr":0.001,
        "max_time":0.001,
        "metric_min":0.001,
    });

    const blockAlert = (msg) => {
      toast.error(msg, {
          duration: 4000,
          position: 'top-right',
      })
  };

    const blockSuccess = (msg) => {
      toast.success(msg, {
          duration: 2000,
          position: 'top-right',
      })
    }; 

  
    const saveData = () => {

        dispatch(setShamrockValueIsModified(true));
        blockSuccess("The values have been successfully saved!");
        setTimeout(() => {
          const fullValues = {
            inputtedValues: inputtedValues,
            selectedDropdownValues: selectedDropdownValues
          };

          dispatch(setShamrockValues(fullValues));
          dispatch(setFullYAMLDocument({}));
          dispatch(setSharmockPipelineName(""));
          spawnNodes();
          props.handleClose();
        }, 1500);
      
    };


    const checkFormValidity = ()=>{
      const hasEmptyInputtedValues = Object.values(inputtedValues).some(value => value === "");
      const hasEmptyDropdownValues = Object.values(selectedDropdownValues).some(value => value === "");
        
      if (hasEmptyInputtedValues || hasEmptyDropdownValues) {
        setIsFullFormValid(false);
      } else {
        setIsFullFormValid(true);
      }

    }

    const handleSetValues = (value, name)=>{
      
      setValueChanged(true);

      if(name == "model"){
        setInputtedValues({
          ...inputtedValues,
          [name]: value 
        });
        return;
      }

      if(name === "n_splits"){
        if (value.length == 0){
          setInputtedValues({
            ...inputtedValues,
            [name]: "" 
          });
          return;
        }
        const numberVal = parseInt(value, 10);
        if (Number.isInteger(numberVal) && numberVal >= 0) {
          setInputtedValues({
            ...inputtedValues,
            [name]: numberVal 
          });
          return;
        } else {
          return;
        }
      }

      if(name === "split_index"){
        if (value.length == 0){
          setInputtedValues({
            ...inputtedValues,
            [name]: "" 
          });
          return;
        }
        const numberVal = parseInt(value, 10);
        if (Number.isInteger(numberVal) &&  numberVal >= 0) {
          setInputtedValues({
            ...inputtedValues,
            [name]: numberVal 
          });
          return;
        } else {
          return;
        }
      }

      if(name === "max_iter"){
        if (value.length == 0){
          setInputtedValues({
            ...inputtedValues,
            [name]: "" 
          });
          return;
        }
        const numberVal = parseInt(value, 10);
        if (Number.isInteger(numberVal) &&  numberVal >= 0) {
          setInputtedValues({
            ...inputtedValues,
            [name]: numberVal 
          });
          return;
        } else {
          return;
        }
      }

      if(name === "local_epochs"){
        if (value.length == 0){
          setInputtedValues({
            ...inputtedValues,
            [name]: "" 
          });
          return;
        }
        const numberVal = parseInt(value, 10);
        if (Number.isInteger(numberVal) &&  numberVal >= 0) {
          setInputtedValues({
            ...inputtedValues,
            [name]: numberVal 
          });
          return;
        } else {
          return;
        }
      }

      

        // lr
      if (name === "lr") {
        if (value.length === 0) {
          setInputtedValues({
            ...inputtedValues,
            [name]: ""
          });
          return;
        }

        // Allow intermediate states like "."
        const isValidFloatInput = /^(\d+(\.\d*)?|\.\d+)$/.test(value);

        if (isValidFloatInput) {
          const numberVal = parseFloat(value); // Parse as a floating-point number
          if (!isNaN(numberVal) && numberVal >= 0 && numberVal <= 1) {
            setInputtedValues({
              ...inputtedValues,
              [name]: value // Store as a string for intermediate inputs
            });
            return;
          }
        }

        // If invalid, do not update the value
        return;
}

      if(name === "batch_size"){
        if (value.length == 0){
          setInputtedValues({
            ...inputtedValues,
            [name]: "" 
          });
          return;
        }
        const numberVal = parseInt(value, 10);
        if (Number.isInteger(numberVal)  && numberVal > 0) {
          setInputtedValues({
            ...inputtedValues,
            [name]: numberVal 
          });
          return;
        } else {
          return;
        }
      }
      
      if (name === "max_aggr") {
        if (value.length === 0) {
          setInputtedValues({
            ...inputtedValues,
            [name]: ""
          });
          return;
        }

        // Allow intermediate states like "."
        const isValidFloatInput = /^(\d+(\.\d*)?|\.\d+)$/.test(value);

        if (isValidFloatInput) {
          const numberVal = parseFloat(value); // Parse as a floating-point number
          if (!isNaN(numberVal) && numberVal >= 0 && numberVal <= 1) {
            setInputtedValues({
              ...inputtedValues,
              [name]: value // Store as a string for intermediate inputs
            });
            return;
          }
        }

        // If invalid, do not update the value
        return;
      }

      if (name === "max_time") {
        if (value.length === 0) {
          setInputtedValues({
            ...inputtedValues,
            [name]: ""
          });
          return;
        }

        // Allow intermediate states like "."
        const isValidFloatInput = /^(\d+(\.\d*)?|\.\d+)$/.test(value);

        if (isValidFloatInput) {
          const numberVal = parseFloat(value); // Parse as a floating-point number
          if (!isNaN(numberVal) && numberVal >= 0 && numberVal <= 1) {
            setInputtedValues({
              ...inputtedValues,
              [name]: value // Store as a string for intermediate inputs
            });
            return;
          }
        }

        // If invalid, do not update the value
        return;
      }


    if (name === "metric_min") {
      if (value.length === 0) {
        setInputtedValues({
          ...inputtedValues,
          [name]: ""
        });
        return;
      }

      // Allow intermediate states like "."
      const isValidFloatInput = /^(\d+(\.\d*)?|\.\d+)$/.test(value);

      if (isValidFloatInput) {
        const numberVal = parseFloat(value); // Parse as a floating-point number
        if (!isNaN(numberVal) && numberVal >= 0 && numberVal <= 1) {
          setInputtedValues({
            ...inputtedValues,
            [name]: value // Store as a string for intermediate inputs
          });
          return;
        }
      }

      return;
    }
  }


    const [dropdownValues, setDropdownValues] = useState({
      "topology_name":["FederatedClientTopology","FederatedServerTopology","GossipClientTopology","CentralTopology"],
      "optimizer_keras":['Adadelta', 'Adafactor', 'Adagrad', 'Adam', 'AdamW', 'Adamax', 'Ftrl', 'Lamb', 'Lion', 'LossScaleOptimizer', 'Nadam', 'Optimizer', 'RMSprop', 'SGD'],
      "optimizer_torch": ['ASGD', 'Adadelta', 'Adafactor', 'Adagrad', 'Adam', 'AdamW', 'Adamax', 'LBFGS', 'NAdam', 'Optimizer', 'RAdam', 'RMSprop', 'Rprop', 'SGD', 'SparseAdam'],
      "loss_keras": ['BinaryCrossentropy', 'BinaryFocalCrossentropy', 'CTC', 'CategoricalCrossentropy', 'CategoricalFocalCrossentropy', 'CategoricalHinge', 'Circle', 'CosineSimilarity', 'Dice', 'Hinge', 'Huber', 'KLDivergence', 'LogCosh', 'Loss', 'MeanAbsoluteError', 'MeanAbsolutePercentageError', 'MeanSquaredError', 'MeanSquaredLogarithmicError', 'Poisson', 'SparseCategoricalCrossentropy', 'SquaredHinge', 'Tversky'],
      "loss_torch": ['L1Loss', 'NLLLoss', 'NLLLoss2d', 'PoissonNLLLoss', 'GaussianNLLLoss', 'KLDivLoss', 'MSELoss', 'BCELoss', 'BCEWithLogitsLoss', 'HingeEmbeddingLoss', 'MultiLabelMarginLoss', 'SmoothL1Loss', 'HuberLoss', 'SoftMarginLoss', 'CrossEntropyLoss', 'MultiLabelSoftMarginLoss', 'CosineEmbeddingLoss', 'MarginRankingLoss', 'MultiMarginLoss', 'TripletMarginLoss', 'TripletMarginWithDistanceLoss', 'CTCLoss'],
      "framework":["torch","keras"]
    })


    const MenuProps = {
      PaperProps: {
        style: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width: 250,
        },
      },
    };

    const fetchAllTheModels = async()=>{
      
      setLoading(true);
      setModelUploadError(false);
      const fullModelsArray = [];
      const fullFrameworksArray = [];

      try{
       
        const resp = await axios.get(GET_MODELS);
    
        for(const model of resp.data){
          fullModelsArray.push(model.name);
          fullFrameworksArray.push(model);
        }

        setCompleteModelList(fullFrameworksArray);
        setModelList(fullModelsArray);
        setLoading(false);
        
      } catch(err){
        
        setLoading(false)
        setModelUploadError(true);
        console.log(err);
      }
  }

  const fetch_optimizer_losses = async(framework)=>{

    // Code to fetch optimizer and losses
    try{
      const resp = await axios.get(GET_OPTIMIZERS(framework));
      setOptimizers(resp.data);
    } catch(err){
      console.log(err);
      setOptimizersLoadedError(true);
    }

    try{
      const resp = await axios.get(GET_LOSSES(framework));
      setLosses(resp.data);
    } catch(err){
      console.log(err);
      setLossesLoadedError(true);
    }

  }

  const getFrameworkForModel = (model_name)=>{
    const foundValue = completeModelList.find((value)=>value.name === model_name);
    return foundValue.framework;
  }


    useEffect(()=>{
      if(displayManuallySetValues){
        setDialogMaxWidth("md");
      } else {
        setDialogMaxWidth("md");
      }

    },[displayManuallySetValues])


    useEffect(()=>{
      setName(shmarockFileName);
      setSelectedFile(uploadedFile);
      fetchAllTheModels();
    },[])


    useEffect(()=>{

              if(!storedShamrockValues || Object.keys(storedShamrockValues).length === 0){
                setSelectedDropdownValues({
                  "framework":'',
                  "optimizer":'',
                  "loss":'',
                  "topology":''
        });

            setInputtedValues({
            "n_splits":1,
            "split_index":1,
            "max_iter":1,
            "local_epochs":1,  
            "lr":0.001,
            "batch_size":1,
            "max_aggr":0.001,
            "max_time":0.001,
            "metric_min":0.001,
            });
      }

    },[storedShamrockValues])


    useEffect(()=>{
      checkFormValidity();
    },[selectedDropdownValues,inputtedValues])


    const setDropdownValue = async(value, dropdown_menu_name) => {
      let updatedValues = { ...selectedDropdownValues };
    
      if (dropdown_menu_name === "model") {

        const framework = getFrameworkForModel(value);
        await fetch_optimizer_losses(framework);
        updatedValues["framework"] = framework;
        setModelWasSet(true);
      }
    
      updatedValues[dropdown_menu_name] = value;
  
      setSelectedDropdownValues(updatedValues);
      
      setValueChanged(true);
    };



  
 return(
      <ThemeProvider theme={darkTheme}>
                <Dialog
                open={props.open}
                onClose={(event, reason) => {
                  if (reason === "backdropClick" || reason === "escapeKeyDown") {
                    return; // Ignore backdrop clicks
                  }
                  props.handleClose(event, reason); // Handle other close events
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth={"md"} 
                fullWidth={true}
                className="shamrock-dialog-all"
            >
                <DialogTitle id="alert-dialog-title">
                  {
                    displayMainMenu &&
                                <div className="left-back-icon">
                                        <FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{setDisplayMainMenu(false); setDisplayManuallySetValues(false); setDisplayUploadFile(false) }} className="back-icon-shamrock-menu"/>
                                </div>   
                  }
                
                { ((!storedShamrockValues || Object.keys(storedShamrockValues).length !== 0) || (!fullYAMLDocument || Object.keys(fullYAMLDocument).length !== 0)) && <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div> }  
                     
                </DialogTitle>

                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
            
              {
                 !displayMainMenu &&
                 <div className="shamrock-dialog-initial-options">
                     <Button variant="contained" onClick={()=>{setDisplayMainMenu(true); setModelWasSet(false); setLossesLoadedError(false); setOptimizersLoadedError(false); setDisplayManuallySetValues(true)}} > Set values manually</Button>
                     <Button variant="contained" onClick={()=>{setDisplayMainMenu(true); setDisplayUploadFile(true)}} > Upload a file</Button>
                 </div>
              }

              {
                displayMainMenu && displayUploadFile &&
                <div className="shamrock-dialog-upload-file">
                    <div className="section-title">Upload configuration file</div>
                        <div className="shamrock-dialog-upload-file-btn-container">
                            
                            <div>
                                <input type="file" onChange={handleFileUpload} style={{paddingTop:"25px"}} ref={fileInputRef} accept=".yaml, .yml" id="file-upload" />
                                <label for="file-upload" class="custom-file-upload" className="button-label">
                                   UPLOAD A FILE <FontAwesomeIcon icon={faUpload} />
                              </label>
                            </div>
                          
                          <Button
                            variant="contained"
                            sx={{ backgroundColor: "blue", color: "#fff", marginTop: "20px" }}
                            onClick={() => {setSeeTemplateDialog(true)}}
                          >
                            See template <ArticleIcon className="upload-icon" />
                          </Button>


                        </div>



                      <div className="uploaded-file-name-section">

                         { fileName.length!==0 && <div> <span className="uploaded-file">Uploaded file</span>: {fileName} </div>} 

                      </div>
                        

                          <div className="variable-description configuration-menu-model-select">
                            <FontAwesomeIcon icon={faCircleInfo} /> The file should have the YAML extension and should comply with the template.
                          </div>

                           <Divider/>
                        <div>
                          <div className="section-title">Select a model</div>
                                        
                                <FormControl sx={{  width: "60%", mb:"10px" }}>
                                      
                                          <InputLabel id="demo-multiple-name-label"></InputLabel>
                                          <Select
                                            labelId="demo-multiple-name-label"
                                            id="demo-multiple-name"
                                            value={configurationMenuModel}
                                            onChange={(event)=>{setConfigurationMenuModel(event.target.value)}}
                                            input={<OutlinedInput label="Name" />}
                                            MenuProps={MenuProps}
                                            className="shamrock-control-input"
                                          >

                                          {   
                                                modelList.map((variableName) => (
                                                  <MenuItem
                                                    key={variableName}
                                                    value={variableName}
                                                    
                                                  >
                                                    {variableName}
                                                  </MenuItem>
                                                      )) 
                                            }

                                          </Select>                                          
                                  </FormControl>
                                           
                          </div>
                          { modelUploadError &&  <div className='variable-description error-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon exclamation-icon-error"/> Error while loading the models! </div>   }
                  
                        <Button variant="contained" onClick={handleUpload} style={{ marginTop: "40px" }}>
                          Save
                        </Button>
              </div>
              }

              {

              displayMainMenu && displayManuallySetValues &&

              (selectedDropdownValues && inputtedValues) 
              &&
              <>
              
              <div>

                  {!loading? 
                      <div className="shamrock-dialog-options-content">

                      
  
                      <div className="shamrock-dialog-options-section">
  
                                <div className="shamrock-dialog-options-section-title"> Dataset </div>
  
                                  <div>
                                                {/* 
                                                      This is an input for numbers
  
                                                      - n_splits : 1
  
                                                */}
                                                <FormControl key={'1'} sx={{ marginBottom: "30px", width: "90%", marginLeft:"15px" }}>
                                                  <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                                  <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> n_splits </div> 
                                                    <TextField
                                                      error = {false}
                                                      aria-label={`My value`}
                                                      placeholder="Type a number…"
                                                      value={inputtedValues ? inputtedValues["n_splits"]: ""}
                                                      onChange={(event)=>{ handleSetValues(event.target.value, "n_splits")}}
                                                      className="shamrock-control-input"
                                                    />
                                                    <div className='variable-description centered-variable-description'>  Values should be positive integers </div> 
                                                </FormControl>
                                    </div>
                                                
  
                                    <div>
                                          {/* 
                                                This is an input for numbers

                                                - split_index: 0

                                          */}
                                          <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%", marginLeft:"15px"  }}>
                                            
                                            <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                            <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> split_index  </div> 
                                              <TextField
                                                error = {false}
                                                aria-label={`My value`}
                                                placeholder="Type a number…"
                                                value={inputtedValues ? inputtedValues["split_index"]: ""}
                                                onChange={(event)=>{ handleSetValues(event.target.value, "split_index")}}
                                                className="shamrock-control-input"
                                              />
                                            <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                                          </FormControl>
                                        </div>
                            </div>
                            <div className="shamrock-dialog-options-section">  
                              <div className="shamrock-dialog-options-section-title"> Topology </div>
                                    <div>
                                          {/* 
                                                This is an input for multiple choice
                                                - topology_name: CentralTopology, GossipClientTopology, FederatedServerTopology, FederatedClientTopology,
                                          */}
  
  
                                                <FormControl sx={{  width: "90%", mb:"20px" }}>
                                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> topology name </div>  
                                                    <InputLabel id="demo-multiple-name-label"></InputLabel>
                                                    <Select
                                                      labelId="demo-multiple-name-label"
                                                      id="demo-multiple-name"
                                                      value={selectedDropdownValues ? selectedDropdownValues["topology"] : ""}
                                                      onChange={(event)=>{setDropdownValue(event.target.value, "topology")}}
                                                      input={<OutlinedInput label="Name" />}
                                                      MenuProps={MenuProps}
                                                      className="shamrock-control-input"
                                                    >
                                                      {dropdownValues && dropdownValues["topology_name"].map((variableName) => (
                                                        <MenuItem
                                                          key={variableName}
                                                          value={variableName}
                                                          
                                                        >
                                                          {variableName}
                                                        </MenuItem>
                                                      ))} 
                                                    </Select>
                                                    
                                                </FormControl>
  
                                            </div>
                                            <div>
                                              {/* 
                                                    This is an input for numbers
  
                                                    - max_iter: 5
  
                                              */}
                                              <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>  max_iter </div> 
                                                  <TextField
                                                    error = {false}
                                                    aria-label={`My value`}
                                                    placeholder="Type a number…"
                                                    value={inputtedValues ? inputtedValues["max_iter"] : ""}
                                                    onChange={(event)=>{ handleSetValues(event.target.value, "max_iter")}}
                                                    className="shamrock-control-input"
                                                  />
                                                <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                                              </FormControl>
                                            </div>
                                            <div>
                                              {/* 
                                                    This is an input for numbers
  
                                                    - local_epochs: 1
  
                                              */}
                                              <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> local_epochs </div> 
                                                  <TextField
                                                    error = {false}
                                                    aria-label={`My value`}
                                                    placeholder="Type a number…"
                                                    value={inputtedValues ? inputtedValues["local_epochs"]: ""}
                                                    onChange={(event)=>{ handleSetValues(event.target.value, "local_epochs")}}
                                                    className="shamrock-control-input"
                                                  />
                                                <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                                              </FormControl>
                                            </div>
  
                            </div>
  
                            <div className="shamrock-dialog-options-section">
                                                {/* Here */}
                                <div className="shamrock-dialog-options-section-title"> Model </div>
                                  
                                <div>
                                        {/* 
                                              This is an input for multiple choice
                                              - optimizer: CentralTopology, GossipClientTopology, FederatedServerTopology, FederatedClientTopology,
                                        */}
  
                                        <FormControl sx={{  width: "90%", mb:"10px" }}>
                                              <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> model </div>  
                                                  <InputLabel id="demo-multiple-name-label"></InputLabel>
                                                  <Select
                                                    labelId="demo-multiple-name-label"
                                                    id="demo-multiple-name"
                                                    value={selectedDropdownValues ? selectedDropdownValues["model"] : ""}
                                                    onChange={(event)=>{  setDropdownValue(event.target.value, "model") }}
                                                    input={<OutlinedInput label="Name" />}
                                                    MenuProps={MenuProps}
                                                    className="shamrock-control-input"
                                                  >
  
                                                  {   
                                                        modelList.map((variableName) => (
                                                          <MenuItem
                                                            key={variableName}
                                                            value={variableName}
                                                            
                                                          >
                                                            {variableName}
                                                          </MenuItem>
                                                              )) 
                                                    }
  
                                                  </Select>                                          
                                          </FormControl>
                                         
                                      </div>
                                      { modelUploadError &&  <div className='variable-description error-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon exclamation-icon-error"/> Error while loading the models! </div>   }


                                  <div>
                                        {/* 
                                              This is an input for multiple choice
                                              - optimizer: CentralTopology, GossipClientTopology, FederatedServerTopology, FederatedClientTopology,
                                        */}
  
  
                                        <FormControl sx={{  width: "90%", mb:"20px" }}>
                                              <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> optimizer </div>  
                                                  <InputLabel id="demo-multiple-name-label"></InputLabel>
                                                  <Select
                                                    labelId="demo-multiple-name-label"
                                                    id="demo-multiple-name"
                                                    value={selectedDropdownValues ? selectedDropdownValues["optimizer"] : ""}
                                                    onChange={(event)=>{setDropdownValue(event.target.value, "optimizer")}}
                                                    input={<OutlinedInput label="Name" />}
                                                    MenuProps={MenuProps}
                                                    className="shamrock-control-input"
                                                    disabled = { !modelWasSet || optimizersLoadedError }
                                                  >
                                                  
                                                  {   

                                                        optimizers.map((variableName) => (
                                                          <MenuItem
                                                            key={variableName}
                                                            value={variableName}
                                                            
                                                          >
                                                            {variableName}
                                                          </MenuItem>
                                                              )) 

                                                    }
  
                                                    
                                                  </Select>
                                                  { optimizersLoadedError &&  <div className='variable-description error-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon exclamation-icon-error"/> Error while loading the optimizers! </div>   }
                                                  { !modelWasSet &&
                                                    <div className='variable-description warning-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon"/> Please first select a model! </div>  
                                                  } 
                                                  
                                              </FormControl>
                                      </div>
                                      <div>
                                      {/* 
                                            This is an input for numbers
  
                                            - lr: 0.0001
  
                                      */}
                                      <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                        <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>  lr </div> 
                                          <TextField
                                            error = {false}
                                            aria-label={`My value`}
                                            placeholder="Type a number…"
                                            value={inputtedValues ? inputtedValues["lr"] : ""}
                                            onChange={(event)=>{ handleSetValues(event.target.value, "lr")}}
                                            className="shamrock-control-input"
                                          />
                                        <div className='variable-description centered-variable-description'>  Values should be between [0 , 1] </div>
                                      </FormControl> 
                                    </div>
  
                                    
                                    <div>
  
                                      {/* 
                                            This is an input for numbers
  
                                            - batch_size: 512
  
                                      */}
  
                                      <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                        <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>  batch_size </div> 
                                          <TextField
                                            error = {false}
                                            aria-label={`My value`}
                                            placeholder="Type a number…"
                                            value={ inputtedValues ? inputtedValues["batch_size"] : ""}
                                            className="shamrock-control-input"
                                            onChange={(event)=>{ handleSetValues(event.target.value, "batch_size")}}
                                          />
                                        <div className='variable-description centered-variable-description'>  Values should be between [0 , 1] </div>
                                      </FormControl>
                                    </div>
                                    <div>
                                        {/* 
                                              This is an input for multiple choice
                                              - loss: CentralTopology, GossipClientTopology, FederatedServerTopology, FederatedClientTopology,
                                        */}
  
  
                                      <FormControl sx={{  width: "90%", mb:"20px" }}>
                                              <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> loss </div>  
                                                  <InputLabel id="demo-multiple-name-label"></InputLabel>
                                                  <Select
                                                    labelId="demo-multiple-name-label"
                                                    id="demo-multiple-name"
                                                    value={selectedDropdownValues ? selectedDropdownValues["loss"] : ""}
                                                    onChange={(event)=>{setDropdownValue(event.target.value, "loss")}}
                                                    input={<OutlinedInput label="Name" />}
                                                    MenuProps={MenuProps}
                                                    className="shamrock-control-input"
                                                    disabled = { !modelWasSet || lossesLoadedError}
                                                  >
                                                
                                                {   
                                                      losses.map((variableName) => (
                                                        <MenuItem
                                                          key={variableName}
                                                          value={variableName}
                                                          
                                                        >
                                                          {variableName}
                                                        </MenuItem>
                                                            )) 

                                                  }                      
                                                  </Select>
                                                  { lossesLoadedError &&  <div className='variable-description error-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon exclamation-icon-error"/> Error while loading losses! </div> }
                                                  { !modelWasSet  &&
                                                    <div className='variable-description warning-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon"/> Please first select a model! </div>  
                                                  } 
                                          </FormControl>
                                    </div>
  
                            </div>
                            
  
                        <div className="shamrock-dialog-options-section">
  
                            <div className="shamrock-dialog-options-section-title"> Stop  Condition </div>
                          <div>
  
                              {/* 
                                This is an input for numbers
                                - max_aggr: 1000
  
                              */}
  
                                  <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                    <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                    <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>   max_aggr </div> 
                                      <TextField
                                        error = {false}
                                        aria-label={`My value`}
                                        placeholder="Type a number…"
                                        value={inputtedValues ? inputtedValues["max_aggr"] : ""}
                                        onChange={(event)=>{ handleSetValues(event.target.value, "max_aggr")}}
                                        className="shamrock-control-input"
                                      />
                                    <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                                  </FormControl>
                                  </div>
  
                                    <div>
  
                                      {/* 
                                            This is an input for numbers
                                            - max_time: 3000
  
                                      */}
  
                                      <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                        <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>  max_time </div> 
                                          <TextField
                                            error = {false}
                                            aria-label={`My value`}
                                            placeholder="Type a number…"
                                            value={inputtedValues ? inputtedValues["max_time"]: ""}
                                            onChange={(event)=>{ handleSetValues(event.target.value, "max_time")}}
                                            className="shamrock-control-input"
                                          />
                                        <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                                      </FormControl>
                                      </div>
  
                                      <div>
  
                                    {/* 
                                          This is an input for numbers
                                          - metric_min: 0.7
  
                                    */}
  
                                    <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                      <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                      <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>  metric_min </div> 
                                        <TextField
                                          error = {false}
                                          aria-label={`My value`}
                                          placeholder="Type a number…"
                                          value={inputtedValues && inputtedValues["metric_min"]}
                                          onChange={(event)=>{ handleSetValues(event.target.value, "metric_min")}}
                                          className="shamrock-control-input"
                                        />
                                      <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                                    </FormControl>
                                    </div>  
                            </div>
                              
                            <div className="shamrock-options-dialog-save-btn">
                                  <Button variant="contained" sx={{marginTop:"5px", width:"90px" }} disabled={!valueChanged || !isFullFormValid} onClick={()=>{saveData()}}>Save</Button>
                            </div>
  
                          </div>      

                            :


                        <div style={{marginTop:"40px"}}>
                          <div className="loading-circle-container" style={{paddingTop:"30px"}}>
                              <div className="loading-circle"></div>
                              <p className="loading-text-graphs">Loading models data...</p>
                          </div>
                      </div>
                    
                  }

                  </div>
              </>
                
              }
        
                    </DialogContentText>
                  </DialogContent>
                <DialogActions>
                        
                </DialogActions>
              {seeTemplateDialog && <SeeTemplate open={seeTemplateDialog} closeDialog={()=>{setSeeTemplateDialog(false)}}/>}
            </Dialog>
        </ThemeProvider>
 )

}
import React, {useState, useEffect, useRef} from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import toast   from 'react-hot-toast';
import {useSelector} from "react-redux/es/hooks/useSelector";
import { useDispatch } from 'react-redux';
import {setShamrockValues, setShamrockFileName, setFullYAMLDocument, setShamrockModelName, setShamrockValueIsModified, setSharmockPipelineName, setShamrockNodes,setShamrockEdges } from "../../../../reducers/nodeSlice";
import { Loading } from "./Loading";
import { SeeTemplate } from "../SeeTemplate/SeeTemplate";
import yaml from "js-yaml";
import { FlevidenInput } from "./FlevidenInput";
import { UploadFile } from "./UploadFile";
import { ShamrockInput } from "./ShamrockInput";
import { v4 as uuidv4 } from 'uuid';
import { GET_MODELS, GET_OPTIMIZERS, GET_LOSSES } from '../../../../utils/apiEndpoints';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { expectedSchema } from "../../../../utils/expectedSchema";
import {capitalizeFirstLetter} from "../../../../utils/capitalizeFirstLetter";
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import style from "./FederatedPipelineDialog.css";


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


export const FederatedPipelineDialog = (props)=>{

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
    const [loading, setLoading] = useState(false);
    const [modelUploadError, setModelUploadError] = useState(false);
    const [pdArgs, setPdArgs] = useState([]);
    const [clients, setClients] = useState([]);
    const [pdArgsServer, setPdArgsServer] = useState([]);
    /* Handles loading optimizers */
    const [optimizers, setOptimizers] = useState([]);
    const [optimizersLoadedError, setOptimizersLoadedError] = useState(false);
    /* Handles loading losses */
    const [losses, setLosses] = useState([]);
    const [lossesLoadedError, setLossesLoadedError] = useState(false);
    const [modelWasSet, setModelWasSet] = useState(false);
    const [configurationMenuModel, setConfigurationMenuModel] = useState("");
    const [valueChangedFleviden, setValueChangedFleviden] = useState(false);
    const [isFullFormValidFleviden, setIsFullFormValidFleviden] = useState(false);
    const [targets, setTargets] = useState([]);
    const [features, setFeatures] = useState([]);

    const navigate = useNavigate();
 
    const darkTheme = createTheme({
        palette: { 
          mode: 'dark',
        },
      });

    const [dialogMaxWidth, setDialogMaxWidth] = useState("sm");
    const [seeTemplateDialog, setSeeTemplateDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fullYAMLDocumentStored, setFullYAMLDocumentStored] = useState();
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
        props.setIsPipelineEditorOpen(true);
        props.handleClose();
      }
    };

    const [selectedDropdownValues, setSelectedDropdownValues] = useState({
      "shamrock":{
         "framework":'',
          "optimizer":'',
          "loss":'',
          "topology":''
      },

      "fleviden":{
        "DEBUG":""
      }
     
    });

    const [inputtedValues, setInputtedValues] = useState({
        "shamrock": {
           "n_splits":1,
          "split_index":1,
          "max_iter":1,
          "local_epochs":1,
          "lr":0.001,
          "batch_size":1,
          "max_aggr":0.001,
          "max_time":0.001,
          "metric_min":0.001,
        } , 

        "fleviden":{
          "VERBOSITY": 2,
          "ROUNDS":1,
          "client_id":"",
          "client_server":"",
          "epochs":"",
          "batch_size":"",
          "client_model_path":"",
          "client_data_path":"",
          "client_features":[],
          "client_targets":"",
          "client_pd_args":{},
          "server_id":"",
          "clients":[],
          "min_clients":"",
          "server_model_path":"",
          "server_data_path":"",
          "server_features":[],
          "server_targets":[],
          "server_pd_args":{}
        }
       
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
        props.setIsPipelineEditorOpen(true);
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

    const handleSetValues = (value, name, framework_type)=>{
      
      setValueChanged(true);

      if(name == "model"){
        setInputtedValues({
        ...inputtedValues,
        [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: value })
      });
        return;
      }

      if(name === "n_splits"){
        if (value.length == 0){
          setInputtedValues({
        ...inputtedValues,
        [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: "" })
      });
          return;
        }
        const numberVal = parseInt(value, 10);
        if (Number.isInteger(numberVal) && numberVal >= 0) {
          setInputtedValues({
          ...inputtedValues,
          [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: numberVal  })
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
          [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: "" })
        });
          return;
        }
        const numberVal = parseInt(value, 10);
        if (Number.isInteger(numberVal) &&  numberVal >= 0) {
          setInputtedValues({
          ...inputtedValues,
          [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: numberVal })
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
          [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: "" })
        });
          return;
        }
        const numberVal = parseInt(value, 10);
        if (Number.isInteger(numberVal) &&  numberVal >= 0) {
          setInputtedValues({
            ...inputtedValues,
            [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: numberVal })
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
            [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: "" })
          });
          return;
        }
        const numberVal = parseInt(value, 10);
        if (Number.isInteger(numberVal) &&  numberVal >= 0) {
          setInputtedValues({
          ...inputtedValues,
          [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: numberVal })
        });
          return;
        } else {
          return;
        }
      }

      

        // lr
    // lr
      if (name === "lr") {
        if (value.length === 0) {
          setInputtedValues({
            ...inputtedValues,
            [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: "" })
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
            [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: value })
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
          [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: "" })
        });
          return;
        }
        const numberVal = parseInt(value, 10);
        if (Number.isInteger(numberVal)  && numberVal > 0) {
          setInputtedValues({
            ...inputtedValues,
            [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: numberVal })
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
          [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: "" })
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
              [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: value })
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
          [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: "" })
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
            [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: value })
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
      [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: "" })
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
            [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: value })
          });
          return;
        }
      }

      return;
    }

    if(framework_type == "fleviden"){
      // this should be updated to incorporate proper validation
       setInputtedValues({
            ...inputtedValues,
            [framework_type]: Object.assign({}, inputtedValues[framework_type], { [name]: value })
          });
    }

  }


    const [dropdownValues, setDropdownValues] = useState({
      
        "shamrock": {

      "topology_name":["FederatedClientTopology","FederatedServerTopology","GossipClientTopology","CentralTopology"],
      "optimizer_keras":['Adadelta', 'Adafactor', 'Adagrad', 'Adam', 'AdamW', 'Adamax', 'Ftrl', 'Lamb', 'Lion', 'LossScaleOptimizer', 'Nadam', 'Optimizer', 'RMSprop', 'SGD'],
      "optimizer_torch": ['ASGD', 'Adadelta', 'Adafactor', 'Adagrad', 'Adam', 'AdamW', 'Adamax', 'LBFGS', 'NAdam', 'Optimizer', 'RAdam', 'RMSprop', 'Rprop', 'SGD', 'SparseAdam'],
      "loss_keras": ['BinaryCrossentropy', 'BinaryFocalCrossentropy', 'CTC', 'CategoricalCrossentropy', 'CategoricalFocalCrossentropy', 'CategoricalHinge', 'Circle', 'CosineSimilarity', 'Dice', 'Hinge', 'Huber', 'KLDivergence', 'LogCosh', 'Loss', 'MeanAbsoluteError', 'MeanAbsolutePercentageError', 'MeanSquaredError', 'MeanSquaredLogarithmicError', 'Poisson', 'SparseCategoricalCrossentropy', 'SquaredHinge', 'Tversky'],
      "loss_torch": ['L1Loss', 'NLLLoss', 'NLLLoss2d', 'PoissonNLLLoss', 'GaussianNLLLoss', 'KLDivLoss', 'MSELoss', 'BCELoss', 'BCEWithLogitsLoss', 'HingeEmbeddingLoss', 'MultiLabelMarginLoss', 'SmoothL1Loss', 'HuberLoss', 'SoftMarginLoss', 'CrossEntropyLoss', 'MultiLabelSoftMarginLoss', 'CosineEmbeddingLoss', 'MarginRankingLoss', 'MultiMarginLoss', 'TripletMarginLoss', 'TripletMarginWithDistanceLoss', 'CTCLoss'],
      "framework":["torch","keras"]

      },

      "fleviden" :{
        "DEBUG":["true", "false"]
      }
      
      


    })


    
    const fetchAllTheModels = async()=>{
      
      // setLoading(true);
      // setModelUploadError(false);
      // const fullModelsArray = [];
      // const fullFrameworksArray = [];

      // try{
       
      //   const resp = await axios.get(GET_MODELS);
    
      //   for(const model of resp.data){
      //     fullModelsArray.push(model.name);
      //     fullFrameworksArray.push(model);
      //   }

      //   setCompleteModelList(fullFrameworksArray);
      //   setModelList(fullModelsArray);
      //   setLoading(false);
        
      // } catch(err){
        
      //   setLoading(false);
      //   setModelUploadError(true);
      //   console.log(err);
      // }
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
                 "shamrock":{

                    "framework":'',
                    "optimizer":'',
                    "loss":'',
                    "topology":''

                },

                "fleviden":{
                  "DEBUG":""
                }
        });

            setInputtedValues({
             "shamrock": {
              "n_splits":1,
              "split_index":1,
              "max_iter":1,
              "local_epochs":1,
              "lr":0.001,
              "batch_size":1,
              "max_aggr":0.001,
              "max_time":0.001,
              "metric_min":0.001,
            } , 

            "fleviden":{
              "VERBOSITY": 2
            }
        
         });

      }

    },[storedShamrockValues])


    useEffect(()=>{
      checkFormValidity();
    },[selectedDropdownValues,inputtedValues])


    const setDropdownValue = async(value, dropdown_menu_name, framework_type) => {

      let updatedValues = { ...selectedDropdownValues };
    
      if (dropdown_menu_name === "model") {

        const framework = getFrameworkForModel(value);
        await fetch_optimizer_losses(framework);
        updatedValues[framework_type]["framework"] = framework;
        setModelWasSet(true);
      }
    
      updatedValues[framework_type][dropdown_menu_name] = value;
  
      setSelectedDropdownValues(updatedValues);
      
      setValueChanged(true);
    };

 
 return(
      <ThemeProvider theme={darkTheme}>
                <Dialog
                open={props.open}
                onClose={(event, reason) => {
                  if (reason === "backdropClick" || reason === "escapeKeyDown") {
                    return; 
                  }
                  props.handleClose(event, reason); 
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
                 <div>
                    <div className="back-arrow-shamrock" onClick={()=>{props.handleClose(); navigate("/")}}> <FontAwesomeIcon icon={faArrowLeft} /> </div>
                      <div className="federated-learning-framework-title"> {capitalizeFirstLetter(props.frameworkType)} </div>
                      <div className="shamrock-dialog-initial-options">
                          <Button variant="contained" onClick={()=>{setDisplayMainMenu(true); setModelWasSet(false); setLossesLoadedError(false); setOptimizersLoadedError(false); setDisplayManuallySetValues(true)}} > Set values manually</Button>
                          <Button variant="contained" onClick={()=>{setDisplayMainMenu(true); setDisplayUploadFile(true)}} > Upload a file</Button>
                      </div>
                 </div>
                 
              }

              {
                displayMainMenu && displayUploadFile &&

                <UploadFile

                  handleFileUpload={handleFileUpload}
                  fileInputRef={fileInputRef}
                  setSeeTemplateDialog={setSeeTemplateDialog}
                  fileName={fileName}
                  configurationMenuModel={configurationMenuModel}
                  modelList={modelList}
                  modelUploadError={modelUploadError}
                  handleUpload={handleUpload}
                  framework={props.frameworkType}

                />

              }

              {

                displayMainMenu && displayManuallySetValues &&

                (selectedDropdownValues && inputtedValues) 
                &&
              <>
              
              <div>

                  {!loading? 
                      <>
                        {props.frameworkType == "shamrock"?
                        
                          <ShamrockInput
                            inputtedValues={inputtedValues["shamrock"]}
                            handleSetValues={handleSetValues}
                            selectedDropdownValues={selectedDropdownValues["shamrock"]}
                            setDropdownValue={setDropdownValue}
                            dropdownValues={dropdownValues["shamrock"]}
                            modelList={modelList}
                            modelUploadError={modelUploadError}
                            modelWasSet={modelWasSet}
                            optimizersLoadedError={optimizersLoadedError}
                            lossesLoadedError={lossesLoadedError}
                            valueChanged={valueChanged}
                            optimizers={optimizers}
                            losses={losses}
                            isFullFormValid={isFullFormValid}
                            saveData={saveData}
                        
                          />

                        :
                          <FlevidenInput
                            targets={targets}
                            setTargets={setTargets}
                            dropdownValues={dropdownValues["fleviden"]}
                            selectedDropdownValues = {selectedDropdownValues["fleviden"]}
                            setDropdownValue={setDropdownValue}
                            inputtedValues={inputtedValues["fleviden"]}
                            handleSetValues={handleSetValues}
                            valueChanged={valueChangedFleviden}
                            isFullFormValid={isFullFormValid}
                            saveData={saveData}
                            features={features}
                            setFeatures={setFeatures}
                            pdArgs = {pdArgs}
                            setPdArgs = {setPdArgs}
                            clients={clients}
                            setClients={setClients}
                            pdArgsServer={pdArgsServer}
                            setPdArgsServer={setPdArgsServer}
                          />

                        }
                      </>

                            :

                        <Loading/>
                    
                  }

                  </div>
              </>
                
              }
        
                    </DialogContentText>
                  </DialogContent>
                <DialogActions>
                        
                </DialogActions>
              {seeTemplateDialog && <SeeTemplate framework={props.frameworkType} open={seeTemplateDialog} closeDialog={()=>{setSeeTemplateDialog(false)}}/>}
            </Dialog>
        </ThemeProvider>
 )

}
import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useDispatch, useSelector} from 'react-redux';
import TextField from '@mui/material/TextField';
import { SAVE_PIPELINE_STREAMING, TAG_PIPELINE, CREATE_FOLDER, CREATE_TRIGGER, SAVE_BLOCK, GET_BLOCK_CODE, FETCH_PIPELINES , FETCH_ALL_PIPELINES } from '../../../../utils/apiEndpoints';
import { setSharmockPipelineName, setShamrockIsPipelineNameValid, setShamrockIsBeingSaved,  setShamrockValueIsModified, setShamrockWasSaved, setShamrockLastSavedPipeline } from "../../../../reducers/nodeSlice";
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import axios from 'axios';
import yaml from "js-yaml";
import style from "./SaveDialog.css";
// import yaml from "js-yaml"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function SaveDialog(props) {
 
  const selectedFederatedFramework = useSelector((state)=>state.selectedFederatedFramework);
  const flevidenValues = useSelector((state) => state.flevidenValues);
  const shamrockPipelineName = useSelector((state)=> state.shamrockPipelineName);
  const shamrockIsPipelineNameValid = useSelector((state)=> state.shamrockIsPipelineNameValid)
  const shamrockValues = useSelector((state)=> state.shamrockValues);
  const shamrockNodes = useSelector((state)=> state.shamrockNodes);
  const fullYAMLDocument = useSelector((state)=> state.fullYAMLDocument);
  const federatedModelName = useSelector((state)=>state.federatedModelName);
  const [pipelineName, setPipelineName] = useState("");
  const [isPipelineNameValid, setIsPipelineNameValid] = useState(false);
  const [lowerCasePipelineName, setLowerCasePipelineName] = useState("");
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [hasTextChanged, setHasTextChanged] = useState(false);
  const [isBeingSaved, setIsBeingSaved] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(true);
  const [openError, setOpenError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
  

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSuccess(false);
    setOpenError(false);
  };

  const blockAlertSuccess = (msg) => {
    toast.success(msg, {
        duration: 2000,
        position: 'top-right',
    })
  }; 

  const blockAlertError = (msg) => {
    toast.error(msg, {
        duration: 2000,
        position: 'top-right',
    })
};

  const handleTextChange = (event)=>{
    const { target: { value } } = event;
    setPipelineName(value.toLowerCase());
    setLowerCasePipelineName(value.toLowerCase());
    setHasTextChanged(true);
    

    /* Here is the code for saving the pipeline name */
    const newRegExpRule = new RegExp("^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*$");
    if(newRegExpRule.test(value.toLowerCase())){
        setIsPipelineNameValid(true);
        dispatch(setShamrockIsPipelineNameValid(true));
        
    } else {
        dispatch(setShamrockIsPipelineNameValid(false));
        setIsPipelineNameValid(false);
    }
    setSaveDisabled(false);
}


const createFiles = async(framework)=>{


    let finalYaml = "";
    let fullYAMLDocumentCopy ;
    const randomNumber = Math.floor(10000 + Math.random() * 90000);


    // here we check if we are talking either about some values that were inputted
    // or we are talking about a file that was uploaded
    if(framework == "shamrock"){
         if((!shamrockValues || Object.keys(shamrockValues).length !== 0)){

          
            finalYaml =  {
              node: {
                port: 8182,
                node_id: "server"
              },
              dataset: {
                builtin_dataset: "mnist",
                n_splits: shamrockValues["inputtedValues"]["n_splits"],
                split_index: shamrockValues["inputtedValues"]["split_index"],
                node_id: "server",
                n_workers_torch: 0
              },
              topology: {
                topology_name: shamrockValues["selectedDropdownValues"]["topology"],
                local_epochs: shamrockValues["inputtedValues"]["local_epochs"],
                max_iter: shamrockValues["inputtedValues"]["max_iter"],
                log_file: "metrics.txt"
              },
              model: { 
                model_uri: `${process.env.REACT_APP_MLFLOW_API_URL}/model/package?name=${federatedModelName}`,
                model:shamrockValues["selectedDropdownValues"]["model"],
                optimizer: shamrockValues["selectedDropdownValues"]["optimizer"],
                lr: shamrockValues["inputtedValues"]["lr"],
                batch_size: shamrockValues["inputtedValues"]["batch_size"],
                loss: shamrockValues["selectedDropdownValues"]["loss"],
                metrics: ["accuracy_score"]
              },
              seed: randomNumber, ///creeaza un numar random :) 
              framework: shamrockValues["selectedDropdownValues"]["framework"],
              log_file: `/home/src/default_repo/configs/${pipelineName}/results/server.txt`,
              stop_condition: {
                condition: "fed_server",
                max_aggr: shamrockValues["inputtedValues"]["max_aggr"],
                max_time: shamrockValues["inputtedValues"]["max_time"],
                metric_name: "accuracy_score",
                metric_min: shamrockValues["inputtedValues"]["metric_min"]
              }
          };

          } else {

              // here we handle the case here wwe are dealing with an uploaded file
              // and we try to extract values from it such that we can populate the final object

            
            fullYAMLDocumentCopy = JSON.parse(JSON.stringify(fullYAMLDocument));
            // fullYAMLDocumentCopy["model"]["model"]="simple_cnn";
            fullYAMLDocumentCopy["model"]["model_uri"]=`${process.env.REACT_APP_MLFLOW_API_URL}/model/package?name=${federatedModelName}`;
            // fullYAMLDocumentCopy["topology"]["topology_name"]="CentralTopology";
            fullYAMLDocumentCopy["log_file"] = `/home/src/default_repo/configs/${pipelineName}/results/server.txt`;
            finalYaml = fullYAMLDocumentCopy;

          }

            finalYaml = yaml.dump(fullYAMLDocumentCopy);
    } else if(framework == "fleviden"){
      
        if((!flevidenValues || Object.keys(flevidenValues).length !== 0)){

          
            finalYaml =  {
              "DEBUG": flevidenValues["selectedDropdownValues"]["DEBUG"],
              "VERBOSITY": flevidenValues["inputtedValues"]["VERBOSITY"],
              "ROUNDS": flevidenValues["inputtedValues"]["ROUNDS"],
              
              "client": {
                "ID": flevidenValues["inputtedValues"]["client_id"],
                "SERVER": flevidenValues["inputtedValues"]["client_server"],
                "EPOCHS": flevidenValues["inputtedValues"]["epochs"],
                "BATCH_SIZE": flevidenValues["inputtedValues"]["batch_size"],
                "DATA_PATH": flevidenValues["inputtedValues"]["client_data_path"],
                "FEATURES": flevidenValues["features"],
                "TARGETS": flevidenValues["clientTargets"],
                "PD_ARGS": flevidenValues["pdArgs"],
              },
              
              "server": {
                "ID": flevidenValues["inputtedValues"]["server_id"],
                "CLIENTS": flevidenValues["clients"],
                "MIN_CLIENTS": flevidenValues["inputtedValues"]["min_clients"],
                "DATA_PATH": flevidenValues["inputtedValues"]["server_data_path"],
                "FEATURES": flevidenValues["serverFeatures"],
                "TARGETS": flevidenValues["serverTargets"],
                "PD_ARGS": flevidenValues["pdArgsServer"],
              }
            };

          } else {

              // here we handle the case here wwe are dealing with an uploaded file
              // and we try to extract values from it such that we can populate the final object

            
            fullYAMLDocumentCopy = JSON.parse(JSON.stringify(fullYAMLDocument));
            finalYaml = fullYAMLDocumentCopy;

          }

            finalYaml = yaml.dump(fullYAMLDocumentCopy);

    }
    


      try{
        const resp = await axios.post(CREATE_FOLDER,{
          type:"folder",
          name:pipelineName,
          path:"configs"
        });

      } catch(err){
        setOpenError(true);
        setErrorMessage("There was an error while creating the folder!");
        props.alertUser("error");
        return false;
      }


    
    try{
      const resp = await axios.post(CREATE_FOLDER,{
        type:"folder",
        name:"results",
        path:`configs/${pipelineName}`
      });

    } catch(err){
      setErrorMessage("There was an error while creating the folder!");
      props.alertUser("error");
      setOpenError(true);
      return false;
    }

    try{
      const resp = await axios.post(CREATE_FOLDER,{
        type:"folder",
        name:"model_files",
        path:`configs/${pipelineName}`
      });

    } catch(err){
      setErrorMessage("There was an error while creating the folder!");
      props.alertUser("error");
      setOpenError(true);
      return false;
    }


    try{
      const resp = await axios.post(CREATE_FOLDER,{
        type:"file",
        name:"model_files",
        path:`configs/${pipelineName}`,
        content:finalYaml
      });

    } catch(err){
      setErrorMessage("There was an error while uploading the file!");
      props.alertUser("error");
      setOpenError(true);
      return false;
    }

    return true;
}


  const savePipelineAndCreateFiles = async()=>{ 

    //first we check if the pipeline name does exists or not
    // if it does we warn the user to create a new one 

    //check if
    
    let wasFileCreationSuccesful = createFiles(selectedFederatedFramework);

    if(!wasFileCreationSuccesful){
      setErrorMessage("There was an error while saving the files!");
      setOpenError(true);
      dispatch(setShamrockIsBeingSaved(false));
      props.alertUser("error");
      return;
    } 
    
    // create pipelne
    try {
        const resp = await axios.post(SAVE_PIPELINE_STREAMING(pipelineName));
        
    } catch(err){
        console.log(err);
        setErrorMessage("There was an error while saving the pipeline!");
        setOpenError(true);
        dispatch(setShamrockIsBeingSaved(false));
        props.alertUser("error");
        return;
    }


    try{
      const resp = await axios.post(TAG_PIPELINE,{
          "name":pipelineName,
          "tags": ["streaming"]
      });  
    } catch(err){
        setOpenError(true);
        setErrorMessage("There was an error while tagging the pipeline!");
        dispatch(setShamrockIsBeingSaved(false));   
        props.alertUser("error");
        return;
    }

    //here we create a trigger only once

    //creeare de trigger

    /// acuma aici am sa trag block-urile , adica codul pentru cele 3 block-uri

          const allBlocksData = [];

            let blockName;

            if(selectedFederatedFramework == "shamrock"){

                blockName = "shamrock";

            } else {
                blockName = "fleviden_init";
            }

            let resp;

            try{
                resp = await axios.get(GET_BLOCK_CODE(blockName));
            
            } catch(err){
              
                setErrorMessage("There was a problem while creating the blocks!");
                dispatch(setShamrockIsBeingSaved(false));
                setOpenError(true);
                props.alertUser("error");
                return;
            }
        


            let code = resp.data.content.replaceAll("<pipeline_name>", pipelineName);
            if(selectedFederatedFramework == "shamrock"){
              code = code.replaceAll("ws:mageapi:8000/mage/ws", "wss://endpoints.sedimark.work/mage/ws");
            }
            
            
            let variables = resp.data.variables;

            let myBlock = {
                id: shamrockNodes[0].id,
                block_name: shamrockNodes[0].data.name,
                block_type: "loader",
                pipelineName: pipelineName,
                language:"python",
                file:code,
                upstream_blocks: [],
                downstream_blocks: [],
                variables: variables
            }
            allBlocksData.push(myBlock);


            blockName = selectedFederatedFramework == "shamrock" ? "shamrock_transformer" : "fleviden_transformer" ;
             

            try{
                resp = await axios.get(GET_BLOCK_CODE(blockName));
            
            } catch(err){
              
                setErrorMessage("There was a problem while creating the blocks!");
                dispatch(setShamrockIsBeingSaved(false));
                setOpenError(true);
                props.alertUser("error");
                return;
  
            }
            
             code = resp.data.content.replaceAll("<pipeline_name>", pipelineName);
             if(selectedFederatedFramework == "shamrock"){
              code = code.replaceAll("ws:mageapi:8000/mage/ws", "wss://endpoints.sedimark.work/mage/ws");
            }
             
             variables = resp.data.variables;

             myBlock = {
                id: shamrockNodes[1].id,
                block_name: shamrockNodes[1].data.name,
                block_type: "transformer",
                pipelineName: pipelineName,
                language:"python",
                file:code,
                upstream_blocks: [],
                downstream_blocks: [],
                variables: variables
            }
            allBlocksData.push(myBlock);

            ///setare upstream_blocks si downstream_blocks
            allBlocksData[0].downstream_blocks = [allBlocksData[1].block_name];  
            allBlocksData[1].upstream_blocks = [allBlocksData[0].block_name];
          
            //aici salvam concret bloacele in MageAI

            for(const block of allBlocksData){
           

              try {
      
                  const code = block.file;
                  const blob = new Blob([code], { type: 'application/octet-stream' });
                  const file = new File([blob], 'code.py');
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append("block_name",block.block_name);
                  if(block.block_type === "loader" || block.block_type === "exporter"  ){
                      formData.append("block_type",`data_${block.block_type}`);
                  } else {
                      formData.append("block_type",block.block_type);
                  }
                  
                  formData.append("pipeline_name",block.pipelineName);
                  formData.append("downstream_blocks",block.downstream_blocks );
                  formData.append("upstream_blocks",block.upstream_blocks);
                  formData.append("language","python");
                  formData.append("variables", block.variables === "" ? JSON.stringify({}) : JSON.stringify(block.variables))
            
                   const response = await axios.post(SAVE_BLOCK, formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                      },
                    });
                   
                  } catch(err) {
      
                   setErrorMessage("There was an error while creating the blocks!");
                   dispatch(setShamrockIsBeingSaved(false));
                   setOpenError(true);
                   props.alertUser("error");
                   return;
                  }
              }

        dispatch(setShamrockWasSaved(true));
        dispatch(setShamrockLastSavedPipeline(pipelineName));
        dispatch(setShamrockValueIsModified(false));
        dispatch(setSharmockPipelineName(pipelineName.toLowerCase()));

        dispatch(setShamrockIsBeingSaved(false));
        props.alertUser("success");
  } 



  const handleSavePipeline = async()=>{

    setSaveDisabled(true);
    
    let allPipelines = [];

    try{

      const resp = await axios.get(FETCH_ALL_PIPELINES);
      allPipelines = resp.data;

    } catch(err){

      console.log(err);
      blockAlertError("We have encountered a problem! Please try again later");
      dispatch(setShamrockIsBeingSaved(false));
      props.alertUser("error");

      return;
    }

    for(const pipeline of allPipelines){
      if (pipeline === pipelineName){
        blockAlertError("There is already a pipeline with this name!");
        return;
      }
    }
   
    props.handleClose();
    props.alertUser("loading");
    savePipelineAndCreateFiles();

  }

  useEffect(()=>{
    
    setIsPipelineNameValid(shamrockIsPipelineNameValid);
    setPipelineName(shamrockPipelineName);
  },[])

 

  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="md"
            fullWidth={true}  
        >
            <DialogTitle id="alert-dialog-title">
            {"Save Pipeline"}
            <div className="close-button-save-pipeline" onClick={()=>{props.handleClose()}}> x </div>
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
               <div className='insert-pipeline-name-container'>
                    <TextField
                        error = {!isPipelineNameValid}
                        aria-label={`Pipeline Name`}
                        placeholder="Enter a name for the Pipeline"
                        value={pipelineName}
                        onChange={(event)=>{handleTextChange(event)}}
                        sx={{width:"700px", mt:"10px" }}
                    />
               </div>
               <div>
                <div className='centered-save-pipeline-circle-info'>
                    <FontAwesomeIcon icon={faCircleInfo} className='info-circle'/>
                </div>
                 
                  <p className='pipeline-text-helper'> Pipeline name must start with a letter, contain only letters, numbers, and underscores, and must separate words with a single underscore (no spaces or consecutive underscores).</p>
                
               </div>

            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={()=>{handleSavePipeline()}} autoFocus disabled={(pipelineName.length === 0) || !isPipelineNameValid || isBeingSaved || !hasTextChanged || saveDisabled }>
                Save
            </Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

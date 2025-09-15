import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { SAVE_PIPELINE, TAG_PIPELINE, GET_BLOCK_CODE, SAVE_BLOCK, CREATE_TRIGGER, EXPORT_PIPELINE_MAGE, EXPORT_PIPELINE_CWL ,DELETE_PIPELINE } from "../../../../utils/apiEndpoints";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import Divider from '@mui/material/Divider';
import {  faCircleInfo, faDownload, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import axios from 'axios';
import { setStoredPipelineName} from "../../../../reducers/nodeSlice";
import style from "./SavePipeline.css";
import { useDispatch } from 'react-redux';

export default function SavePipeline(props) {

    const dispatch = useDispatch();
    const [pipelineName, setPipelineName] = useState("");
    const [isPipelineNameValid, setIsPipelineNameValid] = useState(false);
    const [pipelineBeingCreated, setPipelineBeingCreated] = useState(false);
    const [thereWasAnError, setThereWasAnError] = useState(false);
    const [createPipeline, setCreatePipeline] = useState(false);
    const [addTag, setAddTag] = useState(false);
    const [addTrigger, setAddTrigger] = useState(false);
    const [wasPipelineCreated, setWasPipelineCreated] = useState(false);
    const [createBlocks, setCreateBlocks] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [pipelineFailedMessage, setPipelineFailedMessage] = useState("");
    // const [existentData, setExistent]
    const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
    

    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });

    const blockAlert = (msg) => {
        toast.error(msg, {
            duration: 2000,
            position: 'top-right',
        })
    };

        const handleTextChange = (event)=>{
            const { target: { value } } = event;
            setPipelineName(value.toLowerCase());
            props.storePipelineName(value.toLowerCase());

            const newRegExpRule = new RegExp("^[a-zA-Z][a-zA-Z0-9]*(_[a-zA-Z0-9]+)*$");
            if(newRegExpRule.test(value.toLowerCase())){
                setIsPipelineNameValid(true);
            } else {
                setIsPipelineNameValid(false);
            }

        }


  const getBlockNicknameAfterId = (blockId, nicknames)=>{
        for(const nick of nicknames){
            if(nick.id === blockId){
                return nick.name;
            }
        }
        return "";
    }

    const getDownstreamBlocks = (node_id, nicknames)=>{

    //cauta prin lista de edges care block-uri au ca si nod de source node_id de la parametru
    let downstreamBlocks = [];

        for(const edge of props.edges){
            if(edge.source === node_id){
                downstreamBlocks.push(edge.target);
            }
        }

        
        for(let i = 0 ; i< downstreamBlocks.length; i++){
            downstreamBlocks[i] = getBlockNicknameAfterId(downstreamBlocks[i],nicknames);
        }

     
        return downstreamBlocks;
    }

    const deletePipeline = async(pipeline)=>{

        try{
            const resp = await axios.delete(DELETE_PIPELINE(pipeline));
          } catch(err){
            console.log("err");
            return; 
          }
            
    }


    const saveThePipeline = async()=>{

        dispatch(setStoredPipelineName(pipelineName));
        setPipelineBeingCreated(true);
        

        try {
            const resp = await axios.post(SAVE_PIPELINE(pipelineName));
            setTimeout(()=>{
                setCreatePipeline(true);
            },300)
            
        } catch(err){
            console.log(err);
            if(err.response.data.detail){
                setPipelineFailedMessage(err.response.data.detail);
            }
            setWasPipelineCreated(true);
            setThereWasAnError(true);
            blockAlert("There was an error while saving the pipeline!");
            return;
        }

        let pipeline_tag ;

        if(props.pipelineType === "pre-processing" ){
            pipeline_tag = "data_preprocessing";
        }  else {
            pipeline_tag = props.pipelineType;
        }

        try{
            const resp = await axios.post(TAG_PIPELINE,{
                "name":pipelineName,
                "tags": [pipeline_tag]
            });
            setTimeout(()=>{
                setAddTag(true);
            },400)
            
        } catch(err){
            console.log(err);
            if(err.response.data.detail){
                setPipelineFailedMessage(err.response.data.detail);
            }
            deletePipeline(pipelineName);
            setWasPipelineCreated(true);
            setThereWasAnError(true);
            blockAlert("There was an error while tagging the pipeline!");
            return;
        }

        // //extragere informatii pentru block

        const allBlocksData = [];
        const blockNicknames = [];
    
        /// Aici ii da un nume daca block-ul este generat
        // si daca nu atunci face request sa ia codul block-ului
        for(const block of props.allBlocks){

            let shortName = uniqueNamesGenerator({
            dictionaries: [adjectives, animals, colors], // colors can be omitted here as not used
            length: 2
            });

            if(block.data.fromPipelineStudio.isGenerated){
               
                const myBlock = {
                    id: block.id,
                    block_name: block.data.fromPipelineStudio.name,
                    block_type: block.data.fromPipelineStudio.type,
                    pipelineName: pipelineName,
                    language:"python",
                    file:block.data.fromPipelineStudio.blockCode,
                    upstream_blocks: [],
                    downstream_blocks: [],
                    variables: {}
                }

                allBlocksData.push(myBlock);
    
                const newBlockNick = {
                    id:block.id,
                    name:block.data.fromPipelineStudio.name
                }

                blockNicknames.push(newBlockNick);
            
            } else {
                const blockName = block.data.fromPipelineStudio.name;
                let resp;

                try{
                    resp = await axios.get(GET_BLOCK_CODE(blockName));
                
                } catch(err){
                    if(err.response.data.detail){
                        setPipelineFailedMessage(err.response.data.detail);
                    }
                    deletePipeline(pipelineName);
                    setWasPipelineCreated(false);
                    console.log(err);
                    setThereWasAnError(true);
                    blockAlert("There was a problem while creating the blocks!");
                    return;
    
                }
                
                const code = resp.data.content;
                const variables = resp.data.variables;

                const myBlock = {
                    id: block.id,
                    block_name: shortName,
                    block_type: block.type,
                    pipelineName: pipelineName,
                    language:"python",
                    file:code,
                    upstream_blocks: [],
                    downstream_blocks: [],
                    variables: variables
                }
    
                allBlocksData.push(myBlock);
    
                const newBlockNick = {
                    id:block.id,
                    name:shortName
                }
                blockNicknames.push(newBlockNick);
            }

          
        }
                
        let i = 0;
        let next_block = "";

        for(const block of allBlocksData){
            if(block.block_type === "loader"){
                allBlocksData[i].downstream_blocks = getDownstreamBlocks(block.id, blockNicknames)
                
                if(allBlocksData[i].downstream_blocks.length!=0){
                    next_block = allBlocksData[i].downstream_blocks[0];
                }

                for(const dwBlock of allBlocksData[i].downstream_blocks){
                    for(let j = 0 ; j < allBlocksData.length ; j++){
                        if(dwBlock === allBlocksData[j].block_name){
                            allBlocksData[j].upstream_blocks.push(allBlocksData[i].block_name);
                        }
                    }
                }
            }
            i++;
        }

        let j = 0;
        
        while(next_block!==''){
            i = 0;
            if(j === allBlocksData.length-1){
                break;
            }
            for(const block of allBlocksData){
              
                if(block.block_name === next_block){
                    allBlocksData[i].downstream_blocks = getDownstreamBlocks(block.id, blockNicknames)
                    
                    if(allBlocksData[i].downstream_blocks.length!=0){
                        next_block = allBlocksData[i].downstream_blocks[0];
                    }
                    
                    const upstream_blocks = [];
                    for(const dwBlock of allBlocksData[i].downstream_blocks){
                        for(let j = 0 ; j < allBlocksData.length ; j++){

                            if(dwBlock === allBlocksData[j].block_name){
                                allBlocksData[j].upstream_blocks = [allBlocksData[i].block_name];
                            }
                        }
                        
                    }
                }
                i++;
            }

            j++;
        }

      

        //acuma ce facem este ca punem toate bloacele in MageAI si dupa afisam ca este DONE

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

            if(err.response.data.detail){
                setPipelineFailedMessage(err.response.data.detail);
            }
            deletePipeline(pipelineName);
            setWasPipelineCreated(false);
             console.log(err);
             setThereWasAnError(true);
             blockAlert("There was an error while creating the blocks!");
             return ;
            }
        }
        setCreateBlocks(true);

        const newDate = Date.now();
        try{
            const response = await axios.post(CREATE_TRIGGER,{
                name:pipelineName,
                trigger_type:"api",
                interval:"",
                start_time:newDate,
            });
            setTimeout(()=>{
                setAddTrigger(true);
            },500)
            
        } catch(err){
            if(err.response.data.detail){
                setPipelineFailedMessage(err.response.data.detail);
            }
            setWasPipelineCreated(false);
            console.log(err);
            setThereWasAnError(true);
            blockAlert("There was an error while adding the trigger");
            return ;
        }

        setTimeout(()=>{
            setIsDone(true);
            setWasPipelineCreated(true);
        },600)
        
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && isPipelineNameValid) {
            saveThePipeline();
        }
    };

    const downloadTheZip = async(isFromMageAi)=>{
        blockNotify();
        
        let exportEndpoint = isFromMageAi?  EXPORT_PIPELINE_MAGE : EXPORT_PIPELINE_CWL;

        try{
          const data = await axios.get(exportEndpoint(pipelineName),{responseType:"arraybuffer"});
          const url = window.URL.createObjectURL(new Blob([data], { type: "application/zip" }));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${pipelineName}.zip`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch(err){
            blockAlert("There was a problem while getting the zip!")
          console.log(err);
        }
    }
  
    function base64ToBlob(base64, mime) {
      const bytes = atob(base64);
      const ab = new ArrayBuffer(bytes.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }
      return new Blob([ab], { type: mime });
    }

    const blockNotify = ()=>{
        toast.success("The download will start soon");
      }
    

  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="md"
            fullWidth="md"
        >
            <DialogTitle id="alert-dialog-title">
            {"Save Pipeline"}
                <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
            </DialogTitle>
            <Divider/>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {!pipelineBeingCreated && 
                    <div className="pipeline-name-text-field-container">
                            <TextField
                                error = {false}
                                aria-label={`Pipeline Name`}
                                placeholder="Enter Pipeline Name"
                                value={pipelineName}
                                onChange={(event)=>{handleTextChange(event)}}
                                onKeyDown={handleKeyDown}
                                sx={{width:"500px", mt:"10px" }}
                            />
                            <div className='info-icon-container'>
                                <FontAwesomeIcon icon={faCircleInfo}/>
                            </div>
                            <div className='variable-description'>  A valid pipeline name can be a single word or multiple words separated by underscores, containing only lowercase letters and numbers, with no spaces </div>
                        <Button onClick={()=>{saveThePipeline()}} disabled={!isPipelineNameValid} variant="contained" autoFocus sx={{marginTop:"20px"}}> Save Pipeline </Button>
                    </div>
                }

              {thereWasAnError && <>
                        
                    <div className='pipeline-creation-failed pipeline-being-created-text'> <FontAwesomeIcon icon={faCircleXmark} className='pipeline-failed-icon' />  
                        <div className='pipeline-creation-failed-msg'>
                                {pipelineFailedMessage}
                        </div>
                </div> 
                </>
               } 

         {
            pipelineBeingCreated && 
             <div className='pipeline-save-steps'>
             
              
             <div className='pipeline-name-wrapper'><span className="pipeline-being-created-text pipeline-name-container">Pipeline Name:</span>  {pipelineName}</div>                  

                <div className='pipeline-save-step-container top-step'><span className={ createPipeline ? 'pipeline-save-step step-fullfilling' : 'pipeline-save-step' } >1</span> Create Pipeline </div>
                <div className='pipeline-save-step-container'><span className={addTag ? 'pipeline-save-step step-fullfilling' : 'pipeline-save-step' }>2</span> Add Tag </div>
                <div className='pipeline-save-step-container'><span className={createBlocks ? 'pipeline-save-step step-fullfilling' : 'pipeline-save-step'} >3</span> Create Blocks </div>
                <div className='pipeline-save-step-container'><span className={addTrigger ? 'pipeline-save-step step-fullfilling' : 'pipeline-save-step' }>4</span> Add Trigger </div>      
                { isDone &&<div>
                    <div className='pipeline-save-step-container-done'> <CelebrationIcon/> DONE  <CelebrationIcon/></div>
                        <div className='export-buttons-save-toolbox'>
                            <Button outlined variant='contained' color='primary' className='download-btn-exporter' sx={{marginTop:"40px" }} onClick={()=>{downloadTheZip()}} >Export to MageAI <FontAwesomeIcon icon={faDownload} className='download-icon'/></Button>
                            <Button outlined variant='contained' color='primary' className='download-btn-exporter' sx={{marginTop:"40px" }} onClick={()=>{downloadTheZip()}} >Export to CWL <FontAwesomeIcon icon={faDownload} className='download-icon'/></Button>
                        </div>
                    
                    </div> 
                }  
            </div>
         }
           
            </DialogContentText>
            </DialogContent>
            <DialogActions>
               
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

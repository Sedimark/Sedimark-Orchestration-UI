import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider , createTheme} from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { v4 as uuidv4 } from 'uuid';
import { faCircleInfo, faArrowUp, faCloudArrowUp, faCode, faArrowsRotate, faPen, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import {capitalizeFirstLetter} from "../../../../utils/capitalizeFirstLetter"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ChangeBlockName from '../ChangeBlockName/ChangeBlockName';
import ControlledEditor from '@monaco-editor/react';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { getCookie } from '../../../../utils/getCookie';
import style from "./GenerateBlocks.css";
import { GENERATE_BLOCK_WS, CHECK_BLOCK_WS } from '../../../../utils/apiEndpoints';
import {setPipelineStudioNodes, setNotifyBlockGenerated, setGeneratedBlockData, setErrorWhileGenerating, setGeneratedBlockResult,setBlockWasGenerated, setGeneratedBlockCode, setSocketBlockIsGenerating,setResultsGenerated,setStoredBlockIsGenerating, setEditorValueBlockGenerating, setStoredGeneratedBlockName, setStoredGeneratedBlockType} from "../../../../reducers/nodeSlice";
import { useDispatch, useSelector } from 'react-redux';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import toast  from 'react-hot-toast';
import {setGeneratedBlockPayload} from "../../../../reducers/nodeSlice";
 

export default function GenerateBlocks(props) {

    const dispatch = useDispatch();
    /* values that are stored from block generator process*/
    const generatedBlockCode = useSelector((state)=> state.generatedBlockCode);
    const storedGeneratedBlockName = useSelector((state)=> state.generatedBlockName);
    const storedBlockType = useSelector((state)=> state.generatedBlockType);
    /*-- ^ -- */
 
    /* Those values are related to block generation trough socket */
    const errorWhileGenerating = useSelector((state)=> state.errorWhileGenerating);
    const socketBlockIsGenerating = useSelector((state)=> state.socketBlockIsGenerating);
    // const blockWasGenerated = useSelector((state)=> state.blockWasGenerated);
    const generatedBlockResult = useSelector((state)=> state.generatedBlockResult);
    /*-- ^ -- */


    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const [firstRender, setFirstRender] = useState(true);
    const pipelineStudioNodes = useSelector((state)=> state.pipelineStudioNodes);
    const [blockIsGenerating, setBlockIsGenerating] = useState(true);
    const [blockResultsGenerated, setBlockResultsGenerated] = useState(false);
    const [editorToggle, setEditorToggle] = useState(false);
    const [generatedBlockName, setGeneratedBlockName] = useState("");
    const [generatedBlockType, setGeneratedBlockType] = useState("");
    const [thereWasAnError, setThereWasAnError] = useState(false);
    const [blockCode, setBlockCode] = useState("");
    const [ws, setWs] = useState(null);
    const [checkWs, setCheckWs] = useState(null);
    const [changeBlockNameDialog, setChangeBlockNameDialog] = useState(false);
    const [message, setMessage] = useState("");
    const [editorValue, setEditorValue] = useState("");
    const [blockWasPlaced, setBlockWasPlaced] = useState(false);
    const [storedSecondBlockType, setStoredSecondBlockType] = useState("");
    const [url, setUrl] = useState(GENERATE_BLOCK_WS);
    const defaultEditorValue = "";
    const pingInterval = useRef(null);

    useEffect(()=>{
      setGeneratedBlockType(storedBlockType);
    },[storedBlockType])

    const MenuProps = {
      PaperProps: {
        style: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width: 250,
        },
      },
    };

    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });

    useEffect(()=>{

      setThereWasAnError(errorWhileGenerating);
      dispatch(setNotifyBlockGenerated(false));
    },[errorWhileGenerating])
    
    
    const sendMessageToWS = () => {
      
       const userId = getCookie("userID");
       const blockPayload = {
              "user_id": userId,
              "block_type": generatedBlockType,
              "description": message
       }
       dispatch(setGeneratedBlockPayload(blockPayload));
       setMessage('');
    };

    const blockAlert = (msg) => {
      toast.error(msg, {
          duration: 2000,
          position: 'top-right',
      })
    };

     const resetGeneration = ()=>{
       setEditorValue("");
       setBlockCode("");
       setBlockResultsGenerated(false);

       dispatch(setEditorValueBlockGenerating(""));
       dispatch(setGeneratedBlockCode(""));
       dispatch(setResultsGenerated(false));

       dispatch(setSocketBlockIsGenerating(false));
       dispatch(setGeneratedBlockPayload({}));
       
       dispatch(setGeneratedBlockCode(""));
       dispatch(setGeneratedBlockResult(""));
       dispatch(setBlockWasGenerated(false));

     }

    const loadBlockOnTheInterface = () =>{

      const oldPipelineStudioNodes = [...pipelineStudioNodes];
      const nodeId = uuidv4();
   
      oldPipelineStudioNodes.push({
        id:nodeId,
        type:'generated',
        data: { nodeId: nodeId, label: 'Generated', config:{} , name: "GeneratedBlock", pipelineType: "", fromPipelineStudio:{name:generatedBlockName, initialName:generatedBlockName, description:`Generated Block`, type:generatedBlockType, isGenerated:true, blockCode: editorValue}},
        position: { x: 800, y: 25 },
      });
      dispatch(setPipelineStudioNodes(oldPipelineStudioNodes));
      
      props.handleClose();
      props.postLoadAction();
      dispatch(setResultsGenerated(false));
      dispatch(setStoredBlockIsGenerating(false));
    }


    useEffect(()=>{
     
        setEditorValue(generatedBlockCode);
        setBlockCode(generatedBlockCode);
        if(generatedBlockCode.length != 0){
          setBlockResultsGenerated(true);
        }
    },[generatedBlockCode])


    useEffect(()=>{
      setGeneratedBlockName(storedGeneratedBlockName);
    },[storedGeneratedBlockName])

    

    const saveBlockAsTemplate = ()=>{

      const userId = getCookie("userID");

      let parsedGeneratedBlockType = "";
      if(generatedBlockType === "transformer" || generatedBlockType === "loader"){
        parsedGeneratedBlockType = `data_${generatedBlockType}`;
      } else {
        parsedGeneratedBlockType = generatedBlockType;
      }
      props.setBlockTemplateMetadata({
        block_type:generatedBlockType,
        language:"python",
        name: generatedBlockName,
        description:"",
        user_id:userId,
        code: editorValue
      })

      props.openBlockDescription();
    
    }

  
    useEffect(()=>{
      const ws = new WebSocket(GENERATE_BLOCK_WS);

      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setBlockIsGenerating(false);
      };
  
      ws.onmessage = (event) => {
        //here we have the message receive
        const message = event.data;
      
        dispatch(setGeneratedBlockData({
          "block_type": storedBlockType,
          "content":message
        }))
        setBlockCode(message);
        setBlockResultsGenerated(true);
        setBlockIsGenerating(false);
        setEditorValue(message);
      
       
        dispatch(setGeneratedBlockCode(message));
        dispatch(setResultsGenerated(true));
        dispatch(setStoredBlockIsGenerating(false));
        dispatch(setEditorValueBlockGenerating(message));

        let shortName = uniqueNamesGenerator({
          dictionaries: [adjectives, animals, colors], // colors can be omitted here as not used
          length: 2
          });
        
        setGeneratedBlockName(shortName);
        dispatch(setStoredGeneratedBlockName(shortName));
      };
  
      ws.onclose = (event) => {
       setBlockIsGenerating(false);
        setThereWasAnError(true);
        console.log('Disconnected from WebSocket');
      };
   
      ws.onerror = (error) => {
          console.error('WebSocket error', error);
          console.log('Error details:', {
            readyState: ws.readyState,
            bufferedAmount: ws.bufferedAmount,
            timeStamp: error.timeStamp,
            type: error.type,
          });

          setThereWasAnError(true);
      };
  
      setWs(ws);
  },[])

   

  const sendMessage = () => {
    if (ws && ws.readyState == WebSocket.OPEN) {
      ws.send(JSON.stringify({
        "block_type": generatedBlockType,
        "description": message
    }));
    if(ws.readyState !== WebSocket.OPEN){
        blockAlert("There was a problem with the request please come back later!");
    }

      setMessage('');
    }
  };

    

    useEffect(()=>{
      if(pipelineStudioNodes.length !== 0 && generatedBlockName.length!==0){
        let blockFound = false;
        for(const node of pipelineStudioNodes){
          if(node.data.fromPipelineStudio.name === generatedBlockName){
              blockFound = true;
              setBlockWasPlaced(true);
          }
        }
        if(!blockFound){
          setBlockWasPlaced(false);
        }
      }

    },[pipelineStudioNodes, generatedBlockName])

  return (
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={()=>{props.handleClose();  }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="md"
            fullWidth="md"
        >
            <DialogTitle id="alert-dialog-title">
            {"Automatic Block Generation"}
                <div className="close-button-save-pipeline" onClick={()=>{props.handleClose(); }}> x </div>
            </DialogTitle>
            <Divider/>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <div className='prompt-box-container'>
                   
                    {
                        !blockIsGenerating && !thereWasAnError && !blockResultsGenerated && 
                        <div className='prompt-input-container'>
                            
                                <TextField
                                    id="outlined-multiline-static"
                                    label="Prompt"
                                    multiline
                                    rows={3}
                                    defaultValue="Please provide a prompt to automatically generate a block."
                                    fullWidth
                                    onChange={(evt)=>{setMessage(evt.target.value); }}
                                />
                            <div className='example-text'>eg. Give me a transformer block to apply PCA on a pandas dataframe.</div>
                            <div className='block-type-select'>
                              Block Type:

                              <div className='block-type-select-container'>
                                    <Select
                                        labelId="demo-multiple-name-label"
                                        id="demo-multiple-name"
                                        
                                        value={generatedBlockType}
                                        onChange={(event)=>{ setGeneratedBlockType(event.target.value); dispatch(setStoredGeneratedBlockType(event.target.value))}}
                                        input={<OutlinedInput label="Name" />}
                                        MenuProps={MenuProps}
                                        sx={{width:"200px", marginTop:"10px"}}
                                      >
                                      
                                        <MenuItem
                                          key={"loader"}
                                          value={"loader"}
                                        >
                                          loader
                                        </MenuItem>

                                        <MenuItem
                                          key={"transformer"}
                                          value={"transformer"}
                                        >
                                          transformer
                                        </MenuItem>

                                        <MenuItem
                                          key={"exporter"}
                                          value={"exporter"}
                                        >
                                          exporter
                                        </MenuItem>

                                    </Select>
                              </div>
                                 

                            </div>
                        </div>
                    }
                
                    {
                        blockIsGenerating && !thereWasAnError && 
                            <div className='block-generating-container'>
                                <div class="loader loader-centered">
                                    <div class="dot"></div>
                                    <div class="dot"></div>
                                    <div class="dot"></div>
                                </div> 
                                <div className='generating-block-text'> 
                                  <p> The block is being generated.  </p>
                                  <p>It may take 1-2 mins </p>
                                  <p>Please do not close this window </p>
                                </div>
                                
                            </div>
                    }

                
                 { !blockIsGenerating && !thereWasAnError && !blockResultsGenerated && <Button className="generate-block-btn" disabled={message.length == 0 || !generatedBlockType ||generatedBlockType.length == 0} onClick={()=>{sendMessage(); setBlockIsGenerating(true);  dispatch(setStoredBlockIsGenerating(true))}} variant='contained'> Generate </Button>}   
                 {blockResultsGenerated && !thereWasAnError && 
                  <div className='generated-block-results-container'>
                    {
                      !editorToggle &&
                      <>
                            
                        <div className='generated-block-container'>
                                    <div className='catalog-block-container catalog-block-container-data-loader generated-block-result'>
                                      <div className='catalog-block-container-data-loader-title generated-block-header' title={`${generatedBlockName}`}>
                                          {generatedBlockName}
                                      </div>
                                        <FontAwesomeIcon icon={faCircleInfo}  className=""/> 
                                      <div>
                                          {capitalizeFirstLetter(generatedBlockType)} Block
                                          
                                      </div>
                                    </div>
                              
                            </div> 

                          <div className='generated-block-actions-container'>
                            <Button variant='contained' color='primary' title='Loads the block on the interface' onClick={()=>{loadBlockOnTheInterface()}} disabled={blockWasPlaced}>Load <FontAwesomeIcon icon={faArrowUp}  className='generated-block-actions-icon'/> </Button>
                            <Button variant='contained' color='primary' title='Saves the block as a template in MageAI' onClick={()=>{saveBlockAsTemplate()}}> Save as Template  <FontAwesomeIcon icon={faCloudArrowUp}  className='generated-block-actions-icon'/></Button>
                            <Button variant='contained' color='primary' title='Change Block Name' onClick={()=>{setChangeBlockNameDialog(true)}}> Change Name <FontAwesomeIcon icon={faPen}  className='generated-block-actions-icon'/> </Button>
                            <Button variant='contained' color='primary' onClick={()=>{setEditorToggle(true)}} title='Displays block code'>See code <FontAwesomeIcon icon={faCode}  className='generated-block-actions-icon'/> </Button>
                            <Button variant='contained' color='primary' title='Back to generate menu' onClick={()=>{resetGeneration()}}>Change Prompt  <FontAwesomeIcon icon={faArrowsRotate}  className='generated-block-actions-icon'/> </Button>
                          </div>
                      </>
                    }
                  
                    {
                      editorToggle &&
                        <div className='code-editor-container'> 
                          <Button variant='contained' color='error' onClick={()=>{setEditorToggle(false)}}>Close Editor</Button>
                                <ControlledEditor options={{
                              readOnly: true, // Set the editor to read-only mode
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              contextmenu: false
                            }} height="60vh" className='code-editor' defaultLanguage="python" editable={false}  theme="vs-dark" value={editorValue} onChange={()=>{setEditorValue(defaultEditorValue)}} />

                        </div>         
                    }
                  
        
                  </div>
                 }
                   {
                      thereWasAnError && 
                      <div className='error-container'>
                          <FontAwesomeIcon icon={faCircleXmark} className='error-icon'/>
                          <p>There was an error while generating the block.</p>
                          <p>Please try again later!</p>  
                      </div>
                    }
                </div>
            </DialogContentText>
            </DialogContent>
            <DialogActions>
          
            </DialogActions>

            {changeBlockNameDialog && <ChangeBlockName name={generatedBlockName} handleClose={()=>{setChangeBlockNameDialog(false)}} open={changeBlockNameDialog}  handleAction={(name)=>{setGeneratedBlockName(name); dispatch(setStoredGeneratedBlockName(name)); setChangeBlockNameDialog(false)}} /> }
        </Dialog>
        </ThemeProvider>
    );

}

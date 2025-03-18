import React from "react";
import ReactFlow, { MiniMap,Background, Controls, useNodesState, useEdgesState, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import  { useCallback,useState, useMemo, useEffect, useRef } from 'react';
import 'reactflow/dist/style.css';
import Loader from '../Nodes/Loader.js';
import Transformer from '../Nodes/Transformer.js';
import Exporter from '../Nodes/Exporter.js';
import Custom from '../Nodes/Custom.js';
import CustomEdge from "../CustomEdge/CustomEdge.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPenToSquare, faCircleInfo, faFloppyDisk, faFileArrowUp, faSpinner, faCircleStop, faCirclePlay, faChartLine, faTrashCan} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { setShamrockFileName, setShamrockValues,  setSharmockPipelineName, setFullYAMLDocument, setShamrockWasSaved, setShamrockLastSavedPipeline } from "../../reducers/nodeSlice.js";
import { ShamrockDialog } from "../DataProcessing/dialogs/ShamrockDialog/ShamrockDialog.js";
import SaveDialog from "../DataProcessing/dialogs/SaveDialog/SaveDialog.js";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import toast from 'react-hot-toast';
import {useSelector} from "react-redux/es/hooks/useSelector";
import AreYouSureSimple from "../DataProcessing/dialogs/AreYouSureSimple/AreYouSureSimple.js";
import Graphs from "../DataProcessing/dialogs/Graphs/Graphs.js";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { setShamrockNodes, setShamrockRunData,  setShamrockEdges, setShamrockValueIsModified } from "../../reducers/nodeSlice.js";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import {CREATE_FOLDER,DELETE_FILES_MAGE, FETCH_PIPELINE_RUN_DATA, DELETE_PIPELINE,CREATE_TRIGGER, RUN_STREAMING_PIPELINE, STREAMING_PIPELINE_STATUS, DELETE_TRIGGER } from "../../utils/apiEndpoints.js";
import style from "./Shamrock.css";
import { styled } from '@mui/material/styles';
import yaml from "js-yaml";
import axios from "axios";
import {useDispatch} from 'react-redux';


const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} placement="left" />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#222',
      color: '#fff',
      fontSize: '1.0rem',
      fontWeight: 'bold',
      padding: '10px 15px',
      borderRadius: '8px',
      marginRight:'10px'
    },
   
  }));



export const Shamrock = ()=>{

    const lastSavedPipeline = useSelector((state)=> state.shamrockLastSavedPipeline);
    const wasPipelineSaved = useSelector((state)=> state.shamrockWasSaved);
    const pipelineName = useSelector((state)=> state.shamrockPipelineName);
    const shamrockValues = useSelector((state)=> state.shamrockValues);
    const fullYAMLDocument = useSelector((state)=> state.fullYAMLDocument);
    const shamrockValueWasChanged = useSelector((state)=> state.shamrockValueIsModified);
    const storedShamrockNodes = useSelector((state)=> state.shamrockNodes);
    const storedShamrockEdges = useSelector((state)=> state.shamrockEdges);
    const shamrockWasSaved = useSelector((state)=> state.shamrockWasSaved);
    const shamrockRunData = useSelector((state)=> state.shamrockRunData);
    const shamrockNodeChanged = useSelector((state)=> state.shamrockNodeChanged);
    
    const [isPolling, setIsPolling] = useState(false);
    const [loading, setLoading] = useState(false);
    const [runData, setRunData] = useState(null);
    const [isPipelineStarted, setIsPipelineStarted] = useState(false);
    const [graphsOpen, setGraphsOpen] = useState(false);
    const steps = ["started", "running", "finished"];
    const [stepStatus, setStepStatus] = React.useState([true, true, true]);
    const [activeStep, setActiveStep] = React.useState(-1);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [openError, setOpenError] = useState(false);
    const [openLoading, setOpenLoading] = useState(false);
    const [isPipelineEditorOpen, setIsPipelineEditorOpen] = useState(false);
    

   const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpenSuccess(false);
      setOpenError(false);
      setOpenLoading(false);
    };

    const nameGenerator = ()=>{
    
            let shortName = uniqueNamesGenerator({
            dictionaries: [adjectives, animals, colors], // colors can be omitted here as not used
            length: 2
            });
    
            return shortName;
    }

   

    const blockAlert = (msg) => {
      
        toast.error(msg, {
          autoClose: 2000,
          position: 'top-right',
        });
    }; 

    const blockSuccess = (msg) => {
        toast.success(msg, {
            duration: 2000,
            position: 'top-right',
        })
      }; 



      
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

    const reactFlowStyle = {
        background: '#fff',
        width: '100%',
        height: 300,
      };

      const nodeColor = (node) => {
        switch (node.type) {
            case 'transformer':
            return '#d340cd';
            case 'loader':
            return '#cff6ff';
            case  'exporter':
            return '#dbd112'
            case 'custom':
            return '#7d7d7d'
            case 'generated':
            return '#F56A00'
            default:
                return '#c9c7c7'
        }
      };
  
    const storedShamrockValues = useSelector((state)=> state.shamrockValues);
    const navigate = useNavigate();
    const shamrockIsBeingSaved  = useSelector((state)=> state.shamrockIsBeingSaved);
    const [pastEdges, setPastEdges] = useState([]);
    const [futureEdges, setFutureEdges] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [saveDialog, setSaveDialog] = useState(false);
    const [openActionsMenu, setOpenActionsMenu] = useState(false);
    const [areYouSureOpen , setAreYouSureOpen] = useState(false);
    const [storedValues, setStoredValues] = useState(false);
    const shamrockNodes = useSelector((state)=> state.shamrockNodes);
    const runningPipelines = useSelector((state)=> state.runningPipelines);
    const edgeTypes = useMemo(() => ({ special: CustomEdge }), []);
    const dispatch = useDispatch();
    const nodeTypes = useMemo(() => ({ loader: Loader , transformer:Transformer, exporter:Exporter, custom:Custom}), []);
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const [fetchingStatus, setFetchingStatus] = useState(false);
    const [wsMessage, setWsMessage] = useState([]);
    const [socket, setSocket] = useState(null);
    const [status, setStatus] = useState("🔄 Conectare...");
    const [pipelineStartClicked, setPipelineStartClicked] = useState(false);
    const [peers, setPeers] = useState([]);


    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const updateHistory = (updateFunc, newState, setPast, setFuture) => {
        updateFunc(newState);
        setPast((past) => [...past, newState]);
        setFuture([]);
    };

    const deleteTrigger = async(trigger_id)=>{
      try{
        const resp = await axios.delete(DELETE_TRIGGER(trigger_id));
      } catch(err){
        console.log(err);
      }
    }

    const handleStreamingPipeline = async (status) => {

        if(status === "start"){

          setPipelineStartClicked(true);
            if(!wasPipelineSaved){
                blockAlert("You must save the pipeline first!");
                return;
            }

            setLoading(true);
            let pipelineData;

             try{
             
                  const resp = await axios.post(CREATE_TRIGGER,{
                      name: pipelineName,
                      trigger_type:"time",
                      interval:"once"
                  });
            
              } catch(err){
                console.log(err);
                setPipelineStartClicked(false);
                setLoading(false);
                return;
              }

            try{
                const resp = await axios.get(FETCH_PIPELINE_RUN_DATA(pipelineName));
                setRunData(resp.data);
                dispatch(setShamrockRunData(resp.data));
                pipelineData = resp.data;
            } catch(err){
                console.log(err);
                setPipelineStartClicked(false);
                setLoading(false);
                return;
            }

            
  
        try {
            const response = await axios({
                method:  "PUT",
                url: RUN_STREAMING_PIPELINE,
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    "trigger_id": pipelineData.id,
                    "status": "start",
                    "pipeline_uuid": pipelineName
                }
            })

            if (response.status === 200) {
                blockSuccess("Pipeline status updated successfully!");     
                
            }

        } catch (_) {
            blockAlert("Encounter an error when updating the status of the pipeline!")
            setLoading(false);
            setPipelineStartClicked(false);
            deleteTrigger(pipelineData.id);
            return;
        }

            setIsPolling(true);

        } else if(status === "stop"){

            
            setIsPolling(false);
            setPipelineStartClicked(false);
           try{
              await deleteTrigger(runData.id);
                    blockSuccess("Pipeline status updated successfully!");     
                    setIsPipelineStarted(false);
            } catch(err){
              console.log(err);
              blockAlert("Pipeline status updated successfully!");  
              setLoading(false);
              setWsMessage([]);
              return;
            }

        }
    }


    const onNodeDragStop = (event, node) => {
        setNodes((nds) =>
            nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
        );
        
    };

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
      );

    const onConnect = useCallback(
            (params) => {
                const newEdges = addEdge({ ...params, animated: false, type: "special" }, edges);
                updateHistory(setEdges, newEdges, setPastEdges, setFutureEdges);
                
            },
            [edges, dispatch]
        );

    
    const createFiles = async()=>{
 
            let finalYaml = "";
            let fullYAMLDocumentCopy ;

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
                  topology_name: "CentralTopology",
                  local_epochs: shamrockValues["inputtedValues"]["local_epochs"],
                  max_iter: shamrockValues["inputtedValues"]["max_iter"],
                  log_file: "metrics.txt"
                },
                model: {
                  // model_uri: `${process.env.REACT_APP_MLFLOW_API_URL}/model/package?name=${shamrockModelName}`,
                  model:"simple_cnn",
                  optimizer: shamrockValues["selectedDropdownValues"]["framework"],
                  lr: shamrockValues["inputtedValues"]["lr"],
                  batch_size: shamrockValues["inputtedValues"]["batch_size"],
                  loss: shamrockValues["selectedDropdownValues"]["loss"],
                  metrics: ["accuracy_score"]
                },
                seed: 12645,
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

              /* Change code here to match the uploaded path !! */

              fullYAMLDocumentCopy = JSON.parse(JSON.stringify(fullYAMLDocument));
              fullYAMLDocumentCopy["model"]["model"]="simple_cnn";
              fullYAMLDocumentCopy["topology"]["topology_name"]="CentralTopology";
              // fullYAMLDocumentCopy["model"]["model_uri"] = `${process.env.REACT_APP_MLFLOW_API_URL}/model/package?name=${shamrockModelName}`
              fullYAMLDocumentCopy["log_file"] = `/home/src/default_repo/configs/${pipelineName}/results/server.txt`;
              finalYaml = fullYAMLDocumentCopy;
            }
        
         
            
            finalYaml = yaml.dump(fullYAMLDocumentCopy);
        
    
            try{
              const resp = await axios.post(CREATE_FOLDER,{
                type:"file",
                name:"model_files.yaml",
                path:`configs/${pipelineName}`,
                content:finalYaml,
                overwrite:true
              });
              
              dispatch(setShamrockValueIsModified(false));
            } catch(err){
              console.log("There was an error while uploading the file!");
              throw err;
            }

    }

    async function readStream(stream) {
      const reader = stream.getReader();
      
      try {
          while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;
              if(fetchingStatus === true){
                setFetchingStatus(false);
              }
              
              const pipelineStatus = new TextDecoder().decode(value);
              
              if(pipelineStatus.trim() === "\"active\""){
                setIsPipelineStarted(true);
                setLoading(false);
                reader.releaseLock();
              } 
              
          }
      } catch (error) {
          console.error("Stream reading error", error);
           
      } finally {
          reader.releaseLock();
          
      }

    }

 

    useEffect(()=>{

    if (storedShamrockValues && Object.keys(storedShamrockValues).length !== 0) {
        
        setStoredValues(true);
        setOpenDialog(false);
        setOpenActionsMenu(true);

        } else if (fullYAMLDocument && Object.keys(fullYAMLDocument).length !== 0) {
        
        setStoredValues(true);
        setOpenDialog(false);
        setOpenActionsMenu(true);

        } else {

        setStoredValues(false);
        setOpenDialog(true);
        setOpenActionsMenu(false);

       } 

    },[shamrockValues, fullYAMLDocument])



    const clearPipeline = async()=>{

      if(shamrockWasSaved){
        if(runData){
            try{
            await deleteTrigger(runData.id);
          } catch(err){
            blockAlert("There was an error!")
            console.log(err);
          }
        }
       

          try{
            const resp = await axios.delete(DELETE_PIPELINE(pipelineName));
            
          } catch(err){
            console.log(err);
            blockAlert("There was an error!")
            return;
          }
    
          try{
    
            const resp = await axios.delete(DELETE_FILES_MAGE, {
              data: {
                type: "folders",
                name: pipelineName
              }
            });
    
          } catch(err){
              blockAlert("There was an error while deleting the pipeline!");
              return;
          }
      }


        blockSuccess("Pipeline deleted successfully!");
        setNodes([]);
        setEdges([]);
        dispatch(setShamrockFileName(""));
        dispatch(setShamrockValues({}));
        dispatch(setSharmockPipelineName(""));
        dispatch(setFullYAMLDocument({}));
        setStoredValues(false);
        setOpenDialog(true);
        setOpenActionsMenu(false);
        dispatch(setShamrockEdges([]));
        dispatch(setShamrockNodes([]));
        dispatch(setShamrockWasSaved(false));
        dispatch(setShamrockLastSavedPipeline(""));
        dispatch(setShamrockRunData(null));
        setLoading(false);
        setIsPipelineStarted(false);

    }   

    const handleOpenGraph = ()=>{
      if(!isPipelineStarted){
        blockAlert("Please start the pipeline to view the graphs!");
      }  else {
        setGraphsOpen(true);
      }
    }

   
    useEffect(()=>{
        if(storedShamrockEdges && storedShamrockNodes && storedShamrockEdges.length!=0 && storedShamrockNodes.length != 0){
            setEdges(storedShamrockEdges);
            setNodes(storedShamrockNodes);
        } 

    },[])


    useEffect(()=>{
        
        setNodes([]);
        setTimeout(() => setNodes(storedShamrockNodes), 0);
        setEdges(storedShamrockEdges);
    },[storedShamrockNodes, storedShamrockNodes])

    useEffect(()=>{

    },[])

    const fetchDataFirst = async () => {
      if(!pipelineName){
        return;
      }

      try {
          
          const response = await fetch(STREAMING_PIPELINE_STATUS(pipelineName));

          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
         await readStream(response.body);
         setFetchingStatus(false);
         
      } catch (error) {
          console.error("Error fetching data:", error.message);
          setIsPolling(false);
          setFetchingStatus(false);
      }
  };

    useEffect(() => {

      if (!isPolling) {
          return;
      }
  
      const fetchData = async () => {

        try {
            
            const response = await fetch(STREAMING_PIPELINE_STATUS(pipelineName));
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            await readStream(response.body);
           
        } catch (error) {
            console.error("Error fetching data:", error.message);
            setIsPolling(false);
        }
    };
    
  
      fetchData();
      const interval = setInterval(fetchData, 3000);
  
      return () => {
          clearInterval(interval);
      };
  
  }, [isPolling]);

  useEffect(()=>{
    fetchDataFirst();
    if(shamrockWasSaved){
      setFetchingStatus(true);
    } else {
      setFetchingStatus(false);
    }

  },[])

  useEffect(()=>{
    if(shamrockRunData){
      setRunData(shamrockRunData);
    }
  },[])

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);


  
  useEffect(() => {
    let ws; // Declare WebSocket variable outside
    setWsMessage([]);
    if (isPipelineStarted) {
      // Start WebSocket connection
      ws = new WebSocket(`${process.env.REACT_APP_MAGE_WS_URL}/mage/ws`);
  
      ws.onopen = () => {
        console.log("WebSocket s-a conectat!");
        setStatus("Conectat");
      };
  
      ws.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);
       
        if(newMessage.done!=="active"){
          deleteTrigger(runData.id);
          blockSuccess("The pipeline execution is complete!")
          setLoading(false);
          setPipelineStartClicked(false);
        }
        setPeers(newMessage.peers);
        setWsMessage(newMessage.data);
      };
  
      ws.onerror = (error) => {
        console.error("Eroare WebSocket:", error);
        setStatus("Eroare la conexiune");
      };
  
      ws.onclose = () => {
        console.log("WebSocket s-a închis!");
        setStatus("Deconectat");
      };
  
      setSocket(ws);
    }
  
    // Cleanup: Close WebSocket if pipeline stops
    return () => {
      if (ws) {
        ws.close();
        console.log("WebSocket închis din cleanup.");
      }
    };
  }, [isPipelineStarted]);


  return(
    <div style={{ width: '100vw', height: '100vh' }}>

    {isPipelineEditorOpen && 
        <div className="left-back-icon">
          <FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{navigate("/")}} className="left-icon-studio"/>
        </div>  
    }

        { openDialog && <ShamrockDialog open={openDialog} handleClose={()=>{setOpenDialog(false)}}  setIsPipelineEditorOpen={setIsPipelineEditorOpen}/>}

        {
            openActionsMenu &&
            <div className="container shamrock-pipeline-run">
                        <>
                          {
                            fetchingStatus? 
                            <div className="pipeline-controller pipeline-loading">
                                    <p className="play-btn"><FontAwesomeIcon icon={faSpinner} spin /></p>
                                    <p>Fetching pipeline status</p>
                              </div>

                              :

                              loading ?
                                <div className="pipeline-controller pipeline-loading">
                                    <p className="play-btn"><FontAwesomeIcon icon={faSpinner} spin /></p>
                                    <p>Starting Pipeline...</p>
                                </div>
                            : isPipelineStarted ?
                                <div className="pipeline-controller pipeline-started">
                                        <p className="play-btn" onClick={() => handleStreamingPipeline("stop")}><FontAwesomeIcon icon={faCircleStop} /></p>
                                    <p>Running...</p>
                                </div> :
                                    <div className="pipeline-controller">
                                        <p className="play-btn" onClick={() => handleStreamingPipeline("start")}><FontAwesomeIcon icon={faCirclePlay} /></p>
                                        <p>Start Pipeline</p>
                                    </div>
                            }

                        </>
                                                        
                    </div>        
        }
        

        { openActionsMenu

                &&
                <div className="shamrock-controls">


                    <CustomTooltip title="Delete">
                        <FontAwesomeIcon icon={faTrashCan}  onClick={()=>{setAreYouSureOpen(true)}} className="delete-icon-side"/>
                    </CustomTooltip>
                                        
                    <CustomTooltip title={pipelineName.length === 0 ? "Pipeline not saved" : pipelineName}>
                        <FontAwesomeIcon icon={faCircleInfo}  className="info-icon-side"/>
                    </CustomTooltip>

                    <CustomTooltip title="Edit Pipeline Parameters">
                        <FontAwesomeIcon icon={faPenToSquare} onClick={() => {if(isPipelineStarted){ blockAlert("Stop the pipeline to edit parameters!"); return;} setOpenDialog(true); }} className="info-icon-side"/>
                    </CustomTooltip>
                    
        
                    <CustomTooltip title="Graphs">
                        <FontAwesomeIcon icon={faChartLine}  className="info-icon-side" onClick={()=>{handleOpenGraph()}} />
                    </CustomTooltip>

                    <CustomTooltip title= { (!((!pipelineName || (pipelineName && pipelineName.length==0) || shamrockValueWasChanged))) ? "Save new values": "Save pipeline" } >
                        <FontAwesomeIcon icon={faFloppyDisk} onClick={() => { if(!shamrockWasSaved){setSaveDialog(true)} }} className="info-icon-side"/>
                        { (!pipelineName || (pipelineName && pipelineName.length==0) || shamrockValueWasChanged) && <span className="red-dot"></span> } 
                    </CustomTooltip>

                </div>
        }
            

            <div>
                {saveDialog && 
                    <SaveDialog open={saveDialog} handleClose={()=>{setSaveDialog(false)}} alertUser={(alert_type)=>{ if(alert_type ==="success"){  setOpenLoading(false); setOpenSuccess(true)} else if(alert_type==="error") { setOpenLoading(false); setOpenError(true) } else { setOpenLoading(true)}}} />
                }
            </div>

            {areYouSureOpen && <AreYouSureSimple handleAction={()=>{clearPipeline(); setIsPipelineEditorOpen(false)}} open={areYouSureOpen} dialogText={"Are you sure you want to delete this pipeline ?"} handleClose={()=>{setAreYouSureOpen(false)}} />}
            {graphsOpen && <Graphs open={graphsOpen} handleClose={()=>{setGraphsOpen(false)}} graphData={wsMessage} peers={peers} />}
           
           <Snackbar open={openSuccess}  onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <Alert
                onClose={handleClose}
                severity="success"
                variant="filled"
                sx={{ width: '100%' }}
                 
            >
              The pipeline was successfully saved!
                </Alert>
              </Snackbar> 

              <Snackbar open={openError}  onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert
                  onClose={handleClose}
                  severity="error"
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  Something went wrong when saving the pipeline!
                </Alert>
            </Snackbar> 

             <Snackbar
                open={openLoading}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Alert
                  onClose={handleClose}
                  variant="filled"
                  severity="info"
                  sx={{
                    width: '100%',
                    backgroundColor: '#1976d2', 
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                 
                  Saving pipeline...
                </Alert>
              </Snackbar>

        <ReactFlow 
                style={reactFlowStyle}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeDragStop={onNodeDragStop}
                onNodesChange={onNodesChange}
        >   
                    <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable style={{
                        border: "1px solid black"
                    }}
                    maskColor="rgb(0,0,0, 0.1)" />

                    <Background variant='dots' color="#000" />
                    <Controls />
             </ReactFlow>

            
    </div>
  )

};

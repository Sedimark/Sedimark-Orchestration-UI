import ReactFlow, { MiniMap,Background, Controls, useNodesState, useEdgesState, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import  { useCallback,useState, useMemo, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loader from '../../Nodes/Loader.js';
import 'reactflow/dist/style.css';
import Transformer from '../../Nodes/Transformer.js';
import Exporter from '../../Nodes/Exporter.js';
import Custom from '../../Nodes/Custom.js';
import { faArrowLeft, faPlus,  faBroom, faCircleInfo, faGear} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import ExporterDialog from "../../DataProcessing/dialogs/ExporterDialog/ExporterDialog.js";
import DrawIcon from '@mui/icons-material/Draw';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Button from '@mui/material/Button';
import GeneratedNode from "../../Nodes/GeneratedNode.js";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import SelectPipelineType from "../../DataProcessing/dialogs/SelectPipelineType/SelectPipelineType.js";
import BlockCatalog from "../../DataProcessing/dialogs/BlockCatalog/BlockCatalog.js";
import CustomEdge from "../../CustomEdge/CustomEdge.js";
import PhotoFilterIcon from '@mui/icons-material/PhotoFilter';
import { styled} from '@mui/material/styles';
import AreYouSure from "../../DataProcessing/dialogs/AreYouSure/AreYouSure.js";
import toast from 'react-hot-toast';
import GenerateBlocks from "../../DataProcessing/dialogs/GenerateBlocks/GenerateBlocks.js";
import style from "./PipelineCreatorCanvas.css";
import BlockDescription from "../../DataProcessing/dialogs/BlockDescription/BlockDescription.js";
import PipelineInfo from "../../DataProcessing/dialogs/PipelineInfo/PipelineInfo.js";
import { useSelector } from "react-redux";
import {useDispatch} from 'react-redux';
import SavePipeline from "../../DataProcessing/dialogs/SavePipeline/SavePipeline.js";
import { SAVE_PIPELINE } from "../../../utils/apiEndpoints.js";
import { setStoredPipelineName, setErrorWhileGenerating, setNotifyBlockGenerated,setPipelineStudioNodes,setPipelineStudioEdges, setPipelineStudioFirstTime, setPipelineStudioPipelineType, setBlockCatalogSelectedOptions} from "../../../reducers/nodeSlice.js";
import axios from "axios";

 
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
      color: 'white',
      maxWidth: 1000,
      boxShadow: theme.shadows[1],
      fontSize: 16, // Custom font size
      padding: '20px 20px', // Custom padding for larger tooltip
  },
}));

export const PipelineCreatorCanvas = ()=>{

    const generatedBlockName = useSelector((state)=> state.generatedBlockName);
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const [blockGenerated, setBlockGenerated] = useState(false);
    const [pastNodes, setPastNodes] = useState([]);
    const [futureNodes, setFutureNodes] = useState([]);
    const [pastEdges, setPastEdges] = useState([]);
    const [futureEdges, setFutureEdges] = useState([]);

    const navigate = useNavigate();
    const pipelineNameStored = useSelector((state)=> state.pipelineStudioPipelineName);
    const storedUserNotified = useSelector((state)=> state.notifyBlockGenerated);
    const firstRender5 = useRef(true);
    const [exporterMenuOpen, setExporterMenuOpen] = useState(false);
    const [generateBlockOpen, setGenerateBlockOpen] = useState(false);
    const [displayPipelineTypeMenu, setDisplayPipelineTypeMenu] = useState(false);
    const [isBlockCatalogOpen, setIsBlockCatalogOpen] = useState(false);
    const [firstTime, setFirstTime] = useState(true);
    const [pipelineType, setPipelineType] = useState("");
    const [isAreYouSureOpen, setIsAreYouSureOpen] = useState(false);
    const [firstRender, setFirstRender] = useState(true);
    const [firstRender2, setFirstRender2] = useState(true);
    const [firstRender3, setFirstRender3] = useState(true);
    const [firstRender4, setFirstRender4] = useState(true);
    const [isSavePipelineOpen, setIsSavePipelineOpen] = useState(false);
    const [pipelineToSaveName, setPipelineToSaveName] = useState("");
    const [blockDescriptionOpen, setBlockDescriptionOpen] = useState(false);
    const storedPipelineType = useSelector((state)=> state.pipelineStudioPipelineType);
    const storedFirstTime = useSelector((state)=>state.pipelineStudioFirstTime);
    const storedPipelineNodes = useSelector((state)=> state.pipelineStudioNodes);
    const [blockTemplateMetadata, setBlockTemplateMetadata] = useState({});
    const [pipelineInfoOpen, setPipelineInfoOpen] = useState(false);
    const catalogueBlocks = useSelector((state) => state.blockCatalogSelectedOptions);

    const edgeToDelete = useSelector((state)=> state.pipelineStudioEdgeToDelete);
    const storedEdges = useSelector((state)=>state.pipelineStudioEdges);
    const dispatch = useDispatch();
    const edgeTypes = useMemo(() => ({ special: CustomEdge }), []);
    const nodeTypes = useMemo(() => ({ loader: Loader , transformer:Transformer, exporter:Exporter, custom:Custom, generated: GeneratedNode}), []);
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


    const updateHistory = (updateFunc, newState, setPast, setFuture) => {
        updateFunc(newState);
        setPast((past) => [...past, newState]);
        setFuture([]);
    };

    const onNodesChange = useCallback(
        (changes) => {
            const newNodes = applyNodeChanges(changes, nodes);
            const removedNodes = changes.filter(change => change.type === "position" && !change.dragging);

            if (removedNodes.length > 0) {
                updateHistory(setNodes, newNodes, setPastNodes, setFutureNodes);
            } else {
                setNodes(newNodes);
            }
            dispatch(setPipelineStudioNodes(newNodes));
        },
        [nodes, dispatch]
    );

    const onEdgesChange = useCallback(
        (changes) => {
          const removedEdges = changes.filter(change => change.type === 'remove');
          const newEdges = applyEdgeChanges(changes, edges);
          if (removedEdges.length > 0) {
              updateHistory(setEdges, newEdges, setPastEdges, setFutureEdges);
          } else {
              setEdges(newEdges);
          }
          dispatch(setPipelineStudioEdges(newEdges));
        },
        [edges, dispatch]
    );

    const onConnect = useCallback(
        (params) => {
            const newEdges = addEdge({ ...params, animated: false, type: "special" }, edges);
            updateHistory(setEdges, newEdges, setPastEdges, setFutureEdges);
            dispatch(setPipelineStudioEdges(newEdges));
        },
        [edges, dispatch]
    );

    useEffect(() => {
       
    }, [nodes, catalogueBlocks]);

    const handleUndo = () => {
        setPastNodes((past) => {
            if (past.length === 0) return past;
            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);
            const newCatalogue = [];
            setFutureNodes((future) => [nodes, ...future]);

            for (const block of previous) {
                newCatalogue.push({
                    description: block["data"]["fromPipelineStudio"]["description"],
                    name: block["data"]["fromPipelineStudio"]["name"],
                    type: "loader" === block["type"] || "exporter" === block["type"] ? `data_${block["type"]}` : block["type"]
                })
            }

            setNodes(previous);
            dispatch(setPipelineStudioNodes(previous));
            dispatch(setBlockCatalogSelectedOptions(newCatalogue));
            return newPast;
        });
        setPastEdges((past) => {
            if (past.length === 0) return past;
            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);
            setFutureEdges((future) => [edges, ...future]);
            setEdges(previous);
            dispatch(setPipelineStudioEdges(previous));
            return newPast;
        });
    };

    const handleRedo = () => {
        setFutureNodes((future) => {
            if (future.length === 0) return future;
            const next = future[0];
            const newFuture = future.slice(1);
            const newCatalogue = [];
            setPastNodes((past) => [...past, nodes]);

            for (const block of next) {
                newCatalogue.push({
                    description: block["data"]["fromPipelineStudio"]["description"],
                    name: block["data"]["fromPipelineStudio"]["name"],
                    type: "loader" === block["type"] || "exporter" === block["type"] ? `data_${block["type"]}` : block["type"]
                })
            }

            setNodes(next);
            dispatch(setPipelineStudioNodes(next));
            dispatch(setBlockCatalogSelectedOptions(newCatalogue));
            return newFuture;
        });
        setFutureEdges((future) => {
            if (future.length === 0) return future;
            const next = future[0];
            const newFuture = future.slice(1);
            setPastEdges((past) => [...past, edges]);
            setEdges(next);
            dispatch(setPipelineStudioEdges(next));
            return newFuture;
        });
    };

    const handleKeyDown = useCallback(
        (event) => {
            if (event.ctrlKey || event.metaKey) {
                if (event.key === 'z') {
                    event.preventDefault();
                    handleUndo();
                } else if (event.key === 'y') {
                    event.preventDefault();
                    handleRedo();
                }
            }
        },
        [nodes, edges]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    useEffect(() => {
      if (!firstRender5.current) return;
      
      firstRender5.current = false;
      setNodes(storedPipelineNodes);
      setEdges(storedEdges);    
    }, [storedPipelineNodes, storedEdges]);

    const onNodeDragStop = (event, node) => {
        setNodes((nds) =>
            nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
        );
        dispatch(setPipelineStudioNodes(nodes));
    };

    const createPipeline = ()=>{
      setDisplayPipelineTypeMenu(true);
    }

    useEffect(()=>{
      if(pipelineType.length!=0){
        setFirstTime(false);
      } else {
        setFirstTime(true);
      }
      
    },[pipelineType])

    const setTheNodes = (allNodes)=>{
      setPipelineStudioNodes(allNodes);
    }

    const deleteViewPipeline = ()=>{
      setNodes([]);
      setEdges([]);
      dispatch(setPipelineStudioEdges([]));;
      dispatch(setPipelineStudioNodes([]));
      dispatch(setBlockCatalogSelectedOptions([])); 
      dispatch(setStoredPipelineName(""));
    }

    const deleteOneEdge = (edgeToDelete)=>{
      
      setEdges((eds) => eds.filter((e) => e.id !== edgeToDelete));
    }

    useEffect(()=>{ 
      
      setNodes(storedPipelineNodes);
    },[storedPipelineNodes])

    useEffect(()=>{
      deleteOneEdge(edgeToDelete);
    },[edgeToDelete])

    useEffect(()=>{

      if(firstRender === true){
        setFirstRender(false);
        if(storedEdges.length !== 0){
          setEdges(storedEdges);
        }
      } 
     
    },[storedEdges])

    const verifyAddedEdgeIsOk = ()=>{
  
      if (edges.length === 0 ){
       return;
   
      } else {
         const sourceEdges = [];
         const targetEdges = [];
         let lastEdgeSource = edges[edges.length-1].source;
         let lastEdgeTarget = edges[edges.length-1].target; 

         // verifica daca nu cumva nodul la care se conecteaza nu este cumva unul de tip exporter
        

        const nodeSource = nodes.find((node)=> node.id === lastEdgeSource);
        const nodeTarget = nodes.find((node)=> node.id === lastEdgeTarget);
       
      
        if(nodeSource && nodeTarget){
          if(nodeSource.type === "loader" && nodeTarget.type === "exporter" ){
              deleteOneEdge(edges[edges.length-1].id);
              return;
          } else if(nodeTarget.type === "exporter" || (nodeTarget.type === "generated" && nodeTarget.data.fromPipelineStudio.type === "exporter")){
            return;
          }
        }
       
      
         if (lastEdgeSource === lastEdgeTarget){
           deleteOneEdge(edges[edges.length-1].id);
           return;
         } 
         for(const edg of edges){
           sourceEdges.push(edg.source);
           targetEdges.push(edg.target);
         }
         

         sourceEdges.pop();
         targetEdges.pop();
         if((sourceEdges.indexOf(lastEdgeSource)!==-1 || targetEdges.indexOf(lastEdgeTarget)!==-1 ) ) {
           deleteOneEdge(edges[edges.length-1].id);
           return;
         }
      }
      
     }

  

    const dfs = (vertex, visited, adjacencyList)=>{
        if (visited.has(vertex)) return;

        visited.add(vertex);

        const neighbors = adjacencyList[vertex];
        if (neighbors) {
          neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
              dfs(neighbor, visited, adjacencyList);
            }
          });
        }
    }

    const blockAlert = (msg) => {
      toast.error(msg, {
          duration: 2000,
          position: 'top-right',
      })
    }; 

    const blockSuccess = (msg) => {
      toast.success(msg, {
          duration: 2000,
          position: 'top-right',
      })
    }; 


    

    const checkNodes = ()=>{

        if(nodes.length === 0){
          blockAlert("There is no block on the interface!");
          return;
        }

        let foundLoader = false;
        let foundTransformer = false;
        let foundExporter = false;

       
        for(const node of nodes){
          
          if(node.type === "loader" || (node.type === "generated" && node.data.fromPipelineStudio.type === "loader")){
            foundLoader = true;
          } else if(node.type === "transformer" || (node.type === "generated" && node.data.fromPipelineStudio.type === "transformer")){
            foundTransformer = true;
          } else if(node.type === "exporter" || (node.type === "generated" && node.data.fromPipelineStudio.type === "exporter")){
            foundExporter = true;
          }
        }

        if(!foundLoader || !foundTransformer || !foundExporter){
          blockAlert("You should have at least one transformer, one exporter and one loader");
          return;
        }

        if(edges.length < 2){
          blockAlert("There should be at least 2 connections");
          return;
        }

        const adjacencyList = {};
        const visited = new Set();
        edges.forEach((edge)=>{
          const { source, target } = edge;
          if (!adjacencyList[source]) adjacencyList[source] = [];
          if (!adjacencyList[target]) adjacencyList[target] = [];
          adjacencyList[source].push(target);
        })
      
      let start;
      for(const node of nodes){
        if(node.type === "loader"){
          start = node.id;
        }
      }

      dfs(start,visited, adjacencyList);

      if(visited.size !== nodes.length){
        blockAlert("There should be only one flow on the page!")
        return;
      }


      setIsSavePipelineOpen(true);
     }

     const savePipelineData = async()=>{
      
      try{
        const resp = await axios.post(SAVE_PIPELINE(pipelineToSaveName));
      } catch(err){
        console.log(err);
      }

     }

    useEffect(()=>{

      if(edges.length != 0){
        verifyAddedEdgeIsOk();
      }

      if(!firstRender5.current) {
        dispatch(setPipelineStudioEdges(edges));
      }
      
     
    },[edges])

 
    useEffect(()=>{
      if(firstRender3 === false){
        dispatch(setPipelineStudioPipelineType(pipelineType));
      }
      
    },[pipelineType])

    useEffect(()=>{
      if(firstRender3 === true){
        setPipelineType(storedPipelineType);
        setFirstRender3(false);
      }
    },[storedPipelineType])

    useEffect(()=>{

      if(firstRender2 === true){
        setFirstTime(storedFirstTime);
        setFirstRender2(false);
      }
    },[storedFirstTime])

    useEffect(()=>{
      if(firstRender2 === false){
        dispatch(setPipelineStudioFirstTime(firstTime));
      }
      
    },[firstTime])

    const openBlockDescription = ()=>{
      setGenerateBlockOpen(false);
      setBlockDescriptionOpen(true);
    } 

    const closeBlockDescription = ()=>{
      setGenerateBlockOpen(true);
      setBlockDescriptionOpen(false);
    }

    useEffect(()=>{
      
      if(!firstRender4){
          setFirstRender4(false);
          dispatch(setStoredPipelineName(pipelineNameStored));
      }
      
    },[pipelineNameStored])


    return(
        <div style={{ width: '100vw', height: '100vh' }}>
           <div className="left-back-icon">
                      <FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{navigate("/")}} className="left-icon-studio"/>
            </div>  
        {
          !firstTime && <>
                  
 
                <div className="pipeline-controller pipeline-studio-section-title">
                      <p>AI Pipelines Studio <DrawIcon className="pipeline-studio-section-title-logo"/> </p>
                </div>

                <div className="add-blocks-icon-container">
                   
                    <div className="toolbox-btn toolbox-top-btn" onClick={()=>{setIsBlockCatalogOpen(true)}} title="Add a block">
                        <AddBoxIcon className="add-blocks-icon" style={{fontSize:"3.5rem"}} />
                        <p>Add</p>
                    </div>
                    <div className="toolbox-btn" onClick={()=>{checkNodes()}} title="Save pipeline">
                        <CheckBoxIcon className="add-blocks-icon" style={{fontSize:"3.5rem"}}/>
                        <p>Save</p>
                    </div>
                    
                    <div className="toolbox-btn " title="Generate blocks" onClick={()=>{setGenerateBlockOpen(true); dispatch(setNotifyBlockGenerated(false))}}>
                    {storedUserNotified && <span className='generated-notifications'> 1 </span>} 
                      <PhotoFilterIcon className="add-blocks-icon" style={{fontSize:"3.5rem"}}/>
                        <p>Generate</p>
                    </div>

                    
                    
                </div>
                
              {
                storedPipelineNodes.length!=0 &&
                <div className="side-info-container-pipeline-studio">
                  <Tooltip title={`Change Pipeline Type`}>
                      <Button onClick={()=>{setDisplayPipelineTypeMenu(true)}}><FontAwesomeIcon icon={faGear}  className="info-icon-side-creator-studio"/>   </Button>
                  </Tooltip>

                  <Tooltip title="Clear">
                      <FontAwesomeIcon icon={faBroom}  onClick={()=>{setIsAreYouSureOpen(true)}} className="trash-icon-side"/>
                  </Tooltip>

                  <Tooltip title="Info">
                      <FontAwesomeIcon icon={faCircleInfo}  onClick={()=>{setPipelineInfoOpen(true)}} className="info-icon-side-pipeline-studio"/>
                  </Tooltip>
                </div>
              }
                   
           </>
        }
          
        {
          firstTime && 
          <div className="pipeline-controller pipeline-studio-section-title pipeline-create-btn" style={{backgroundColor:"green"}} onClick={()=>{createPipeline()}}>
            <p> Create new Pipeline <AddBoxIcon className="pipeline-studio-section-title-logo" style={{ position:"relative" ,top:"5px", fontSize:"1.7rem"}}/> </p>
          </div>
        }

        <ReactFlow 
          style={reactFlowStyle}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeDragStop={onNodeDragStop}
        >
            <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable style={{
                border: "1px solid black"
            }}
            maskColor="rgb(0,0,0, 0.1)" />

            <Background variant='dots' color="#000" />
            <Controls />
        </ReactFlow>
 
       { displayPipelineTypeMenu && <SelectPipelineType setPipelineType={(value)=>{setPipelineType(value)}} open={displayPipelineTypeMenu} handleClose={()=>{setDisplayPipelineTypeMenu(false)}} /> }
       { isBlockCatalogOpen && <BlockCatalog setNodes={setTheNodes} open={isBlockCatalogOpen} handleClose={()=>{setIsBlockCatalogOpen(false)}} pipelineType={pipelineType} /> }
       {isAreYouSureOpen && <AreYouSure pipelineStudio = {true} open={isAreYouSureOpen}  handleClose={()=>{setIsAreYouSureOpen(false)}} handler={()=>{deleteViewPipeline()}} />}
       
       {blockDescriptionOpen && <BlockDescription blockTemplateMetadata={blockTemplateMetadata} closeBlockDescription={closeBlockDescription} open={blockDescriptionOpen} handleAction={()=>{}} handleClose={()=>{setBlockDescriptionOpen(false); setGenerateBlockOpen(true)}}/>}
       {isSavePipelineOpen && <SavePipeline edges={edges} allBlocks={nodes} pipelineType={pipelineType} storePipelineName = {(name)=>{setPipelineToSaveName(name)}}  open={isSavePipelineOpen} handleClose={()=>{setIsSavePipelineOpen(false)}}  handleAction={()=>{savePipelineData()}} />} 
       {generateBlockOpen && <GenerateBlocks setBlockTemplateMetadata={setBlockTemplateMetadata} openBlockDescription={openBlockDescription} open={generateBlockOpen} handleClose={()=>{setGenerateBlockOpen(false); dispatch(setErrorWhileGenerating(false))}} postLoadAction={()=>{ setTimeout(()=>{blockSuccess("Block was loaded successfully!")},500)}} handleAction={()=>{}} /> }
       {pipelineInfoOpen && <PipelineInfo open={pipelineInfoOpen}  handleClose={()=>{setPipelineInfoOpen(false)}} handle></PipelineInfo>}
     
        </div>
    ); 
}
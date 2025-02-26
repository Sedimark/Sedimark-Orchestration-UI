import React, { useCallback,useState, useMemo, useEffect } from 'react';
import style from "./Flow.css";
import ReactFlow, { MiniMap,Background, Controls, useNodesState, useEdgesState, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import Loader from '../Nodes/Loader.js';
import Transformer from '../Nodes/Transformer.js';
import Exporter from '../Nodes/Exporter.js';
import Custom from '../Nodes/Custom.js';
import 'reactflow/dist/style.css';
import {formatString} from "../../utils/formatString.js";
import {useSelector} from "react-redux/es/hooks/useSelector";
import toast from 'react-hot-toast';
import {
  setMappedNodes,
  setMappedEdges,
  setOrderedNodes,
  setSelectedPipelineName,
  setStoredNodes,
  setSelectedPipelineNamePrediction,
  setSelectedPipelinePrediction,
  setPipelineNumberOfVariables
} from "../../reducers/nodeSlice.js";
import {useDispatch} from 'react-redux';
import { FETCH_PIPELINE_DATA, FETCH_PIPELINE_PREDICT_DATA } from '../../utils/apiEndpoints.js';
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";

function Flow(props) {
  
  const selectedTab = useSelector((state)=> state.selectedTab);
  const selectedTrainedModel = useSelector((state)=> state.selectedTrainedModel);
  const selectedPipelineTrain = useSelector((state)=> state.selectedPipelineTrain);
  const blockVariablesCount = useSelector((state)=> state.pipelineNrOfVariables);
  const storedPipelineBlocksInfo = useSelector((state)=> state.pipelinesBlocks);
  const selectedPipelineDataPreProcessing = useSelector((state)=> state.selectedPipelineDataPreprocessing);
  const selectedPipelinePrediction = useSelector((state)=> state.selectedPipelinePrediction);
  const selectedPipelineStreaming = useSelector((state)=> state.selectedPipelineStreaming);
  const nodeTypes = useMemo(() => ({ loader: Loader , transformer:Transformer, exporter:Exporter, custom:Custom}), []);
  const edgeTypes = useMemo(() => ({ }), []);
  const initialNodes = []; 
  const initialEdges = [];
  const [isPipelineLoading, setIsPipelineLoading] = useState(false);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [pipelineEdges, setPipelineEdges] = useState([]);
  const [wereEdgesPlaced, setWereEdgesPlaced] = useState(false);
  const [currentBlockVariables, setCurrentBlockVariables] = useState({});
  const dispatch = useDispatch();
  const [selectedPipeline, setSelectedPipeline] = useState([]);
 
  let edgePlaced = false;
  
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge({ ...params, animated: false }, eds)),
    []
  );
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
      default:
          return '#c9c7c7'
    }
  };


  const addNodes = (nodeData , pipeline_name) => {
    const newNodes = [];
    const positions = {};
    let finalNodes = [];

    const setPosition = (nodes, currentNode, x, y) => {
      finalNodes.push(currentNode.node_id);
      if (currentNode.upstream_blocks.length === 0) {
        positions[currentNode.node_id] = [0, 0];
      } else {
        positions[currentNode.node_id] = [x, y];
      }

      currentNode.downstream_blocks.forEach((downStreamNode, index) => {
        if (index % 2 === 0) {
          if (index > 1) {
            const foundNode = nodes.find(node => node.node_id === downStreamNode);
            if(foundNode){
              setPosition(nodes, foundNode, x + 700, y + (index - 1) * 500);
            }
          } else {
            const foundNode = nodes.find(node => node.node_id === downStreamNode);
            if(foundNode){
              setPosition(nodes, foundNode, x + 700, y + index * 500);
            }
          }
        } else {
          if (index > 1) {
            const foundNode = nodes.find(node => node.node_id === downStreamNode);
            if(foundNode){
              setPosition(nodes, foundNode, x + 700, y - (index - 1) * 500);
            }
          } else {
            const foundNode = nodes.find(node => node.node_id === downStreamNode);
            if(foundNode){
              setPosition(nodes, foundNode, x + 700, y - index * 500);
            }
          }
        }
      })
    }

    let firstBlock = 0;

    for (let i = 0; i < nodeData.length; i++) {
      if (nodeData[i].upstream_blocks.length === 0) {
        firstBlock = i;
        break;
      }
    }
    
    setPosition(nodeData, nodeData[firstBlock], 0, 0);
    

    for(let nodeType of nodeData){
      
      const nodeData = nodeType.config;
      nodeData.pipelineName = selectedPipeline[0];
  
      
      if(nodeType.type === "Loader"){

        newNodes.push({
          id: nodeType.node_id,
          type: 'loader',
          data: { label: 'Loader', config:nodeData , name: nodeType.node_name, pipelineType: props.pipelineType},
          position: { x: positions[nodeType.node_id][0], y: positions[nodeType.node_id][1] },
       });
      
      } 
      if (nodeType.type === "Transformer"){
        
        newNodes.push(
          {
           id: nodeType.node_id,
           type: 'transformer',
           data: { label: 'Transformer', config:nodeData, name: nodeType.node_name},
           position: { x: positions[nodeType.node_id][0], y: positions[nodeType.node_id][1] },
          });
        
      }  
      if (nodeType.type === "Exporter"){
      
        newNodes.push(
          {
            id: nodeType.node_id,
            type: 'exporter',
            data: { label: 'Exporter', config:nodeData, name: nodeType.node_name},
            position: { x: positions[nodeType.node_id][0], y: positions[nodeType.node_id][1] },
          }
        );
        
      } 
      if (nodeType.type === "Custom"){
      
        newNodes.push(
          {
            id: nodeType.node_id,
            type: 'custom',
            data: { label: 'Custom', config:nodeData, name: nodeType.node_name},
            position: { x: positions[nodeType.node_id][0], y: positions[nodeType.node_id][1] },
          }
        );
        
      } 
    }

  
    
    dispatch(setStoredNodes(newNodes));
    setNodes(newNodes);
    dispatch(setOrderedNodes(newNodes));
  }

  const processAndPlaceEdges = ()=>{
    if(edges.length === 0){
      const storedEdges = [];
      for(const processedEdge of pipelineEdges){
        const connections = processedEdge.downstream_blocks;
        for(const conn of connections){
          
          const newEdge = {
            id:uuidv4(),
            source:processedEdge.node_id,
            target:conn,
            type:'default',
            sourceHandle:'right',
            targetHandle:'left',
            animated: false,
          }
          storedEdges.push(newEdge);
        
        }
      }
      setEdges(storedEdges);
      
    }
  }
  
  const processAndPlaceNodes = (blocks, pipeline_name) =>{ 
    setPipelineEdges([]);
    setEdges([]);
    const allNodes = [];
    const connectionEdges = [];

    for(const block of blocks){
     
      if(block.type === "data_loader"){
        allNodes.push({type:"Loader", node_id:block.name.replace(/ /g, "_"),config:block.configuration, node_name: formatString(block.name), upstream_blocks: block.upstream_blocks, downstream_blocks: block.downstream_blocks});
        connectionEdges.push({
          node_id:block.name.replace(/ /g, "_"),
          upstream_blocks:block.upstream_blocks,
          downstream_blocks:block.downstream_blocks,
          
        });
      } else if(block.type === "transformer"){
        allNodes.push({type:"Transformer", node_id:block.name.replace(/ /g, "_"),config:block.configuration, node_name: formatString(block.name), upstream_blocks: block.upstream_blocks, downstream_blocks: block.downstream_blocks});
        connectionEdges.push({
          node_id:block.name.replace(/ /g, "_"),
          upstream_blocks:block.upstream_blocks,
          downstream_blocks:block.downstream_blocks
        });
      } else if(block.type === "data_exporter"){
        allNodes.push({type:"Exporter", node_id:block.name.replace(/ /g, "_"),config:block.configuration, node_name: formatString(block.name), upstream_blocks: block.upstream_blocks, downstream_blocks: block.downstream_blocks});
        connectionEdges.push({
          node_id:block.name.replace(/ /g, "_"),
          upstream_blocks:block.upstream_blocks,
          downstream_blocks:block.downstream_blocks
        });
      } else if(block.type === "custom"){
        allNodes.push({type:"Custom", node_id:block.name.replace(/ /g, "_"),config:block.configuration, node_name: formatString(block.name), upstream_blocks: block.upstream_blocks, downstream_blocks: block.downstream_blocks});
        connectionEdges.push({
          node_id:block.name.replace(/ /g, "_"),
          upstream_blocks:block.upstream_blocks,
          downstream_blocks:block.downstream_blocks
        });
      }

    }
    setPipelineEdges([...connectionEdges]);
    setPipelineEdges(connectionEdges);
   
 
    addNodes(allNodes, pipeline_name);
  }

  const deleteOneEdge = (edgeToDelete) =>{
    
    setEdges((eds) => eds.filter((e) => e.id !== edgeToDelete));
  }
  
  const verifyAddedEdgeIsOk = ()=>{
    
   if (edges.length === 0 ){
    return;

   } else {
      const sourceEdges = [];
      const targetEdges = [];
      let lastEdgeSource = edges[edges.length-1].source;
      let lastEdgeTarget = edges[edges.length-1].target; 
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
   }
   
  }

  const setTheNodes = ()=>{
    const mappedNodeInfo = [];
    for(const node of nodes){
      const newNodeObj = {
        id:node.id,
        type:node.type
      }
      mappedNodeInfo.push(newNodeObj);
    }
    dispatch(setMappedNodes(mappedNodeInfo));
  }

  const setTheEdges = ()=>{
    const mappedEdgeInfo = [];
    for(const edge of edges){
      const edgeInfo = {
        source:edge.source,
        target:edge.target
      }
      mappedEdgeInfo.push(edgeInfo);
    }
   dispatch(setMappedEdges(mappedEdgeInfo));
   setTheNodes();
  } 

  const getVariablesCount = (pipe_obj) => {
    let variableCount = 0;
    const allVarsData = Object.values(pipe_obj);
    const allVarsKeys = Object.keys(pipe_obj)

    let i = 0;

    for(const varData of allVarsData){
      let condition = false;
      if(typeof pipe_obj[allVarsKeys[i]] === 'object' && pipe_obj[allVarsKeys[i]] !== null){
        variableCount++;
      } else {
        try{
          const _ = JSON.parse(varData);
          variableCount++;
        } catch(err){
          condition = true;
        }
        if (condition) continue;
      }
      i++;
    }
    
    return variableCount;
  }

  const checkAndSeeIfVariablesPresent = (allVars, pipeline_name)=>{
      if (allVars === undefined) return false;
      
      for(const pipeVar of allVars){
        if(pipeVar["pipeline_name"] === pipeline_name){
          return true;
        }
      }

      return false;
  }

  const parseAndCountVariables = (pipeline_data, pipeline_name)=>{


    let nrOfVars = 0;
    
    for(const pipe_data of pipeline_data){
       nrOfVars += getVariablesCount(pipe_data.configuration);
    }
    
    const variablesForPipeline = {
      pipeline_name:pipeline_name,
      number_of_variables: nrOfVars
    }

  
    
    if(!checkAndSeeIfVariablesPresent(blockVariablesCount,pipeline_name)){
      const newVar = [...blockVariablesCount, variablesForPipeline];
      dispatch(setPipelineNumberOfVariables(newVar));
    }
    
  }
 
  const fetchPipelineData = async (pipeline_name)=>{
    
    setIsPipelineLoading(true);
   
    try{
      const resp = await axios.get(FETCH_PIPELINE_DATA(pipeline_name));

      parseAndCountVariables(resp.data.pipeline.blocks, pipeline_name);
      processAndPlaceNodes(resp.data.pipeline.blocks, pipeline_name);
      setIsPipelineLoading(false);
      dispatch(setSelectedPipelineName(pipeline_name));
    } catch(err){
      blockAlert("There was a problem while fetching pipeline data!")
      console.log(err);
      setIsPipelineLoading(false);
    }

  }
 
  const parseSelectedPipelineName = (inputString)=>{
    if (inputString.includes('-')) {
      inputString = inputString.split("_").join("-");
    } 
    if (inputString.includes(' ')) {
      inputString = inputString.split(' ').join('_');
    } 

    return inputString;
  }

  const blockAlert = (msg) => {
    toast.error(msg, {
        duration: 2000,
        position: 'top-right',
    })
};
 
  const fetchPipelineForModel = async(model)=>{
    try{
      const resp = await axios.get(FETCH_PIPELINE_PREDICT_DATA(model));
      setSelectedPipeline([resp.data.name]);
      dispatch(setSelectedPipelineNamePrediction(resp.data.name));
      dispatch(setSelectedPipelinePrediction([resp.data.name]));
    }catch(err){

      if(model.length !== 0 && selectedTab.tabSelected==="3"){
        blockAlert("No pipeline found for the model!");
      }
      setSelectedPipeline([]);
      dispatch(setSelectedPipelineNamePrediction(""));
      dispatch(setSelectedPipelinePrediction([""]));
      dispatch(setSelectedPipelineName(""));
    }
  }

  useEffect(()=>{
    processAndPlaceEdges();
    processAndPlaceEdges();
   },[pipelineEdges])

  useEffect(()=>{
    
    verifyAddedEdgeIsOk();
    setTheEdges();
    processAndPlaceEdges();
  
  },[edges])



  useEffect(()=>{
    if(wereEdgesPlaced){
      processAndPlaceEdges();
    }
  },[wereEdgesPlaced])

  useEffect(()=>{
    if(nodes.length!==0){
      setWereEdgesPlaced(true); 
    }
   
  },[nodes])



  useEffect(()=>{
    
    if(selectedPipeline.length !== 0){
      const parsedSelectedPipeline = parseSelectedPipelineName(selectedPipeline[0]);
      fetchPipelineData(parsedSelectedPipeline).then((_) => {}).catch((_) => {});
    } else {
  
      setNodes([]);
      setEdges([]);
    }
    
  },[selectedPipeline])

   
  useEffect(()=>{
    if(props.pipelineType === "prediction"){
      
      fetchPipelineForModel(selectedTrainedModel);
    }
  },[selectedTrainedModel])


  const selectPipelineBasedOnProps = (pipeline_type)=> {
    if( pipeline_type === "training"){
      setSelectedPipeline(selectedPipelineTrain);
    } else if (pipeline_type === "data_preprocessing"){
      setSelectedPipeline(selectedPipelineDataPreProcessing);
    } else if (pipeline_type === "streaming"){
      setSelectedPipeline(selectedPipelineStreaming);
    }
  }


  useEffect(()=>{ 
    selectPipelineBasedOnProps(props.pipelineType);
  },[props, selectedPipelineDataPreProcessing, selectedPipelineTrain, selectedPipelinePrediction])



    return (
      <div style={{ width: '96vw', height: '100vh' }}>
        {
          isPipelineLoading && 
          <div className="overlay" id="loadingOverlay">
            <div className="loader"></div>
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
          
        >
          <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable style={{
            border: "1px solid black"
          }}
          maskColor="rgb(0,0,0, 0.1)" />

          <Background variant='dots' color="#000" />
          <Controls />
        </ReactFlow>
       
      </div>
    );
  }
  
  export default Flow;
import React, { useCallback,useState, useMemo, useEffect } from 'react';
import style from "./Flow.css";
import ReactFlow, { MiniMap,Background, Controls, useNodesState, useEdgesState, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import Loader from './custom_nodes/Loader.js';
import 'reactflow/dist/style.css';
import Transformer from './custom_nodes/Transformer.js';
import Exporter from './custom_nodes/Exporter.js';
import Custom from './custom_nodes/Custom.js';
import {formatString} from "../../utils/formatString.js";
import {useSelector} from "react-redux/es/hooks/useSelector";
import {
  setMappedNodes,
  setMappedEdges,
  setIsPipelineFetching,
  setOrderedNodes,
  setSelectedPipelineName,
  setStoredNodes
} from "../../reducers/nodeSlice";
import {useDispatch} from 'react-redux';
import { FETCH_PIPELINE_DATA } from '../../utils/apiEndpoints.js';
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";

function Flow() {

  const selectedPipeline = useSelector((state)=> state.selectedPipeline);
  const blocksVariables = useSelector((state)=> state.blocksVariables);
  const pipelineFetching = useSelector((state)=> state.is_pipeline_fetching);
  const nodeTypes = useMemo(() => ({ loader: Loader , transformer:Transformer, exporter:Exporter, custom:Custom}), []);
  const edgeTypes = useMemo(() => ({ }), []);
  const storedNodes = useSelector((state)=>state.storedNodes);
  const storedDataset = useSelector((state)=>state.selectedDataset);
  const edgeToDelete = useSelector((state)=>state.edgeToDelete);
  const initialNodes = []; 
  const initialEdges = [];
  const [isPipelineLoading, setIsPipelineLoading] = useState(false);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [variant, setVariant] = useState('cross');
  const [pipelineEdges, setPipelineEdges] = useState([]);
  const [wereEdgesPlaced, setWereEdgesPlaced] = useState(false);
  const dispatch = useDispatch();
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


  const addNodes = (nodeData) => {
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
      
      if(nodeType.type == "Loader"){
        newNodes.push({
          id: nodeType.node_id,
          type: 'loader',
          data: { label: 'Loader', config:nodeType.config, name: nodeType.node_name},
          position: { x: positions[nodeType.node_id][0], y: positions[nodeType.node_id][1] },
       });
      
      } 
      if (nodeType.type == "Transformer"){
        
        newNodes.push(
          {
           id: nodeType.node_id,
           type: 'transformer',
           data: { label: 'Transformer', config:nodeType.config, name: nodeType.node_name},
           position: { x: positions[nodeType.node_id][0], y: positions[nodeType.node_id][1] },
          });
        
      }  
      if (nodeType.type == "Exporter"){
      
        newNodes.push(
          {
            id: nodeType.node_id,
            type: 'exporter',
            data: { label: 'Exporter', config:nodeType.config, name: nodeType.node_name},
            position: { x: positions[nodeType.node_id][0], y: positions[nodeType.node_id][1] },
          }
        );
        
      } 
      if (nodeType.type == "Custom"){
      
        newNodes.push(
          {
            id: nodeType.node_id,
            type: 'custom',
            data: { label: 'Custom', config:nodeType.config, name: nodeType.node_name},
            position: { x: positions[nodeType.node_id][0], y: positions[nodeType.node_id][1] },
          }
        );
        
      } 
    }
    dispatch(setOrderedNodes(finalNodes));
    dispatch(setStoredNodes(newNodes));
    setNodes(newNodes);
    
  }

  const processAndPlaceEdges = ()=>{
    if(edges.length==0){
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
  
  const processAndPlaceNodes = (blocks) =>{ 
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
    addNodes(allNodes);
  }

  const deleteOneEdge = (edgeToDelete) =>{
    
    setEdges((eds) => eds.filter((e) => e.id !== edgeToDelete));
  }

  const verifyAddedEdgeIsOk = ()=>{
    
   if (edges.length == 0 ){
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


 
  const fetchPipelineData = async(pipeline_name)=>{
    setIsPipelineLoading(true);
  
    try{
      const resp = await axios.get(FETCH_PIPELINE_DATA(pipeline_name));
      console.log(resp);
      processAndPlaceNodes(resp.data.pipeline.blocks);
      setIsPipelineLoading(false);
      dispatch(setSelectedPipelineName(pipeline_name));
    } catch(err){
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
      fetchPipelineData(parsedSelectedPipeline);
    } else {
      setNodes([]);
      setEdges([]);
    }
  },[selectedPipeline])

   
  useEffect(()=>{
   
    if(nodes.length == 0){
      setNodes(storedNodes);
    }
  },[storedNodes])

   
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
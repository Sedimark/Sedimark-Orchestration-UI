import React, { useCallback,useState, useMemo, useEffect } from 'react';
import ReactFlow, { MiniMap,Background, Controls, useNodesState, useEdgesState, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import Dataset from './custom_nodes/Dataset';
import 'reactflow/dist/style.css';
import FeatureSelection from './custom_nodes/FeatureSelection';
import Normalization from './custom_nodes/Normalization';
import DataImputation from './custom_nodes/DataImputation';
import ModelTraining from './custom_nodes/ModelTraining';
import CustomEdge from "./custom_edges/CustomEdge.js";
import {  useSelector } from "react-redux/es/hooks/useSelector";
import {setMappedNodes, setMappedEdges} from "../../reducers/nodeSlice";
import {useDispatch} from 'react-redux';

function Flow() {

  const nodeTypes = useMemo(() => ({ dataSet: Dataset , featureSelection:FeatureSelection, normalization:Normalization, dataImputation:DataImputation, modelTraining:ModelTraining}), []);
  const edgeTypes = useMemo(() => ({ special: CustomEdge }), []);
  const storedNodes = useSelector((state)=>state.nodes);
  const storedDataset = useSelector((state)=>state.selectedDataset);
  const edgeToDelete = useSelector((state)=>state.edgeToDelete);
  const [placedNodes, setPlacedNodes] = useState([]);
  const initialNodes = []; 
  const initialEdges = [];
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [variant, setVariant] = useState('cross');
  const dispatch = useDispatch();
  
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
      setEdges((eds) => addEdge({ ...params, animated: false, type:"special" }, eds)),
    []
  );
  const reactFlowStyle = {
    background: '#fff',
    width: '100%',
    height: 300,
  };

  const nodeColor = (node) => {
    switch (node.type) {
      case 'featureSelection':
        return '#f56b02';
      case 'dataSet':
        return '#cff6ff';
      case  'normalization':
        return '#06dca7'    
      case  'normalization':
        return '#06dca7'
      case 'dataImputation':
        return '#f50c0c'
      default:
          return '#c9c7c7'
    }
  };


  const containsNode = (nodeType, allNodes)=>{
   
    const foundNodeOfType = allNodes.find((node)=> node.data.label == nodeType);
    if(foundNodeOfType){
      return true;
    }
    return false;
  }


  const checkAndRemoveNode = (nodeData, nodes)=>{
    const newNodeArr = [];
    const nodeRemoved = [];
    for(const node of nodes){
      if(nodeData.includes(node.data.label)){
        newNodeArr.push(node);
      } else {
        nodeRemoved.push(node);
      }
    }

    const updatedEdges = [];
    for(const edge of edges){
      if(edge.source == nodeRemoved[0].id || edge.target == nodeRemoved[0].id){
        continue;
      }
      updatedEdges.push(edge);
    }
    setEdges(updatedEdges);
    setNodes(newNodeArr);
  }


  const addNode = (nodeData) => {
    const newNodes = [...nodes];
    
    if(nodeData.length < nodes.length){
      checkAndRemoveNode(nodeData,nodes);
      return;
    }
    
    for(let nodeType of nodeData){
      
      if(nodeType == "Dataset" && !containsNode(nodeType,nodes)){
      
        newNodes.push({
          id: 'node-1',
          type: 'dataSet',
          data: { label: 'Dataset' },
          position: { x: 150, y: 25 },
       });
      
      } 
      if (nodeType == "Data featuring" && !containsNode(nodeType,nodes)){
        
        newNodes.push(
          {
           id: 'node-2',
           type: 'featureSelection',
           data: { label: 'Data featuring' },
           position: { x: 850, y: 5 },
          });
        
      }  
      if (nodeType == "Normalization" && !containsNode(nodeType,nodes)){
      
        newNodes.push(
          {
            id: 'node-3',
            type: 'normalization',
            data: { label: 'Normalization' },
            position: { x: 1550, y: 45 },
          }
        );
        
      } 
      if (nodeType == "Data Imputation" && !containsNode(nodeType,nodes)){
        
        newNodes.push(
          {
            id: 'node-4',
            type: 'dataImputation',
            data: { label: 'Data Imputation' },
            position: { x: 2550, y: 195 },
          }
        ); 
        
      } 
      if (nodeType == "Model Training" && !containsNode(nodeType,nodes)){
        
        newNodes.push(
          {
            id: 'node-5',
            type: 'modelTraining',
            data: { label: 'Model Training' },
            position: { x: 3250, y: 500 },
          }
        ); 
      } 
    }
    
    setNodes(newNodes);
  }

  const processAndPlaceNodes = (nodes) =>{ 
    const allNodes = [];
    for(let node of nodes){    
      allNodes.push(node.nodeData.type);   
    }
    addNode(allNodes);
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
      if (lastEdgeSource == lastEdgeTarget){
        deleteOneEdge(edges[edges.length-1].id);
        return;
      }
      for(const edg of edges){
        sourceEdges.push(edg.source);
        targetEdges.push(edg.target);
      }
  
      sourceEdges.pop();
      targetEdges.pop();
      if(sourceEdges.indexOf(lastEdgeSource)!==-1 || targetEdges.indexOf(lastEdgeTarget)!==-1 ) {
        deleteOneEdge(edges[edges.length-1].id);
        return;
      }
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

 

  useEffect(()=>{
    processAndPlaceNodes(storedNodes);
  },[storedNodes])

  useEffect(()=>{  
    
    deleteOneEdge(edgeToDelete);
  },[edgeToDelete])

  useEffect(()=>{
    verifyAddedEdgeIsOk();

    setTheEdges();
  },[edges])

 
    return (
      <div style={{ width: '96vw', height: '100vh' }}>
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

          
          <Background variant='dots' color="#fff" />
          <Controls />
          
        </ReactFlow>
      </div>
    );
  }
  
  export default Flow;
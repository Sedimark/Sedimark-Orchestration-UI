import React, { memo, useState,useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./BaseNodesStyles.css";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import ChangeBlockName from '../DataProcessing/dialogs/ChangeBlockName/ChangeBlockName';
import { faDiagramProject, faMap,faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import VariablesInput from '../DataProcessing/dialogs/VariablesInput/VariablesInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PREDICT_RESULTS_LINK } from '../../utils/apiEndpoints';
import { useSelector } from "react-redux/es/hooks/useSelector";
import { faArrowUpRightFromSquare, faPencil, faListUl, faScroll } from '@fortawesome/free-solid-svg-icons';
import ViewMap from '../DataProcessing/dialogs/PredictResults/ViewMap';
import { setMapData } from '../../reducers/nodeSlice';
import { truncateString } from '../../utils/truncateString';
import toast from 'react-hot-toast';
import SeeVariables from '../DataProcessing/dialogs/SeeVariables/SeeVariables';
import formatName from '../../utils/formatName';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {parseJSONVar} from "../../utils/parseJSONVar";
import {setPipelineStudioEdgeToDelete, setShamrockNodes, setBlocksVariables, setPipelineStudioNodes, setBlockCatalogSelectedOptions} from "../../reducers/nodeSlice";
import Logs from '../DataProcessing/dialogs/Logs/Logs';

 
export default memo(({ data, isConnectable }) => {
 
  const dispatch = useDispatch();
  const allRunningPipelines = useSelector((state)=> state.runningPipelines);
  const brokerEntityId = useSelector((state)=>state.brokerEntityId);
  const [pipelineIsRunning, setPipelineIsRunning] = useState(false);
  const selectedTrainedModel = useSelector((state)=> state.selectedTrainedModel);
  const variablesValues = useSelector((state)=> state.blocksVariables);
  const shamrockWasSaved = useSelector((state)=> state.shamrockWasSaved);
  const [seeVariablesMenuOpen, setSeeVariablesMenuOpen] = useState(false);
  const [viewMapOpen, setViewMapOpen] = useState(false);
  const [storedVariables, setStoredVariables] = useState([]);
  const [nodeName, setNodeName] = useState("");
  const [fullNodeName, setFullNodeName] = useState("");
  const [allVariables, setAllVariables] = useState([]);
  const [variablesPresent, setVariablesPresent] = useState(false);
  const [variablesInputOpen, setVariablesInputOpen] = useState(false);
  const [specialBlockViewButton, setSpecialBlockViewButton] = useState(false);
  const [isFromPipelineStudio, setIsFromPipelineStudio] = useState(false);
  const [pipelineStudioName, setPipelineStudioName] = useState("");
  const [pipelineStudioDescription, setPipelineStudioDescription] = useState("");
  const [changeBlockNameOpen, setChangeBlockNameOpen] = useState(false);
  const storedPipelinesBlockInfo = useSelector((state)=> state.pipelinesBlocks);
  const [seeLogs, setSeeLogs] = useState(false);
  const [isFromShamrock, setIsFromShamrock] = useState(false);
  const [variableValues, setVariableValues] = useState([]);
  const storedPipelineNodes = useSelector((state)=>state.pipelineStudioNodes);
  const blockCatalogSelectedOptions = useSelector((state)=> state.blockCatalogSelectedOptions);
  let blocksVariablesStored = useSelector((state)=> state.blocksVariables);
  const shamrockNodes = useSelector((state)=> state.shamrockNodes);
  const allEdges = useSelector((state)=> state.pipelineStudioEdges);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const parseAndSet = (oldValues,newValues)=>{
    let parsedArray = [];
     for(const value of oldValues){
      if(value.block_name !== fullNodeName){
          parsedArray.push(value);
      }
    }

    const parsedNewValues = [];
    for(const val of newValues){
      if(val["value"].length !== 0){
        parsedNewValues.push(val);
      }
    }
    

     parsedArray = [...parsedArray, ...parsedNewValues];
     return parsedArray;
  }

   
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const processName = (str)=>{
    const truncateString = "...";
    const maxLength = 29;
    if(str.length > maxLength){
       setNodeName(str.substring(0, maxLength) + truncateString);
    } else {
      setNodeName(str);
    }
  }

  const checkIfSpecialBlock = ()=>{
    if(data.name === "Export Map"){
      setSpecialBlockViewButton(true);
    } else {
      setSpecialBlockViewButton(false);
    }
  }


  const convertToSnakeCase = (inputString)=>{
    let lowercaseString = inputString.toLowerCase();
    let snakeCaseString = lowercaseString.replace(/\s+/g, '_');
     return snakeCaseString;
  }
  

  const updateObjectInArray = (arr, newObj)=>{
    const indexToUpdate = arr.findIndex(obj => obj.variable_name === newObj.variable_name);
    if (indexToUpdate !== -1) {
      return arr.map((obj, index) => (index === indexToUpdate ? newObj : obj));
    } else {
      return [...arr, newObj];
    }
  }

  const parseArray = (arr)=>{
    if (arr.length > 0) {
        let result = arr.join(', ');
        if (result.length > 20) {
            result = result.substring(0, 20) + '...';
        }
      return result;
    } else {
        return '';
    }
  }

  const parseString = (str)=>{
    if(str.length > 20){
       return str.substring(0,20) + '...';
    } else {
      return str;
    }
  }

  const processVariablesValues = (varsVals)=>{
    const storedVars = [];
    for(let val of varsVals){
      if(val.block_name === fullNodeName){
        if(val.type === "multiple"){
           storedVars.push(
          {
            "variable_name":val.variable_name,
            "value":val.value.length
          }
         );
        } else {
          storedVars.push({
            "variable_name":val.variable_name,
            "value":val.value
          });
        }
      }
    }
    setStoredVariables(storedVars);
  }

  const getStoredVariableValue = (varName)=>{
    
    for(const variable of variablesValues){
      if(variable.variable_name === varName && variable.block_name === data.name ){
        if(Array.isArray(variable.value)){
          return parseArray(variable.value);
        } else {
          return parseString(variable.value);
        }
      }
    }
    return "";
  }
 

  const blockAlert = (msg) => {
    toast.success(msg, {
        duration: 4000,
        position: 'top-right',
    })
  };


  const blockAlertError = (msg) =>{
    toast.error(msg, {
      duration: 4000,
      position: 'top-right',
  })
  }

  const openVariablesEditMenu = ()=>{
    setVariablesInputOpen(true);
  }

  const renderMap = async()=>{
    blockAlert("Hold on! We are fetching the map...");
    let mapLink;
    try{
      mapLink = await axios.get(PREDICT_RESULTS_LINK(selectedTrainedModel));
      mapLink = mapLink.data.url;
    } catch(err){
      blockAlertError("There was an error while trying to render the map!");
      return;
    }

    let mapData;

    try{
      mapData = await axios.get(mapLink);
      dispatch(setMapData(mapData.data));
      setViewMapOpen(true);
    } catch(err){
      blockAlertError("There was an error while trying to render the map!");
      console.log(err);
    }
  }


  const changeBlockName = (name)=>{
    
    const oldNodes = [...storedPipelineNodes];
    const newNodes = [];
    
    for(const node of oldNodes){
       if(node.id === data.nodeId){
         const updatedNode = {
           ...node,
           data: {
               ...node.data,
               fromPipelineStudio: {
                   ...node.data.fromPipelineStudio,
                   name: name
               }
           }
       };
       newNodes.push(updatedNode);
       } else {
         newNodes.push(node);
       }
    }
    
    dispatch(setPipelineStudioNodes(newNodes));
    setChangeBlockNameOpen(false);
 } 


 const changeBlockNameShamrock = (name)=>{
   
     const oldNodes = [...shamrockNodes];
     const newNodes = [];
    
     for (const node of oldNodes) {
       if (node.id === data.nodeId) {
           // Create a new copy of node.data and update the name property
           const updatedNode = {
               ...node,
               data: {
                   ...node.data,  // Clone the existing data object
                   name: name     // Update the name property
               }
           };
           newNodes.push(updatedNode);
       } else {
           newNodes.push(node);
       }
     }
   
     dispatch(setShamrockNodes(newNodes));
     setChangeBlockNameOpen(false);
   }


    const createObjToStore = ()=>{
           
        //    let inputedValuesVariables = [...variableValues];
        //    let objToStore;
     
        //    let pipelineName = "";
        //    let nodeNameId = convertToSnakeCase(data.name);
           
        //    for(const [key, value] of Object.entries(storedPipelinesBlockInfo)){
        //      if(key == formatName(fullNodeName)){
        //        pipelineName = value;
        //      }
        //    }
            
        //    objToStore = {
        //    block_name:data.name,
        //    variable_name:"entity_id",
        //    value:brokerEntityId,
        //    nodeId:nodeNameId,
        //    pipelineName:data.config.pipelineName
        //  }
           
        //  inputedValuesVariables = updateObjectInArray(inputedValuesVariables, objToStore);
        //  setVariableValues(inputedValuesVariables);
           
        //  blocksVariablesStored = parseAndSet(blocksVariablesStored, inputedValuesVariables);  
        //  dispatch(setBlocksVariables(blocksVariablesStored)); 
   
    }



  const deleteNode = ()=>{
     const currentNodeName = data.fromPipelineStudio.name;
     const newNodes = storedPipelineNodes.filter( obj => obj.data.fromPipelineStudio.name !== currentNodeName );
     dispatch(setPipelineStudioNodes(newNodes)); 
     const filteredOptions = blockCatalogSelectedOptions.filter((block)=> block.name !== currentNodeName);
     dispatch(setBlockCatalogSelectedOptions(filteredOptions));

     const nodeId = data.nodeId;
     const edgesToDelete = [];
     for(const edge of allEdges){
       if(edge.source === nodeId || edge.target === nodeId){
         edgesToDelete.push(edge.id);
       }
     }
     
     for(const edge of edgesToDelete){
       let i = 1;
       setTimeout(()=>{
         dispatch(setPipelineStudioEdgeToDelete(edge));
       },200*i);
       i++
       
     }
  }
  

  useEffect(()=>{
    processName(data.name);
    setFullNodeName(data.name);

  

    if (typeof data.config[Object.keys(data.config)[0]] === 'object' && data.config[Object.keys(data.config)[0]] !== null) {
       
    
      const allVarsData = [];
      for(const varValue of Object.keys(data.config)){
        if(varValue === "pipelineName"){
          continue;
        }
        const newObj = {
          varName:varValue,
          ...data.config[varValue]
        }
        allVarsData.push(newObj);
      }
      setAllVariables(allVarsData);
      setVariablesPresent(true);
      return;
   }

    const allVars = Object.keys(data.config);
    const allVarsType = Object.values(data.config);
    let varObj;
    const allVarsData = [];
    for (let i = 0; i < allVars.length; i++) {
      const parsedJSONVar = parseJSONVar(allVarsType[i]);
      if(![undefined, "", null, 0].includes(parsedJSONVar) && ["multiple_selection", "string", "number", "drop_down", "date"].includes(parsedJSONVar["type"])) {
        varObj = {
          varName: allVars[i],
          ...parsedJSONVar
        }
        allVarsData.push(varObj);
      }
    }

    
    if(allVarsData.length !== 0){
      setVariablesPresent(true);
    } else {
      setVariablesPresent(false);
    }

    
    setAllVariables(allVarsData);

    checkIfSpecialBlock();
  },[])


  useEffect(()=>{
    if("fromPipelineStudio" in data){
      setIsFromPipelineStudio(true);
      setPipelineStudioName(data.fromPipelineStudio.name);
      setPipelineStudioDescription(data.fromPipelineStudio.description);
    } else {
      setPipelineStudioName("");
      setPipelineStudioDescription("");
      setIsFromPipelineStudio(false);
    }

    if("fromShamrock" in data){
      setIsFromShamrock(true);
    }

  },[data])


  useEffect(()=>{

    if(data && allRunningPipelines){
      let found = false;
      for(const pipeline of allRunningPipelines){
        if(pipeline == data.config.pipelineName){
          found = true;
          setPipelineIsRunning(true);
        }
      }
      if(!found){
        setPipelineIsRunning(false);
      }
    }
  },[allRunningPipelines, data])

  useEffect(()=>{
    processName(data.name);
    setFullNodeName(data.name);
    
  },[])

    useEffect(()=>{
      if(brokerEntityId && brokerEntityId.length!==0){
        createObjToStore();
      }
         
    },[brokerEntityId])


  return (
    <div style={{ width:"500px", borderRadius:"6%",padding:"10px",border:"2px solid yellow", backgroundColor:"#f5ffcd", minHeight: "320px", height:"auto"  }}>
        <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{padding:"10px",border:"4px solid #e9e008"}}
        isConnectable={isConnectable}
      />
      <div> 
      { isFromPipelineStudio &&  <p className='remove-node-btn-container' onClick={()=>{deleteNode()}}><span className='remove-node-btn'>x</span></p> }
        {isFromPipelineStudio ? 
          
          <div className='export-node-header node-header-filter model-training-card-header'>
              <p className='exporter-node-header-title' title={pipelineStudioName}> {pipelineStudioName}</p>
          </div>  
        :
          <div className='export-node-header node-header-filter model-training-card-header'>
            <p className='exporter-node-header-title' title={fullNodeName}> {nodeName? nodeName:"Custom"}</p>
          </div>  
        }
      
        {variablesPresent && !isFromPipelineStudio && 
          <div className='base-node-info-section-container-exporter info-section-exporter'>
                <h3> Variables</h3>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 200 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Variable Name</StyledTableCell>
                        <StyledTableCell align="right">Value</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                    {allVariables.slice(0, 2).map((row, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell component="th" scope="row">
                        {row["varName"]}
                      </StyledTableCell>
                      <StyledTableCell align="right">{getStoredVariableValue(row["varName"])}</StyledTableCell>
                    </StyledTableRow>
                  ))}
                  {allVariables.length > 2 && (
                    <StyledTableRow>
                      <StyledTableCell component="th" scope="row" colSpan={2} style={{color:"gray"}}>
                        ... more
                      </StyledTableCell>
                    </StyledTableRow>
                  )}
                    </TableBody>
                  </Table>
                </TableContainer>
              
              <div className='custom-node-bottom-toolbox'>
                  <button className='custom-node-toolbox-btn ' disabled={pipelineIsRunning} onClick={()=>{openVariablesEditMenu()}}> Edit Variables <FontAwesomeIcon icon={faArrowUpRightFromSquare}/></button>
                  <button className='custom-node-toolbox-btn ' disabled={pipelineIsRunning} onClick={()=>{setSeeLogs(true)}}> See Logs <FontAwesomeIcon icon={faScroll}/></button>
              </div>
          </div>
         }
        {
          (!variablesPresent && !specialBlockViewButton) && !isFromPipelineStudio && !isFromShamrock &&
            <div className='empty-node-box'>
                <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container' />
                <button className='custom-node-toolbox-btn no-variables-btn-exporter' disabled={pipelineIsRunning} onClick={()=>{setSeeLogs(true)}}> See Logs <FontAwesomeIcon icon={faScroll}/></button>
          </div>  
        }
        {
                          isFromShamrock &&
                          <div className="empty-node-box">
                            <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container empty-node-container-loader' /> 
                          </div> 
        }
        {variablesInputOpen && <VariablesInput fullNodeName={fullNodeName} variablesData={allVariables} open={variablesInputOpen} handleClose={()=>{setVariablesInputOpen(false);}} />}
        
        {specialBlockViewButton &&  <div className='custom-node-bottom-toolbox'>
                  <button className='custom-node-toolbox-btn view-map-btn' onClick={()=>{renderMap()}}> View Map <FontAwesomeIcon icon={faMap}/></button>
              </div>
        }
          
         {
          isFromPipelineStudio && 
          <div className='base-node-info-section-container base-node-from-pipeline-studio'>
            <FontAwesomeIcon icon={faCircleInfo} style={{fontSize:"1.8rem"}} />
            <div title={pipelineStudioDescription}>
              {truncateString(pipelineStudioDescription,195)}
            </div>
          </div>
        }
         {isFromPipelineStudio && 
         <div className='from-pipeline-studio-buttons-container'>
             <button className='edit-variables-btn-loader pipeline-studio-node-btn exporter-edit-btn' onClick={() => {setChangeBlockNameOpen(true) }}> Edit  <FontAwesomeIcon className='pipeline-studio-edit-node-icon' icon={faPencil} /></button>
             <button className='edit-variables-btn-loader pipeline-studio-node-btn exporter-edit-btn' onClick={() => {setSeeVariablesMenuOpen(true) }}> Variables  <FontAwesomeIcon className='pipeline-studio-edit-node-icon' icon={faListUl} /></button>
         </div>
         }
         {viewMapOpen && 
          <ViewMap open={viewMapOpen} handleClose={()=>{setViewMapOpen(false)}} ></ViewMap>
         }

          {
              isFromShamrock && !shamrockWasSaved && 
             
              <div className='from-pipeline-studio-buttons-container'>
                <button className='edit-variables-btn-loader pipeline-studio-node-btn exporter-edit-btn' style={{position:"relative",top:"14px"}} onClick={() => {setChangeBlockNameOpen(true) }}> Edit  <FontAwesomeIcon className='pipeline-studio-edit-node-icon' icon={faPencil} /></button>
              </div> 
                            
          }    


        { changeBlockNameOpen && !isFromShamrock && <ChangeBlockName name={pipelineStudioName} handleAction={(name)=>{changeBlockName(name)}} open={changeBlockNameOpen} handleClose={()=>{setChangeBlockNameOpen(false)}} />}
        { changeBlockNameOpen && isFromShamrock &&  <ChangeBlockName name={data.name} handleAction={(name)=>{changeBlockNameShamrock(name)}} open={changeBlockNameOpen} handleClose={()=>{setChangeBlockNameOpen(false)}}></ChangeBlockName>}
        { seeVariablesMenuOpen && <SeeVariables blockName={data.fromPipelineStudio.initialName} handleClose={()=>{setSeeVariablesMenuOpen(false)}} open={seeVariablesMenuOpen} />}
        { seeLogs && <Logs open={seeLogs} blockData={data} handleClose={()=>{setSeeLogs(false)}} />}
      </div>
    </div>
  );
});

import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./BaseNodesStyles.css";
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from "react-redux/es/hooks/useSelector";
import { faDiagramProject, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import TableRow from '@mui/material/TableRow';
import VariablesInput from '../DataProcessing/dialogs/VariablesInput/VariablesInput';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Paper from '@mui/material/Paper';
import ChangeBlockName from '../DataProcessing/dialogs/ChangeBlockName/ChangeBlockName';
import SeeVariables from '../DataProcessing/dialogs/SeeVariables/SeeVariables';
import { truncateString } from '../../utils/truncateString';
import { faArrowUpRightFromSquare, faPencil, faListUl, faScroll } from '@fortawesome/free-solid-svg-icons';
import { setShamrockNodeChanged, setStoredPipelineName,setPipelineStudioNodes,setPipelineStudioEdgeToDelete,setBlockCatalogSelectedOptions, setShamrockNodes} from "../../reducers/nodeSlice";
import {parseJSONVar} from "../../utils/parseJSONVar";
import {useDispatch} from 'react-redux';
import Logs from '../DataProcessing/dialogs/Logs/Logs';

export default memo(({ data, isConnectable }) => {
  
  const allRunningPipelines = useSelector((state)=> state.runningPipelines);
  const [pipelineIsRunning, setPipelineIsRunning] = useState(false);
  const [seeVariablesMenuOpen, setSeeVariablesMenuOpen] = useState(false);
  const allEdges = useSelector((state)=> state.pipelineStudioEdges);
  const shamrockNodes = useSelector((state)=> state.shamrockNodes);
  const shamrockWasSaved = useSelector((state)=> state.shamrockWasSaved);
  const variablesValues = useSelector((state)=> state.blocksVariables);
  const [variablesInputOpen, setVariablesInputOpen] = useState(false);
  const [variablesPresent, setVariablesPresent] = useState(false);
  const [fullNodeName, setFullNodeName] = useState("");
  const [nodeName, setNodeName] = useState("");
  const [allVariables, setAllVariables] = useState([]);
  const [storedVariables, setStoredVariables] = useState([]);
  const [isFromPipelineStudio, setIsFromPipelineStudio] = useState(false);
  const [pipelineStudioName, setPipelineStudioName] = useState("");
  const [changeBlockNameOpen, setChangeBlockNameOpen] = useState(false);
  const [pipelineStudioDescription, setPipelineStudioDescription] = useState("");
  const [seeLogs, setSeeLogs] = useState(false);
  const [isFromShamrock, setIsFromShamrock] = useState(false);
  const storedPipelineNodes = useSelector((state)=>state.pipelineStudioNodes);
  const blockCatalogSelectedOptions = useSelector((state)=> state.blockCatalogSelectedOptions);
  const dispatch = useDispatch();
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));



  const openVariablesEditMenu = ()=>{
    setVariablesInputOpen(true);
  }

  const deleteNode = ()=>{

    dispatch(setStoredPipelineName(""));
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
  
  const processName = (str)=>{
    const truncateString = "...";
    const maxLength = 29;
    if(str.length > maxLength){
       setNodeName(str.substring(0, maxLength) + truncateString);
    } else {
      setNodeName(str);
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
    
  },[])

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

  useEffect(()=>{
    processVariablesValues(variablesValues);
   
  },[variablesValues])


  const parseString = (str)=>{
    if(str.length > 20){
       return str.substring(0,20) + '...';
    } else {
      return str;
    }
  }

  const parseArray = (arr)=>{
    if (arr.length > 0) {
        let result = arr.join(', ');
        if (result.length > 30) {
            result = result.substring(0, 30) + '...';
        }
      return result;
    } else {
        return '';
    }
  }

  const getStoredVariableValue = (varName)=>{
  
    for(const variable of variablesValues){
      if(variable.variable_name === varName){
        if(Array.isArray(variable.value)){
          return parseArray(variable.value);
        } else {
          return parseString(variable.value);
        }
      }
    }
    return "";
  }

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
 
 // here we handle the change of name for the shamrock pipeline case

 // ** AICI ESTE CODUL CARE TREBUIE COPIAT ATUNCI CAND AI DE FACUT PARTE DE UPDATE DE NUME **

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



  return (
    <div style={{ width:"500px", borderRadius:"6%",padding:"10px",border:"2px solid #ff33cc", backgroundColor:"#ffdbfe", minHeight:"200px", height:"auto" }}>
        <Handle
        type="target" 
        position={Position.Left}
        id="left"
        style={{padding:"10px",border:"3px solid #ff33cc"}}
        isConnectable={isConnectable}
      />  
      {isFromPipelineStudio && <p className='remove-node-btn-container' onClick={()=>{deleteNode()}}><span className='remove-node-btn'>x</span></p> } 
      <div>
        {
          isFromPipelineStudio?
          <div className='base-node-header node-header-filter processing-node-header' title={pipelineStudioName}>
            {pipelineStudioName}
          </div>
          :
        <div className='base-node-header node-header-filter processing-node-header' title={fullNodeName}>
          {nodeName? nodeName:"Transformer"}
        </div>
        }
  
        {
          isFromPipelineStudio && 
          <div className='base-node-info-section-container base-node-from-pipeline-studio'>
            <FontAwesomeIcon icon={faCircleInfo} style={{fontSize:"1.8rem"}} />
            <div title={pipelineStudioDescription}>
              {truncateString(pipelineStudioDescription)}
            </div>
          </div>
        }
          
         {variablesPresent && !isFromPipelineStudio && 
            <div className='base-node-info-section-container '>
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
                        {  allVariables.map((row,index) => (
                          <StyledTableRow key={index}>
                            <StyledTableCell component="th" scope="row">
                             {row["varName"]}
                            </StyledTableCell>
                          <StyledTableCell align="right">{getStoredVariableValue(row["varName"])}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>  
                  </Table>
                </TableContainer>
              
              <div className='custom-node-bottom-toolbox '>
   			         <button className='processing-node-toolbox-btn' onClick={()=>{openVariablesEditMenu()}} disabled={pipelineIsRunning}> Edit Variables <FontAwesomeIcon icon={faArrowUpRightFromSquare}/></button>
                 <button className='processing-node-toolbox-btn same-width-btn' onClick={()=>{setSeeLogs(true)}} disabled={pipelineIsRunning}>  See Logs <FontAwesomeIcon icon={faScroll}/></button>
		         </div>
          </div>
         }  
        { 
          !variablesPresent && !isFromPipelineStudio && !isFromShamrock &&
          <div className='empty-node-box'>  
              <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container' /> 
              <button className='processing-node-toolbox-btn same-width-btn no-variables-loader no-variables-btn-exporter' onClick={()=>{setSeeLogs(true)}} disabled={pipelineIsRunning}>  See Logs <FontAwesomeIcon icon={faScroll}/></button>
          </div> 
        } 
        {
                  isFromShamrock &&
                  <div className="empty-node-box">
                    <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container empty-node-container-loader' /> 
                  </div> 
        }
        { isFromPipelineStudio && 
        <div className='from-pipeline-studio-buttons-container'>
          <button className='edit-variables-btn-loader pipeline-studio-node-btn transformer-edit-btn' onClick={() => { setChangeBlockNameOpen(true)}}> Edit  <FontAwesomeIcon className='pipeline-studio-edit-node-icon ' icon={faPencil} /></button>
          <button className='edit-variables-btn-loader pipeline-studio-node-btn transformer-edit-btn' onClick={() => { setSeeVariablesMenuOpen(true)}}> Variables  <FontAwesomeIcon className='pipeline-studio-edit-node-icon ' icon={faListUl} /></button>
        </div>
         }
         {
              isFromShamrock &&  
    
              <div className='from-pipeline-studio-buttons-container'>
                { !shamrockWasSaved ?  <button className='edit-variables-btn-loader pipeline-studio-node-btn transformer-edit-btn' onClick={() => { setChangeBlockNameOpen(true)}}> Edit  <FontAwesomeIcon className='pipeline-studio-edit-node-icon ' icon={faPencil} /></button>
                :
                    <div className='empty-box-padding'>
                    </div>
                }
               
              </div> 
                   
          }    
        { variablesInputOpen && <VariablesInput fullNodeName={fullNodeName} variablesData={allVariables} open={variablesInputOpen} handleClose={()=>{setVariablesInputOpen(false);}} />}
        { changeBlockNameOpen && !isFromShamrock && <ChangeBlockName name={pipelineStudioName} handleAction={(name)=>{changeBlockName(name)}} open={changeBlockNameOpen} handleClose={()=>{setChangeBlockNameOpen(false)}}></ChangeBlockName>}
        { changeBlockNameOpen && isFromShamrock &&  <ChangeBlockName name={data.name} handleAction={(name)=>{changeBlockNameShamrock(name)}} open={changeBlockNameOpen} handleClose={()=>{setChangeBlockNameOpen(false)}}></ChangeBlockName>}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{padding:"10px",border:"3px solid #ff33cc"}}
        isConnectable={isConnectable}
      />
     {seeVariablesMenuOpen && <SeeVariables blockName={data.fromPipelineStudio.initialName} handleClose={()=>{setSeeVariablesMenuOpen(false)}} open={seeVariablesMenuOpen} />}
     {seeLogs && <Logs open={seeLogs} blockData={data} handleClose={()=>{setSeeLogs(false)}} />}
    </div>
  );
}); 

import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./BaseNodesStyles.css";
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import VariablesInput from '../DataProcessing/dialogs/VariablesInput/VariablesInput';
import ViewData from '../DataProcessing/dialogs/ViewData/ViewData';
import ChangeBlockName from '../DataProcessing/dialogs/ChangeBlockName/ChangeBlockName';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from "react-redux/es/hooks/useSelector";
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import SeeVariables from '../DataProcessing/dialogs/SeeVariables/SeeVariables';
import {  faListUl, faDiagramProject, faCircleInfo,faArrowUpRightFromSquare, faScroll } from '@fortawesome/free-solid-svg-icons';
import Logs from '../DataProcessing/dialogs/Logs/Logs';
import { truncateString } from '../../utils/truncateString';
import {parseJSONVar} from "../../utils/parseJSONVar";
import {useDispatch} from 'react-redux'; 
import formatName from '../../utils/formatName';
import isObject from '../../utils/isObject';
import {setPipelineStudioNodes,setStoredPipelineName, setBlocksVariables ,setShamrockNodes ,setBlockCatalogSelectedOptions, setPipelineStudioEdgeToDelete} from "../../reducers/nodeSlice";
 
export default memo(({ data, isConnectable }) => {

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
  
  const allRunningPipelines = useSelector((state)=> state.runningPipelines);
  const variablesValues = useSelector((state) => state.blocksVariables);
  const shamrockWasSaved = useSelector((state)=> state.shamrockWasSaved);
  const [seeVariablesMenuOpen, setSeeVariablesMenuOpen] = useState(false);
  const [variablesPresent, setVariablesPresent] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [fullNodeName, setFullNodeName] = useState("");
  const [params, setParams] = useState({});
  const [allVariables, setAllVariables] = useState([]);
  const [storedVariables, setStoredVariables] = useState([]);
  const [variablesInputOpen, setVariablesInputOpen] = useState(false);
  const [viewDataDialog, setViewDataDialog] = useState(false);
  const [isFromPipelineStudio, setIsFromPipelineStudio] = useState(false);
  const [pipelineStudioName, setPipelineStudioName] = useState("");
  const [pipelineStudioDescription, setPipelineStudioDescription] = useState("");
  const [changeBlockNameOpen, setChangeBlockNameOpen] = useState(false);
  const [pipelineIsRunning, setPipelineIsRunning] = useState(false);
  const [seeLogs, setSeeLogs] = useState(false);
  const [isFromShamrock, setIsFromShamrock] = useState(false);
  const [variableValues, setVariableValues] = useState([]);
  const [nodeNameId, setNodeNameId] = useState();
  const storedPipelinesBlockInfo = useSelector((state)=> state.pipelinesBlocks);
  let blocksVariablesStored = useSelector((state)=> state.blocksVariables);
  const storedPipelineNodes = useSelector((state)=>state.pipelineStudioNodes);
  const shamrockNodes = useSelector((state)=> state.shamrockNodes);
  const blockCatalogSelectedOptions = useSelector((state)=> state.blockCatalogSelectedOptions);
  const allEdges = useSelector((state)=> state.pipelineStudioEdges);
  const brokerEntityId = useSelector((state)=>state.brokerEntityId);
  const dispatch = useDispatch();

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

  const parseString = (str) => {
    if (str.length > 20) {
      return str.substring(0, 20) + '...';
    } else {
      return str;
    }
  }

  const processName = (str) => {
    const truncateString = "...";
    const maxLength = 29;
    if (str.length > maxLength) {
      setNodeName(str.substring(0, maxLength) + truncateString);
    } else {
      setNodeName(str);
    }
  }

  const processVariablesValues = (varsVals) => {
    const storedVars = [];
    for (let val of varsVals) {
      if (val.block_name === fullNodeName) {
        
        if (val.type === "multiple") {
          storedVars.push(
            {
              "variable_name": val.variable_name,
              "value": val.value.length
            }
          );
        } else {
          storedVars.push({
            "variable_name": val.variable_name,
            "value": val.value
          });
        }
      }
    }
    setStoredVariables(storedVars);
  }


  const parseArray = (arr) => {
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


  const getStoredVariableValue = (varName) => {

    
    for (const variable of variablesValues) {
      if (variable.variable_name === varName && variable.block_name === data.name && variable.tabName === data.tabName) {
        if (Array.isArray(variable.value)) {
          return parseArray(variable.value);
        } else {
          return parseString(variable.value);
        }
      }
    }
    return "";
  }

  const openVariablesEditMenu = () => {
    setVariablesInputOpen(true);
  }

  const handleCloseViewData = ()=>{
    setViewDataDialog(false);
  }

  const deleteNode = () => {
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
  
 
  useEffect(() => {
    setParams(data.config);
    processName(data.name)
    setFullNodeName(data.name);
  }, [])


  useEffect(() => {
    processName(data.name);
    setFullNodeName(data.name);


    if (typeof data.config[Object.keys(data.config)[0]] === 'object' && data.config[Object.keys(data.config)[0]] !== null) {
      
      const allVarsData = [];
  
      for(const varValue of Object.keys(data.config)){
       
        if(varValue === "pipelineName"){
          continue;
        }

        if(!isObject(data.config[varValue])){
          continue;
        }

        if(!data.config[varValue]["type"]){
          continue;
        }
 
        const newObj = {
          varName:varValue,
          ...data.config[varValue]
        }
        allVarsData.push(newObj);
      } 

      setAllVariables(allVarsData);

      if(allVarsData.length != 0){
        setVariablesPresent(true);
      } else {
        setVariablesPresent(false);
      }
      
      return;
   }

    
    const allVars = Object.keys(data.config);
    const allVarsType = Object.values(data.config);
    

    let varObj;
    const allVarsData = [];
    for (let i = 0; i < allVars.length; i++) {
      
      const parsedJSONVar = parseJSONVar(allVarsType[i]);
    
      if(![undefined, "", null, 0].includes(parsedJSONVar) && ["multiple_selection", "string", "number", "drop_down", "date", "boolean"].includes(parsedJSONVar["type"])) {
        varObj = {
          varName: allVars[i],
          tabName:data.tabName,
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
    
  }, [])

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
        
        let inputedValuesVariables = [...variableValues];
        let objToStore;
  
        let pipelineName = "";
        let nodeNameId = convertToSnakeCase(data.name);
        
        for(const [key, value] of Object.entries(storedPipelinesBlockInfo)){
          if(key == formatName(fullNodeName)){
            pipelineName = value;
          }
        }
         
        objToStore = {
        block_name:data.name,
        variable_name:"entity_id",
        value:brokerEntityId,
        nodeId:nodeNameId,
        pipelineName:data.config.pipelineName
      }
        
      inputedValuesVariables = updateObjectInArray(inputedValuesVariables, objToStore);
      setVariableValues(inputedValuesVariables);
        
      blocksVariablesStored = parseAndSet(blocksVariablesStored, inputedValuesVariables);  
      dispatch(setBlocksVariables(blocksVariablesStored)); 

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

  useEffect(()=>{
    
    if(brokerEntityId && brokerEntityId.length!==0){
      createObjToStore();
    }
       
  },[brokerEntityId])

 
  return (
    <div style={{ width:"500px", borderRadius: "6%", padding: "10px", border: "2px solid blue", backgroundColor: "#e0e9ff", minHeight: "200px", height:"auto" }}>
      {isFromPipelineStudio && <p className='remove-node-btn-container' onClick={()=>{deleteNode()}}><span className='remove-node-btn'>x</span></p> }
      <div> 

        {isFromPipelineStudio? 
          <div className='base-node-header node-header-filter processing-node-header loader-header' style={{"backgroundColor":"rgb(24, 1, 231)"}} >
            <div className='node-title' title={pipelineStudioName}> {pipelineStudioName} </div>
          </div>
          :
          <div className='base-node-header node-header-filter processing-node-header loader-header' style={{"backgroundColor":"rgb(24, 1, 231)"}}>
            <div className='node-title' title={fullNodeName}> {nodeName ? nodeName : "Loader"} </div>
          </div>
        }
         
 
        {variablesPresent && !isFromPipelineStudio &&
          <div className='base-node-info-section-container' style={{
            "marginBottom":`${allVariables.length < 2 ? "1px" : "50px"}`
          }}>
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
                      <StyledTableCell component="th" scope="row" title={row["varName"]}>
                        {truncateString(row["varName"], 25)}
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

 
          </div> 
        }
        {
          isFromPipelineStudio && 
          <div className='base-node-info-section-container base-node-from-pipeline-studio'>
            <FontAwesomeIcon icon={faCircleInfo} style={{fontSize:"1.8rem"}} />
            <div title={pipelineStudioDescription}>
              {truncateString(pipelineStudioDescription, 195)}
            </div>
          </div>
        }
        {
          !variablesPresent && !isFromPipelineStudio && !isFromShamrock &&
          <div className="empty-node-box">
            <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container empty-node-container-loader' /> 
            <button className='edit-variables-btn-loader  btn-loader-no-variables same-width-btn' onClick={() => { setSeeLogs(true) }} disabled={pipelineIsRunning} > See Logs <FontAwesomeIcon icon={faScroll} /></button>              
              {/* <button className='change-base-btn base-toolbox-btn no-variables-present' onClick={() => { setViewDataDialog(true) }}>View Data <FontAwesomeIcon icon={faChartSimple} /> </button> */}
          </div> 
        } 
        {
          isFromShamrock &&
          <div className="empty-node-box">
            <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container empty-node-container-loader' /> 
          </div> 
        }
        {
          variablesPresent && 
          <div className='base-node-info-section' style={{
             "marginTop": `${allVariables.length > 2 ? "80px": ""}`
            }}>
              <div className='base-node-bottom-toolbox' style={{
                "marginBottom": `${allVariables.length > 2 ? "10px": ""}`
              }}>
                {/* <button className='change-base-btn base-toolbox-btn' onClick={() => { setViewDataDialog(true) }}>View Data <FontAwesomeIcon icon={faChartSimple} /> </button> */}
                <button className='edit-variables-btn-loader same-width-btn' onClick={() => { openVariablesEditMenu() }} disabled={pipelineIsRunning} > Edit Variables <FontAwesomeIcon icon={faArrowUpRightFromSquare} /></button>
                <button className='edit-variables-btn-loader same-width-btn' onClick={() => { setSeeLogs(true) }} disabled={pipelineIsRunning} > See Logs <FontAwesomeIcon icon={faScroll} /></button>
              </div>
          </div>
        }

        {isFromPipelineStudio &&
          <div className='from-pipeline-studio-buttons-container'>
            <button className='edit-variables-btn-loader pipeline-studio-node-btn' onClick={() => {setChangeBlockNameOpen(true)}}> Edit  <FontAwesomeIcon className='pipeline-studio-edit-node-icon' icon={faPencil} /></button>
            <button className='edit-variables-btn-loader pipeline-studio-node-btn' onClick={() => {setSeeVariablesMenuOpen(true)}}> Variables  <FontAwesomeIcon className='pipeline-studio-edit-node-icon' icon={faListUl} /></button>
          </div>
        }

        {
          isFromShamrock && 

          <div className='from-pipeline-studio-buttons-container'>
           {!shamrockWasSaved ? 
             <button className='edit-variables-btn-loader pipeline-studio-node-btn' onClick={() => {setChangeBlockNameOpen(true)}}> Edit  <FontAwesomeIcon className='pipeline-studio-edit-node-icon' icon={faPencil} /></button>
            :
             <div className='empty-box-padding'>

             </div>
           }
           
          </div> 
          
        }     
          
       
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ padding: "10px", border: "3px solid blue" }}
        isConnectable={true} 
      />
      {variablesInputOpen && <VariablesInput fullNodeName={fullNodeName} variablesData={allVariables} open={variablesInputOpen} handleClose={() => { setVariablesInputOpen(false); }} tabName={data.tabName} />}
      {viewDataDialog && <ViewData open={viewDataDialog} handleClose={handleCloseViewData} pipelineType={data.pipelineType}></ViewData>}
      {changeBlockNameOpen && !isFromShamrock &&<ChangeBlockName name={pipelineStudioName} handleAction={(name)=>{changeBlockName(name)}} open={changeBlockNameOpen} handleClose={()=>{setChangeBlockNameOpen(false)}} />}
      {changeBlockNameOpen && isFromShamrock &&  <ChangeBlockName name={data.name} handleAction={(name)=>{changeBlockNameShamrock(name)}} open={changeBlockNameOpen} handleClose={()=>{setChangeBlockNameOpen(false)}}></ChangeBlockName>}
      {seeVariablesMenuOpen && <SeeVariables blockName={data.fromPipelineStudio.initialName} handleClose={()=>{setSeeVariablesMenuOpen(false)}} open={seeVariablesMenuOpen} />}
      {seeLogs && <Logs open={seeLogs} blockData={data} handleClose={()=>{setSeeLogs(false)}} />}
    </div>
  );
});

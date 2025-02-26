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
import { faDiagramProject, faMap} from '@fortawesome/free-solid-svg-icons';
import VariablesInput from '../DataProcessing/dialogs/VariablesInput/VariablesInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PREDICT_RESULTS_LINK } from '../../utils/apiEndpoints';
import { useSelector } from "react-redux/es/hooks/useSelector";
import { faArrowUpRightFromSquare, faPencil, faScrewdriverWrench, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import ViewMap from '../DataProcessing/dialogs/PredictResults/ViewMap';
import { setMapData } from '../../reducers/nodeSlice';
import toast from 'react-hot-toast';
import ChangeBlockName from '../DataProcessing/dialogs/ChangeBlockName/ChangeBlockName';
import BlockInfo from '../DataProcessing/dialogs/BlockInfo/BlockInfo';
import axios from 'axios';
import { truncateString } from '../../utils/truncateString';
import {useDispatch} from 'react-redux';
import {parseJSONVar} from "../../utils/parseJSONVar";
import {setStoredPipelineName, setPipelineStudioEdgeToDelete, setPipelineStudioNodes, setBlockCatalogSelectedOptions} from "../../reducers/nodeSlice";
 

 
export default memo(({ data, isConnectable }) => {
 
  const dispatch = useDispatch();
  const selectedTrainedModel = useSelector((state)=> state.selectedTrainedModel);
  const variablesValues = useSelector((state)=> state.blocksVariables);
  const [blockInfoOpen, setBlockInfoOpen] = useState(false);
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
  const [changeBlockNameOpen, setChangeBlockNameOpen] = useState(false);
  const [pipelineStudioDescription, setPipelineStudioDescription] = useState("");
  const storedPipelineNodes = useSelector((state)=>state.pipelineStudioNodes);
  const blockCatalogSelectedOptions = useSelector((state)=> state.blockCatalogSelectedOptions);
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
  

  useEffect(()=>{
    processName(data.name);
    setFullNodeName(data.name);
    
  },[])

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
  

  useEffect(()=>{
    processName(data.name);
    setFullNodeName(data.name);
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

 
  return (
    <div style={{ width:"500px", borderRadius:"6%",padding:"10px",border:"2px solid #f56a00", backgroundColor:"#fcecd7", minHeight:"200px" }}>

      {(data.fromPipelineStudio.type === "transformer" || data.fromPipelineStudio.type === "exporter") && 
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            style={{padding:"10px",border:"4px solid #f56a00"}}
            isConnectable={isConnectable} 
          />
      }
        
      <div> 
      { isFromPipelineStudio &&  <p className='remove-node-btn-container' onClick={()=>{deleteNode()}}><span className='remove-node-btn'>x</span></p> }
        {isFromPipelineStudio ? 
          
          <div className='export-node-header node-header-filter model-training-card-header generated-block-header'>
              <p className='exporter-node-header-title' title={pipelineStudioName}> {pipelineStudioName}</p>
          </div>  
        :
          <div className='export-node-header node-header-filter model-training-card-header' >
            <p className='exporter-node-header-title' title={fullNodeName}> {nodeName? nodeName:"Custom"}</p>
          </div>  
        }
      
        {variablesPresent && !isFromPipelineStudio && 
          <div className='base-node-info-section-container'>
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
              
              <div className='custom-node-bottom-toolbox'>
                  <button className='custom-node-toolbox-btn'onClick={()=>{openVariablesEditMenu()}}> Edit Variables <FontAwesomeIcon icon={faArrowUpRightFromSquare}/></button>
              </div>
          </div>
         }
        {
          (!variablesPresent && !specialBlockViewButton) && !isFromPipelineStudio && <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container' /> 
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
          { isFromPipelineStudio && <div className='generated-node-actions'>
                <button className='edit-variables-btn-loader pipeline-studio-node-btn generated-node-edit-btn' onClick={() => { setChangeBlockNameOpen(true)}}> Edit  <FontAwesomeIcon className='pipeline-studio-edit-node-icon' icon={faPencil} /></button>
                <button className='edit-variables-btn-loader pipeline-studio-node-btn generated-node-edit-btn' onClick={() => {setBlockInfoOpen(true) }}> Tools  <FontAwesomeIcon className='pipeline-studio-edit-node-icon' icon={faScrewdriverWrench} /></button>
            </div>
          }
         {viewMapOpen && 
          <ViewMap open={viewMapOpen} handleClose={()=>{setViewMapOpen(false)}} ></ViewMap>
         }
      </div>
        {blockInfoOpen && <BlockInfo blockData={data} open={blockInfoOpen} handleClose={()=>{setBlockInfoOpen(false)}} fromPipelineStudio={data.fromPipelineStudio} />} 

        {(data.fromPipelineStudio.type === "transformer" || data.fromPipelineStudio.type === "loader") &&
            <Handle
            type="source"
            position={Position.Right}
            id="right"
            style={{padding:"10px",border:"4px solid #f56a00"}}
            isConnectable={isConnectable} 
            />
         }
         { changeBlockNameOpen && <ChangeBlockName name={pipelineStudioName} handleAction={(name)=>{changeBlockName(name)}} open={changeBlockNameOpen} handleClose={()=>{setChangeBlockNameOpen(false)}} />}
    </div>

   
  );
});

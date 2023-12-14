import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./BaseNodesStyles.css";
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from "react-redux/es/hooks/useSelector";
import { faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import TableRow from '@mui/material/TableRow';
import VariablesInput from '../dialogs/VariablesInput/VariablesInput';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Paper from '@mui/material/Paper';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import {setNodes, removeDataFeaturingColumns} from "../../../reducers/nodeSlice";
import { useDispatch } from 'react-redux';

export default memo(({ data, isConnectable }) => {
  
  const dataset = useSelector((state)=>state.selectedDataset);
  const variablesValues = useSelector((state)=> state.blocksVariables);
  const dispatch = useDispatch();
  const dataFeaturing = useSelector((state)=>state.selectedDataFeaturingColumns);
  const [variablesInputOpen, setVariablesInputOpen] = useState(false);
  const [rows,setRows] = useState([]);
  const [variablesPresent, setVariablesPresent] = useState(null);
  const [allColumns , setAllColumns] = useState([]);
  const [fullNodeName, setFullNodeName] = useState("");
  const [nodeName, setNodeName] = useState("");
  const [allVariables, setAllVariables] = useState([]);
  const [variablesInputtedValues, setVariablesInputtedValues] = useState([]);
  const allNodes = useSelector((state)=>state.nodes);
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  function createData(column_name, sample_data) {
    return { column_name, sample_data };
  }

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const populateRows = (data)=>{
    let newRows = [];
    for(let dt of data){
      newRows.push(createData(dt.column_name,dt.sample_data));
    }
    newRows = newRows.slice(0,5);
    setRows(newRows);
  }
  
  const openEditSelectedRowsDialog = ()=>{
    setVariablesInputOpen(true);
  } 

  const deleteNode = ()=>{
    let newNodeList = [...allNodes];
    newNodeList = newNodeList.filter((node)=> node.nodeData.type!=="Data featuring");
    dispatch(setNodes(newNodeList));
    setTimeout(()=>{
      dispatch(removeDataFeaturingColumns());
    },100);
  }

  const isDatasetSelected = ()=>{
    if( !dataset || dataset.length == 0){
      return false;
    } else {
      return true;
    }
  }

  const checkDatasetSelectedAndGo = ()=>{
    setVariablesInputOpen(true);
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
    populateRows(dataFeaturing);
  },[dataFeaturing])

  useEffect(()=>{
    processName(data.name);
    setFullNodeName(data.name);
    const allVars = Object.keys(data.config);
    const allVarsType = Object.values(data.config);
    const allVarsData = [];
    for(let i = 0; i<allVars.length; i++){
      const varObj = {
        varName:allVars[i],
        type:allVarsType[i]
      }
      allVarsData.push(varObj);
    }
    setAllVariables(allVarsData);
    if(Object.keys(data.config).length!=0){
      setVariablesPresent(true);
    } else {
      setVariablesPresent(false);
    }
  },[])

  const processVariablesValues = (varsVals)=>{
    const storedVars = [];
    for(let val of varsVals){
      if(val.block_name == fullNodeName){
        if(val.type == "multiple"){
           storedVars.push(val.value.length);
        } else {
          storedVars.push(val.value);
        }
      }
    }

    console.log(storedVars);
  }

  useEffect(()=>{
    processVariablesValues(variablesValues);
  },[variablesValues])

  return (
    <div style={{ width:"500px", borderRadius:"5%",padding:"10px",border:"1px solid #ff33cc", backgroundColor:"#ffdbfe", minHeight:"200px" }}>
        <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{padding:"10px",border:"3px solid #ff33cc"}}
        isConnectable={isConnectable}
      />  
      <div>
        <div className='base-node-header node-header-filter processing-node-header' title={fullNodeName}>
            {nodeName? nodeName:"Transformer"}
        </div>
       
         {variablesPresent && 
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
                        {allVariables.map((row,index) => (
                          <StyledTableRow key={index}>
                            <StyledTableCell component="th" scope="row">
                             {row["varName"]}
                            </StyledTableCell>
                          <StyledTableCell align="right"></StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              
              <div className='custom-node-bottom-toolbox'>
   			        <button className='processing-node-toolbox-btn' onClick={()=>{checkDatasetSelectedAndGo()}}> Edit Variables <FontAwesomeIcon icon={faArrowUpRightFromSquare}/></button>
		         </div>
          </div>
         }
        {
          !variablesPresent && <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container' /> 
        }
        {variablesInputOpen && <VariablesInput fullNodeName={fullNodeName} variablesData={allVariables} open={variablesInputOpen} handleClose={()=>{setVariablesInputOpen(false);}} />}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{padding:"10px",border:"3px solid #ff33cc"}}
        isConnectable={isConnectable}
      />
     
    </div>
  );
});

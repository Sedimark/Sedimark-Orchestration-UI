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
import { faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import VariablesInput from '../dialogs/VariablesInput/VariablesInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from "react-redux/es/hooks/useSelector";
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
 
export default memo(({ data, isConnectable }) => {
 
  const variablesValues = useSelector((state)=> state.blocksVariables);
  const [storedVariables, setStoredVariables] = useState([]);
  const [nodeName, setNodeName] = useState("");
  const [fullNodeName, setFullNodeName] = useState("");
  const [allVariables, setAllVariables] = useState([]);
  const [variablesPresent, setVariablesPresent] = useState(false);
  const [variablesInputOpen, setVariablesInputOpen] = useState(false);
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
      if(val.block_name == fullNodeName){
        if(val.type == "multiple"){
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
      if(variable.variable_name == varName){
        if(Array.isArray(variable.value)){
          return parseArray(variable.value);
        } else {
          return parseString(variable.value);
        }
      }
    }
    return "";
  }

  const openVariablesEditMenu = ()=>{
    setVariablesInputOpen(true);
  }

  useEffect(()=>{
    processVariablesValues(variablesValues);
  },[variablesValues])

  useEffect(()=>{
    if(Object.keys(data.config).length!=0){
      setVariablesPresent(true);
    } else {
      setVariablesPresent(false);
    }
  
  },[storedVariables])

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
    
  },[])

 
  return (
    <div style={{ width:"400px", borderRadius:"6%",padding:"0px",border:"2px solid yellow", backgroundColor:"#f5ffcd", minHeight:"200px" }}>
        <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{padding:"10px",border:"4px solid #e9e008"}}
        isConnectable={isConnectable}
      />
      <div> 
      
       <div className='export-node-header node-header-filter model-training-card-header'>
            <p className='exporter-node-header-title' title={fullNodeName}> {nodeName? nodeName:"Custom"}</p>
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
          !variablesPresent && <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container' /> 
        }
        {variablesInputOpen && <VariablesInput fullNodeName={fullNodeName} variablesData={allVariables} open={variablesInputOpen} handleClose={()=>{setVariablesInputOpen(false);}} />}

      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{padding:"10px",border:"4px solid #e9e008"}}
        isConnectable={isConnectable}
      />
    </div>
  );
});

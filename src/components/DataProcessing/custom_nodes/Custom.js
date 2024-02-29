import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./BaseNodesStyles.css";
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux/es/hooks/useSelector";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import VariablesInput from '../dialogs/VariablesInput/VariablesInput';

 
export default memo(({ data, isConnectable }) => {

  const variablesValues = useSelector((state)=> state.blocksVariables);
  const normalizationColumns = useSelector((state)=>state.normalizationColumns);
  const standardizationColumns = useSelector((state)=>state.standardizationColumns);
  const [variablesPresent, setVariablesPresent] = useState(true);
  const [nodeName, setNodeName] = useState("");
  const [fullNodeName, setFullNodeName] = useState("");
  const [storedVariables, setStoredVariables] = useState([]);
  const [variablesInputOpen, setVariablesInputOpen] = useState(false);
  const [allVariables, setAllVariables] = useState([]);
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
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  

  const shuffleArray = (array)=>{
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  const combineAndSet = ()=>{
    let finalResult = [];
    for(const colS of standardizationColumns){
      const newObj = {
        name:colS.column_name,
        algType:"Standardization"
      }
      finalResult.push(newObj);
    }

    for(const colN of normalizationColumns){
      const newObj = {
        name:colN.column_name,
        algType:"Normalization"
      }
      finalResult.push(newObj);
    }
    shuffleArray(finalResult);
    finalResult = finalResult.slice(0,5);
    
  }

  const parseString = (str)=>{
    if(str.length > 20){
       return str.substring(0,20) + '...';
    } else {
      return str;
    }
  }
  
  const openVariablesEditMenu = ()=>{
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

  useEffect(()=>{
    combineAndSet();
  },[standardizationColumns, normalizationColumns])
 
  useEffect(()=>{
    processName(data.name);
    setFullNodeName(data.name)
    

    if(Object.keys(data.config).length!=0){
      setVariablesPresent(true);
    } else {
      setVariablesPresent(false);
    }
    
  
    if(Object.keys(data.config).length == 1){
      if(data.config[Object.keys(data.config)[0]] == null){
        setVariablesPresent(false);
      }
    }

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



  useEffect(()=>{
    if(Object.keys(data.config).length!=0){
      setVariablesPresent(true);
    } else {
      setVariablesPresent(false);
    }
  
  },[storedVariables])


  useEffect(()=>{
    processVariablesValues(variablesValues);
  },[variablesValues])


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


  return (
    <div style={{ width:"500px", borderRadius:"5%",padding:"10px",border:"1px solid #000", backgroundColor:"#d6d6d4", minHeight:"200px" }}>
        <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{padding:"10px",border:"3px solid #737373"}}
        isConnectable={isConnectable}
      />
      <div>
        <div className='custom-node-header node-header-filter' title={fullNodeName}>
        {nodeName? nodeName:"Custom"}
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
        {
          variablesInputOpen && <VariablesInput fullNodeName={fullNodeName} variablesData={allVariables} open={variablesInputOpen} handleClose={()=>{setVariablesInputOpen(false);}} />
        }
      
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{padding:"10px",border:"3px solid #737373"}}
        isConnectable={isConnectable}
      />
    </div>
  );
});

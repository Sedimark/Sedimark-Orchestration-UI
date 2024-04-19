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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartSimple } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux/es/hooks/useSelector";
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import { parseTheType } from '../../utils/parseTheType';
import { parseTheDescription } from '../../utils/parseTheDescription';
import {parseJSONVar} from "../../utils/parseJSONVar";

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

  const variablesValues = useSelector((state) => state.blocksVariables);
  const [variablesPresent, setVariablesPresent] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [fullNodeName, setFullNodeName] = useState("");
  const [params, setParams] = useState({});
  const [allVariables, setAllVariables] = useState([]);
  const [storedVariables, setStoredVariables] = useState([]);
  const [variablesInputOpen, setVariablesInputOpen] = useState(false);
  const [viewDataDialog, setViewDataDialog] = useState(false);
  
 

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
      if (val.block_name == fullNodeName) {
        
        if (val.type == "multiple") {
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
      if (variable.variable_name == varName) {
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

  useEffect(() => {
    setParams(data.config);
    processName(data.name)
    setFullNodeName(data.name);

  }, [])

 

  useEffect(() => {
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

  }, [])

  useEffect(() => {
    processVariablesValues(variablesValues);

  }, [variablesValues])

 


  return (
    <div style={{ borderRadius: "5%", padding: "20px", border: "1px solid blue", backgroundColor: "#e0e9ff", minHeight: "150px" }}>
      <div>
        <div className='base-node-header'>
          <div className='node-title' title={fullNodeName}> {nodeName ? nodeName : "Loader"} </div>
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
                  {allVariables.map((row, index) => (
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

 
          </div> 
        }
        {
          !variablesPresent && 
          <div className="no-variables-container">
            <div>
            <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container' /> 
            </div>  
              <button className='change-base-btn base-toolbox-btn no-variables-present' onClick={() => { setViewDataDialog(true) }}>View Data <FontAwesomeIcon icon={faChartSimple} /> </button>
          </div> 
        }
        {
          variablesPresent && 
          <div className='base-node-info-section'>
              <div className='base-node-bottom-toolbox'>
                <button className='change-base-btn base-toolbox-btn' onClick={() => { setViewDataDialog(true) }}>View Data <FontAwesomeIcon icon={faChartSimple} /> </button>
                <button className='edit-variables-btn-loader' onClick={() => { openVariablesEditMenu() }}> Edit Variables <FontAwesomeIcon icon={faArrowUpRightFromSquare} /></button>
              </div>
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
      {variablesInputOpen && <VariablesInput fullNodeName={fullNodeName} variablesData={allVariables} open={variablesInputOpen} handleClose={() => { setVariablesInputOpen(false); }} />}
      {viewDataDialog && <ViewData open={viewDataDialog} handleClose={handleCloseViewData}></ViewData>}
    </div>
  );
});

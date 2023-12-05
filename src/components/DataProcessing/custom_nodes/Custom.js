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
import NormalizationStandardization from '../dialogs/NormalizationStandardization/NormalizationStandardization';
import { useDispatch } from 'react-redux';
import {resetNormalizationAndStandardization, setNodes} from "../../../reducers/nodeSlice";

 
export default memo(({ data, isConnectable }) => {
  
  const dispatch = useDispatch();
  const dataset = useSelector((state)=>state.selectedDataset);
  const normalizationColumns = useSelector((state)=>state.normalizationColumns);
  const standardizationColumns = useSelector((state)=>state.standardizationColumns);
  const [allColumns, setAllColumns] = useState([]);
  const allNodes = useSelector((state)=>state.nodes);
  const [normalizationStandarizationOpen, setNormalizationStandardizationOpen] = useState(false);
  const [variablesPresent, setVariablesPresent] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [fullNodeName, setFullNodeName] = useState("");
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

  
  function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }

  const shuffleArray = (array)=>{
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index between 0 and i
      const j = Math.floor(Math.random() * (i + 1));
  
      // Swap the elements at positions i and j
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
    setAllColumns(finalResult);
  }

  
  const deleteNode = ()=>{
    let newNodeList = [...allNodes];
    newNodeList = newNodeList.filter((node)=> node.nodeData.type!=="Normalization");
    dispatch(setNodes(newNodeList));
    setTimeout(()=>{
      dispatch(resetNormalizationAndStandardization());
    },100)
  }

  const isDatasetSelected = ()=>{
    if( !dataset || dataset.length == 0){
      return false;
    } else {
      return true;
    }
  } 

  const checkDatasetSelectedAndGo = ()=>{
    if(isDatasetSelected() == true){
      setNormalizationStandardizationOpen(true)
    } else {
      alert("There was no dataset selected!");
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
    combineAndSet();
  },[standardizationColumns, normalizationColumns])
 
  useEffect(()=>{
    processName(data.name);
    setFullNodeName(data.name)
  },[])

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
                      {allColumns.map((row,index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell component="th" scope="row">
                            {row.name}
                          </StyledTableCell>
                          <StyledTableCell align="right">{row.algType}</StyledTableCell>
                    
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              
              <div className='custom-node-bottom-toolbox'>
                  <button className='custom-node-toolbox-btn'onClick={()=>{checkDatasetSelectedAndGo()}}> Edit Variables <FontAwesomeIcon icon={faArrowUpRightFromSquare}/></button>
              </div>
          </div>
         }
        {
          !variablesPresent && <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container' /> 
        }
        <div className='dataset-node-bottom'>

        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{padding:"10px",border:"3px solid #737373"}}
        isConnectable={isConnectable}
      />
      {normalizationStandarizationOpen && <NormalizationStandardization open={normalizationStandarizationOpen} handleClose={()=>{setNormalizationStandardizationOpen(false)}} />}
    </div>
  );
});

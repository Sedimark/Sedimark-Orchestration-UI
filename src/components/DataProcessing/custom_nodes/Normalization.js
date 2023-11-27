import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./Loader.css";
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquareRootVariable } from '@fortawesome/free-solid-svg-icons';
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

  useEffect(()=>{
    combineAndSet();
  },[standardizationColumns, normalizationColumns])

  return (
    <div style={{ width:"500px", borderRadius:"5%",padding:"10px",border:"1px solid #03fcbe" }}>
        <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{padding:"10px",border:"3px solid #03fcbe"}}
        isConnectable={isConnectable}
      />
      <div>
      <p className='remove-node-btn-container' onClick={()=>{deleteNode()}}><span className='remove-node-btn'>x</span></p>
        <div className='dataset-node-header node-header-filter'>
            <FontAwesomeIcon icon={faSquareRootVariable} /> Normalization and Standardization
        </div>
        <div className='dataset-node-separator'>

        </div>
        <div className='dataset-node-info-section'>
            <h3> Selected Rows</h3>
            <hr/>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 200 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Column Name</StyledTableCell>
                    <StyledTableCell align="right">Algorithm applied</StyledTableCell>
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
            <hr/>
            <div className='dataset-node-bottom-toolbox'>
                <button className='dataset-toolbox-btn applied-alg'onClick={()=>{checkDatasetSelectedAndGo()}}> See all applied algorithms <FontAwesomeIcon icon={faArrowUpRightFromSquare}/></button>
            </div>
        </div>
        <div className='dataset-node-bottom'>

        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{padding:"10px",border:"3px solid #03fcbe"}}
        isConnectable={isConnectable}
      />
      {normalizationStandarizationOpen && <NormalizationStandardization open={normalizationStandarizationOpen} handleClose={()=>{setNormalizationStandardizationOpen(false)}} />}
    </div>
  );
});

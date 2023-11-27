import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./Loader.css";
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { faTable } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux/es/hooks/useSelector";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DataFeaturing from '../dialogs/DataFeaturing/DataFeaturing';
import {setNodes, removeDataFeaturingColumns} from "../../../reducers/nodeSlice";
import { useDispatch } from 'react-redux';

export default memo(({ data, isConnectable }) => {
  
  const dataset = useSelector((state)=>state.selectedDataset);
  const dispatch = useDispatch();
  const dataFeaturing = useSelector((state)=>state.selectedDataFeaturingColumns);
  const [dataFeaturingOpen, setDataFeaturingOpen] = useState(false);
  const [rows,setRows] = useState([]);
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
    setDataFeaturingOpen(true);
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
    if(isDatasetSelected() == true){
      openEditSelectedRowsDialog()
    } else {
      alert("There was no dataset selected!");
    }
  }

  useEffect(()=>{
    populateRows(dataFeaturing);
  },[dataFeaturing])

  return (
    <div style={{ width:"500px", borderRadius:"5%",padding:"10px",border:"1px solid #FFC0CB" }}>
        <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{padding:"10px",border:"3px solid #FFC0CB"}}
        isConnectable={isConnectable}
      /> 
      <div>
      <p className='remove-node-btn-container' onClick={()=>{deleteNode()}}><span className='remove-node-btn'>x</span></p>
        <div className='dataset-node-header node-header-filter processing-node-header'>
            <FontAwesomeIcon icon={faFilter} /> Data featuring
        </div>
       
        <div className='dataset-node-info-section'>
            <h3> <FontAwesomeIcon icon={faTable}/> Selected Rows</h3>
            <hr/>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 200 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Column Name</StyledTableCell>
                    <StyledTableCell align="right">Sample Data</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row,index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell component="th" scope="row">
                        {row.column_name}
                      </StyledTableCell>
                      <StyledTableCell align="right">{row.sample_data}</StyledTableCell>
                
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <hr/>
            <div className='dataset-node-bottom-toolbox'>
                <button className='dataset-toolbox-btn' onClick={()=>{checkDatasetSelectedAndGo()}}>See all selected rows <FontAwesomeIcon icon={faArrowUpRightFromSquare}/></button>
            </div>
        </div>
        <div className='dataset-node-bottom'>

        </div>
        {dataFeaturingOpen && <DataFeaturing open={dataFeaturingOpen} handleClose={()=>{setDataFeaturingOpen(false);}} />}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{padding:"10px",border:"3px solid #fa8219"}}
        isConnectable={isConnectable}
      />
     
    </div>
  );
});

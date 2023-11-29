import React, { memo, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./BaseNodesStyles.css";
import { styled } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux/es/hooks/useSelector";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
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
    <div style={{ width:"500px", borderRadius:"5%",padding:"10px",border:"1px solid #ff33cc", backgroundColor:"#ffdbfe", minHeight:"200px" }}>
        <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{padding:"10px",border:"3px solid #ff33cc"}}
        isConnectable={isConnectable}
      />  
      <div>
      {/* <p className='remove-node-btn-container' onClick={()=>{deleteNode()}}><span className='remove-node-btn'>x</span></p> */}
        <div className='base-node-header node-header-filter processing-node-header'>
            <FontAwesomeIcon icon={faFilter} /> Remove Null Columns
        </div>
       
        <div className='base-node-info-section info-section-processing'>
           <div className='processing-node-body'>
           <div class="dropdown-container">
            <label for="columns" class="dropdown-label">Columns:</label>
            <select id="columns" class="dropdown-select">
                <option value="1">One Column</option>
                <option value="2">Two Columns</option>
                <option value="3">Three Columns</option>
            </select>
        </div>
           </div>  
        </div>
        {dataFeaturingOpen && <DataFeaturing open={dataFeaturingOpen} handleClose={()=>{setDataFeaturingOpen(false);}} />}
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

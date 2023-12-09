import React, { memo , useEffect, useState} from 'react';
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
import DataSetInfoNode from '../dialogs/DatasetInfo/DatasetInfoNode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartSimple } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux/es/hooks/useSelector";
import {DATASET_FETCH_DATASET_INFO } from "../../../utils/apiEndpoints";
import DataSelectDialog from '../dialogs/DataSelectDialog/DataSelectDialog';
import {removeDataset, setNodes} from "../../../reducers/nodeSlice";
import { useDispatch } from 'react-redux';
import axios from "axios";

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


  const [publishDate, setPublishDate] = useState("");
  const [selectDataDialog, setSelectDataDialog] = useState(false);
  const [datasetInfoNodeDialog, setDatasetInfoNodeDialog] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [fullNodeName, setFullNodeName] = useState("");
  const dispatch = useDispatch();
  const datasetSelected = useSelector((state)=>state.selectedDataset);
  const allNodes = useSelector((state)=>state.nodes);
  const [params,setParams] = useState({});
  const [rows, setRows] = useState([]);

  const fetchDatasetInfo = (datasetId)=>{
    axios.get(DATASET_FETCH_DATASET_INFO(datasetId))
    .then(resp => {setPublishDate(resp.data.publish)})
    .catch(err => {console.log(err)})
  }

  const handleChangeDatasetButton = ()=>{
      setSelectDataDialog(true);
  }

  const handleDataSelectDialogClose = ()=>{
    setSelectDataDialog(false);
  }

  const handleDataInfoDialogNodeClose = () =>{
    setDatasetInfoNodeDialog(false);
  }

 
  const deleteNode = ()=>{
    let newNodeList = [...allNodes];
    newNodeList = newNodeList.filter((node)=> node.nodeData.type!=="Dataset");
    dispatch(setNodes(newNodeList));
    setTimeout(()=>{
      dispatch(removeDataset())
    },100)
    
  }

  useEffect(()=>{
    if(datasetSelected && datasetSelected.length!=0){
      fetchDatasetInfo(datasetSelected[0].id);
    }
  },[datasetSelected])

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
    setParams(data.config);
    processName(data.name)
    setFullNodeName(data.name);
    
  },[])

  useEffect(()=>{
  },[])


  return (
    <div style={{  borderRadius:"5%",padding:"10px" , border:"1px solid blue", backgroundColor:"#e0e9ff" , minHeight:"150px"}}> 
     <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{padding:"10px",border:"3px solid blue"}}
        isConnectable={true}
      />
      <div>
        <div className='base-node-header'>
             <div className='node-title' title={fullNodeName}> {nodeName? nodeName:"Loader"} </div>
        </div>
        <div className='base-node-info-section'>
            <div className='base-node-info-section-container node-content-container'>    
            {/* <TableContainer component={Paper}>
              <Table sx={{ minWidth: 200 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Variable Name</StyledTableCell>
                    <StyledTableCell align="right">Value</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(data.config).map((row,index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell component="th" scope="row">
                        {row}
                      </StyledTableCell>
                      <StyledTableCell align="right"></StyledTableCell>
                
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer> */}
            </div>
            <div className='base-node-bottom-toolbox'>
                <button className='change-base-btn base-toolbox-btn' onClick={()=>{handleChangeDatasetButton()}}>View Data <FontAwesomeIcon icon={faChartSimple}/> </button>
            </div>
        </div>
        
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{padding:"10px",border:"3px solid blue"}}
        isConnectable={true}
      />
      {selectDataDialog && <DataSelectDialog  open={selectDataDialog} handleClose={handleDataSelectDialogClose} />}
      {datasetInfoNodeDialog && <DataSetInfoNode open={datasetInfoNodeDialog} handleClose={()=>{handleDataInfoDialogNodeClose()}}></DataSetInfoNode>}
    </div>
  );
});

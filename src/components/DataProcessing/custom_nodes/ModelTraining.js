import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./Loader.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faDivide } from '@fortawesome/free-solid-svg-icons';
import { faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import { faStopwatch } from '@fortawesome/free-solid-svg-icons';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useDispatch } from 'react-redux';
import { useSelector } from "react-redux/es/hooks/useSelector";
import {resetNormalizationAndStandardization, setNodes, resetSelectedModelType} from "../../../reducers/nodeSlice";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}



export default memo(({ data, isConnectable }) => {
 
  const dispatch = useDispatch();
  const allNodes = useSelector((state)=>state.nodes);
  const rows = [
    createData('Training loss', 159),
    createData('Validation Loss', 237),
    createData('Training Accuracy', 262)
  ];

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const deleteNode = ()=>{
    let newNodeList = [...allNodes];
    newNodeList = newNodeList.filter((node)=> node.nodeData.type!=="Model Training");
    dispatch(setNodes(newNodeList));
    setTimeout(()=>{
      dispatch(resetSelectedModelType());
    },100)

  }

 
  return (
    <div style={{ width:"900px", borderRadius:"5%",padding:"10px",border:"3px solid #fff" }}>
        <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{padding:"10px",border:"4px solid #fff"}}
        isConnectable={isConnectable}
      />
      <div>
        <div className='dataset-node-header node-header-filter model-training-card-header'>
            <FontAwesomeIcon icon={faDiagramProject} /> Model training
        </div>
        <div className='dataset-node-separator'>
        <p className='remove-node-btn-container' onClick={()=>{deleteNode()}} ><span className='remove-node-btn'>x</span></p>
        </div>
        <div className='dataset-node-info-section'>
            <h3>  </h3>
            <hr/>
              <div className='training-card-body'>
                 <h1>Real Time Data</h1>
                 <p className='elapsed-time'><FontAwesomeIcon icon={faStopwatch} /> <span className='elapsed-time-text'>Elapsed Time:</span></p>
                 <TableContainer component={Paper} sx={{ maxWidth: 750,backgroundColor:"#121212" }} theme={darkTheme}>
                  <Table sx={{ maxWidth: 750}} aria-label="simple table" >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{color:"#fff", fontSize:"1.4rem",fontWeight:"bold"}}>Parameter Name</TableCell>
                        <TableCell align="right" sx={{color:"#fff", fontSize:"1.4rem",fontWeight:"bold"}}>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow
                          key={row.name}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 },color:"#fff" }}
                        >
                          <TableCell component="th" scope="row" sx={{color:"#fff", fontSize:"1.3rem"}}>
                            {row.name}
                          </TableCell>
                          <TableCell align="right" sx={{color:"#fff", fontSize:"1.3rem"}}>{row.calories}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </TableContainer>
               <div className='model-status-container'> 
                <p>Model status:<span>Training..</span></p>
                <div class="loading-spinner">
                  <div class="dot1"></div>
                  <div class="dot2"></div>
                  <div class="dot3"></div>
                </div>
                  <div className='done-container'>
                  ✨🎉🎉Done!! 🎉🎉✨
                  </div>
               </div>
              </div>
            <hr/>
            <div className='dataset-node-bottom-toolbox'>
                <button className='dataset-toolbox-btn model-data-btn'>See model data <FontAwesomeIcon icon={faArrowUpRightFromSquare}/></button>
            </div>
        </div>
        <div className='dataset-node-bottom'>
        
        </div>
      </div>
   
    </div>
  );
});

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./BaseNodesStyles.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
    <div style={{ width:"400px", borderRadius:"6%",padding:"0px",border:"2px solid yellow", backgroundColor:"#f5ffcd" }}>
        <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{padding:"10px",border:"4px solid #e9e008"}}
        isConnectable={isConnectable}
      />
      <div> 
      {/* <p className='remove-node-btn-container' onClick={()=>{deleteNode()}}><span className='remove-node-btn'>x</span></p> */}
        <div className='export-node-header node-header-filter model-training-card-header'>
            <p className='exporter-node-header-title'>EXPORTER</p>
        </div>
      
        <div className='base-node-info-section'> 
          <div className='exporter-card-body'>

            <div className='base-node-info-section '>
              <div className='exporter-node-body'>
              <div class="dropdown-container">
                <label for="columns" className="dropdown-label exporter-font-color">Broker:</label>
                <select id="columns" className="dropdown-select export-dropdown-style">
                    <option value="1">One Column</option>
                    <option value="2">Two Columns</option>
                    <option value="3">Three Columns</option>
                </select>
              </div>
                </div>  
              </div>
            <div>
            <label class="dropdown-label exporter-font-color">Entity-ID:</label>
              <input type="text" className="black-outline-input" placeholder="Enter Entity-ID"/>
             
            </div>
          </div>
        </div>
        <div className='dataset-node-bottom'>
        
        </div>
      </div>
   
    </div>
  );
});

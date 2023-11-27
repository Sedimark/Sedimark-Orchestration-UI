import React, { memo ,useCallback, useEffect, useState} from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./Loader.css";
import DataSetInfoNode from '../dialogs/DatasetInfo/DatasetInfoNode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { faChartSimple } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux/es/hooks/useSelector";
import {DATASET_FETCH_DATASET_INFO } from "../../../utils/apiEndpoints";
import DataSelectDialog from '../dialogs/DataSelectDialog/DataSelectDialog';
import {removeDataset, setNodes} from "../../../reducers/nodeSlice";
import { useDispatch } from 'react-redux';
import axios from "axios";

export default memo(({ data, isConnectable }) => {

  const [publishDate, setPublishDate] = useState("");
  const [selectDataDialog, setSelectDataDialog] = useState(false);
  const [datasetInfoNodeDialog, setDatasetInfoNodeDialog] = useState(false);
  const dispatch = useDispatch();
  const datasetSelected = useSelector((state)=>state.selectedDataset);
  const allNodes = useSelector((state)=>state.nodes);

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

 
  return (
    <div style={{  borderRadius:"5%",padding:"10px" , border:"1px solid blue", backgroundColor:"#cff6ff" }}> 
     <p className='remove-node-btn-container' onClick={()=>{deleteNode()}}><span className='remove-node-btn'>x</span></p>
      <div>
        <div className='dataset-node-header'>
            <FontAwesomeIcon icon={faFile} /> Loader
        </div>
        <div className='dataset-node-info-section'>
            <div className='dataset-node-info-section-container'>    
               <div class="file-input-container">
                    <strong><label for="myFile" class="select-file-button">Select File</label></strong>
                     <input type="file" class="file-input" id="myFile" />       
                </div>
            </div>
            <div className='dataset-node-bottom-toolbox'>
                <button className='change-dataset-btn dataset-toolbox-btn' onClick={()=>{handleChangeDatasetButton()}}>View Data <FontAwesomeIcon icon={faChartSimple}/> </button>
            </div>
        </div>
        
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="c"
        style={{padding:"10px",border:"3px solid blue"}}
        isConnectable={isConnectable}
      />
      {selectDataDialog && <DataSelectDialog  open={selectDataDialog} handleClose={handleDataSelectDialogClose} />}
      {datasetInfoNodeDialog && <DataSetInfoNode open={datasetInfoNodeDialog} handleClose={()=>{handleDataInfoDialogNodeClose()}}></DataSetInfoNode>}
    </div>
  );
});

import React, { memo ,useCallback, useEffect, useState} from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./BaseNodesStyles.css";
import DataSetInfoNode from '../dialogs/DatasetInfo/DatasetInfoNode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'
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
  const [params,setParams] = useState({});

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


  useEffect(()=>{
    setParams(data.config);
  },[])


  return (
    <div style={{  borderRadius:"5%",padding:"10px" , border:"1px solid blue", backgroundColor:"#e0e9ff" , minHeight:"150px"}}> 
     
      <div>
        <div className='base-node-header'>
            <FontAwesomeIcon icon={faFile} /> Loader
        </div>
        <div className='base-node-info-section'>
            <div className='base-node-info-section-container node-content-container'>    
              {
                Object.entries(params).map(([key, value]) => {
                  console.log(key,value);
                  if(value == "unique_selection"){  
                    return (
                  <div class="dropdown-container node-element">
                       <label for="columns" className="dropdown-label exporter-font-color node-element-input-tag">{key}:</label>
                     <select id="columns" className="dropdown-select export-dropdown-style input-element-node">
                       <option value="1">One Column</option>
                       <option value="2">Two Columns</option>
                       <option value="3">Three Columns</option>
                     </select>
                   </div>
                    );
                  } else if(value == "multiple_selection"){


                  } else if(value == "number"){
                      return(
                      <div className="node-element">
                        <label for="numberInput" className="number-input-tag node-element-input-tag">Enter a Number:</label>
                        <input type="number"  id="numberInput" className="input-element-node" name="numberInput"/>
                      </div>
                      );
                  } else if(value == "text-field"){

                  }
                })
              }
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
        isConnectable={isConnectable}
      />
      {selectDataDialog && <DataSelectDialog  open={selectDataDialog} handleClose={handleDataSelectDialogClose} />}
      {datasetInfoNodeDialog && <DataSetInfoNode open={datasetInfoNodeDialog} handleClose={()=>{handleDataInfoDialogNodeClose()}}></DataSetInfoNode>}
    </div>
  );
});

import React, {useEffect, useRef, useState} from "react";
import Flow from "./Flow";
import styles from './DataProcessing.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCirclePlay, faCircleStop, faSpinner, faTrash} from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux/es/hooks/useSelector";
import LeftMenu from "./LeftMenu";
import {BLOCK_STATUS, FETCH_PIPELINE_RUN_DATA, FETCH_PIPELINES, RUN_PIPELINE} from "../../utils/apiEndpoints";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
import {setIsDataFetching} from "../../reducers/nodeSlice";

function DataProcessing() {

  const constant_value_imputation_columns = useSelector((state)=>state.constant_value_imputation_columns);
  const constant_value_imputation_values = useSelector((state)=>state.constant_value_imputation_values)
  const pipelineNodes = useSelector((state)=>state.orderedNodes);
  const pipelineName = useSelector((state) => state.selectedPipelineName);
  const selectedDataset = useSelector((state)=> state.selectedDataset);
  const selectedDataFeaturingColumns = useSelector((state)=> state.selectedDataFeaturingColumns);
  const normalizationColumns = useSelector((state)=> state.normalizationColumns);
  const standardizationColumns = useSelector((state)=> state.standardizationColumns);
  const imputationAlgs = useSelector((state)=> state.imputationAlgs);
  const circles = document.querySelectorAll(".circle"),
  progressBars = document.querySelectorAll("#indicators");
  const [isPipelineStarted, setIsPipelineStarted] = useState(false);
  const [pipelineFinished, setPipelineFinished] = useState(false);
  const [runData, setRunData] = useState(null);
  const [loading, setLoading] = useState(false);


  const blockAlert = (msg)=>{
    toast.error(msg,{
      duration:2000,
      position:'top-right',
    })
  };

  const markStepCompleted = (index) => {
      circles[index].style.backgroundColor = "green";
      circles[index].style.color = "white";
      if (index <= progressBars.length - 1) {
          progressBars[index].style.backgroundColor = "green";
      }
  }

  const markStepFailed = (index) => {
      circles[index].style.backgroundColor = "red";
      circles[index].style.color = "white";
      if (index <= progressBars.length - 1) {
          progressBars[index].style.backgroundColor = "red";
      }
  }

  const markStepInitial = (index) => {
      circles[index].style.backgroundColor = "white";
      circles[index].style.color = "#999999";
      if (index <= progressBars.length - 1) {
          progressBars[index].style.backgroundColor = "#e0e0e0";
      }
  }

  const handleStop = () => {
      setPipelineFinished(false);
      for (let i = 0; i < circles.length; i++) {
        markStepInitial(i);
      }
  }

  const startPipeline = async ()=>{
      if(pipelineNodes.length < 2){
        blockAlert("The pipeline does not meet the requirements!");
        return;
      }

      if (runData === null) {
          blockAlert("Run Data didn't load correctly!");
          return;
      }

      setLoading(true);
      try {
          const response = await axios({
              method: "POST",
              url: RUN_PIPELINE,
              headers: {
                  "Content-Type": "application/json"
              },
              data: {
                  "run_id": runData.run_id,
                  "token": runData.token,
                  "variables": {
                      "1": 2
                  }
              }
          })

          await new Promise(resolve => setTimeout(resolve, 5000));

          setLoading(false);
      } catch (e) {
          setLoading(false);
          blockAlert("Error starting the pipeline!");
          return;
      }
      setIsPipelineStarted(true);

      for (let i = 0; i < pipelineNodes.length; i++) {
          try {
              const response = await axios({
                  method: "GET",
                  url: BLOCK_STATUS(runData.run_id, pipelineNodes[i]),
                  timeout: 1000 * 60 * 60 * 4
              })
              markStepCompleted(i);
          } catch (e) {
              markStepFailed(i);
              blockAlert("Pipeline failed to finish!");
              for (let j = i; j < pipelineNodes.length; j++) {
                  markStepFailed(j);
              }
              break;
          }
      }

      setIsPipelineStarted(false);
      setPipelineFinished(true);
  }

    useEffect(() => {
        if (pipelineName.length > 0) {
            axios({
                method: "GET",
                url: FETCH_PIPELINE_RUN_DATA(pipelineName[0])
            }).then((response) => {
                setRunData(response.data);
            }).catch((error) => {
                blockAlert("Error loading pipeline run data!");
            })
        }
    }, [pipelineName]);


    return (
      <div style={{ height: '100%' }}>        
        <div className="flow-container">
            <div className="container">
              {loading ? <div className="pipeline-controller pipeline-loading">
                <p className="play-btn"><FontAwesomeIcon icon={faSpinner} spin /></p>
                <p>Starting Pipeline...</p>
              </div>
               : isPipelineStarted ?
                      <div className="pipeline-controller pipeline-started">
                          <p className="play-btn"><FontAwesomeIcon icon={faCircleStop} /></p>
                          <p>Running...</p>
                      </div> : pipelineFinished ?
                          <div className="pipeline-controller pipeline-started">
                              <p className="play-btn" onClick={handleStop}><FontAwesomeIcon icon={faTrash} /></p>
                              <p>Clear Run</p>
                          </div>
                          :
            <div className="pipeline-controller">
               <p className="play-btn" onClick={startPipeline}><FontAwesomeIcon icon={faCirclePlay} /></p>
               <p>Start Pipeline</p>
             </div>
             }

              <div className="steps">
                  {pipelineNodes.map((data, index) => (
                      <div key={index} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <span className="circle">{index + 1}</span>
                          {index === pipelineNodes.length - 1 ? "" : <span className="progress-bar" id="indicators" style={{ width: 100 }}></span>}
                      </div>
                  ))}
              </div>
            </div>
            <Toaster/>
             <LeftMenu/>
             <Flow/> 
        </div>
      </div>
    );
  }
  
  export default DataProcessing;
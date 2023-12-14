import React, { useEffect, useState } from "react";
import Flow from "./Flow";
import styles from './DataProcessing.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faCircleStop } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux/es/hooks/useSelector";
import LeftMenu from "./LeftMenu";
import { FETCH_PIPELINES } from "../../utils/apiEndpoints";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";

function DataProcessing() {

  const constant_value_imputation_columns = useSelector((state)=>state.constant_value_imputation_columns);
  const constant_value_imputation_values = useSelector((state)=>state.constant_value_imputation_values)
  const pipelineNodes = useSelector((state)=>state.orderedNodes);
  const pipelineEdges = useSelector((state)=>state.edges);
  const selectedDataset = useSelector((state)=> state.selectedDataset);
  const selectedDataFeaturingColumns = useSelector((state)=> state.selectedDataFeaturingColumns);
  const normalizationColumns = useSelector((state)=> state.normalizationColumns);
  const standardizationColumns = useSelector((state)=> state.standardizationColumns);
  const imputationAlgs = useSelector((state)=> state.imputationAlgs);
  const circles = document.querySelectorAll(".circle"),
  progressBars = document.querySelectorAll("#indicators");
  const [isPipelineStarted, setIsPipelineStarted] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const resetSteps = () => {
    circles.forEach((circle)=>{
      circle.classList.remove("active");
    })
    //progressBar.style.width = "0%";
    setCurrentStep(0);
  } 

  const colorCircleForNextStep = ()=>{
    circles.forEach((circle, index) => {
      circle.classList[`${index < currentStep ? "add" : "remove"}`]("active");
    });
  }

  const updateSteps = () => {
    setCurrentStep(currentStep + 1);
    //progressBar.style.width = `${((currentStep - 1) / (circles.length - 1)) * 100}%`;
  };

  const blockAlert = (msg)=>{
    toast.error(msg,{
      duration:2000,
      position:'top-right',
    })
  }
  const startPipelineAndMakeRequests = ()=>{

      if(pipelineNodes.length < 2){
        blockAlert("The pipeline does not meet the requirements!");
        return;
      }

      setIsPipelineStarted(true);

      console.log(circles);

  }

 

    return (
      <div style={{ height: '100%' }}>        
        <div className="flow-container">
            <div className="container">
              {isPipelineStarted ? <div className="pipeline-controller pipeline-started">
                <p className="play-btn" onClick={()=>{setIsPipelineStarted(false)}}><FontAwesomeIcon icon={faCircleStop} /></p>
                <p>Running...</p>
              </div>
               : 
            <div className="pipeline-controller">
               <p className="play-btn" onClick={()=>{startPipelineAndMakeRequests()}}><FontAwesomeIcon icon={faCirclePlay} /></p>
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
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
  
  const mage_ai_oauth_key = useSelector((state)=>state.mageAIOauthToken);
  const constant_value_imputation_columns = useSelector((state)=>state.constant_value_imputation_columns);
  const constant_value_imputation_values = useSelector((state)=>state.constant_value_imputation_values)
  const pipelineNodes = useSelector((state)=>state.mappedNodes);
  const pipelineEdges = useSelector((state)=>state.edges);
  const selectedDataset = useSelector((state)=> state.selectedDataset);
  const selectedDataFeaturingColumns = useSelector((state)=> state.selectedDataFeaturingColumns);
  const normalizationColumns = useSelector((state)=> state.normalizationColumns);
  const standardizationColumns = useSelector((state)=> state.standardizationColumns);
  const imputationAlgs = useSelector((state)=> state.imputationAlgs);
  const circles = document.querySelectorAll(".circle"),
  progressBar = document.querySelector(".indicator");
  const [isPipelineStarted, setIsPipelineStarted] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState([]);


  let currentStep = 1;
  const resetSteps = () => {
    circles.forEach((circle)=>{
      circle.classList.remove("active");
    })
    progressBar.style.width = "0%";
    currentStep = 0;
  } 

  const colorCircleForNextStep = ()=>{
    circles.forEach((circle, index) => {
      circle.classList[`${index < currentStep ? "add" : "remove"}`]("active");
    });
  }

  const updateSteps = () => {
    currentStep++;
    progressBar.style.width = `${((currentStep - 1) / (circles.length - 1)) * 100}%`;
  };

  const blockAlert = (msg)=>{
    toast.error(msg,{
      duration:2000,
      position:'top-right',
    })
  }

  const searchInNextNode = (source, vector)=>{
    for(const elem of vector){
      if(elem.source == source)
          return elem.target;
    }
     return null;
  }

  const makeRequestForPipeline = (operationsList)=>{
    const datasetSignature = selectedDataset[0].database_name;
    const requestObject = {
      dataset_name: "heart_failure",
      operations:[...operationsList]
    }
      // axios.post(START_PIPELINE,requestObject).then((resp)=>{console.log(resp.data)}).catch(err => console.log(err));
  }

  const startPipelineAndMakeRequests = ()=>{
     
      const isDatasetBlock = pipelineNodes.find(nd => nd.id === "node-1");
      if(!isDatasetBlock){
        blockAlert("The pipeline does not meet the requirements!");
        return;
      }
      if(pipelineNodes.length == 1){
        blockAlert("The pipeline does not meet the requirements!");
        return;
      }
      if(pipelineEdges.length == 0){
        blockAlert("The pipeline does not meet the requirements!");
        return;
      }
      setIsPipelineStarted(true);
      const orderOfOperations = []; 
      let resultSearch = 'node-1';
      orderOfOperations.push(resultSearch);
      while(resultSearch != null){
        resultSearch = searchInNextNode(resultSearch,pipelineEdges);
        if(resultSearch != null){
          orderOfOperations.push(resultSearch);
        }
      }

      const operationsList = [];
      let operationObj;
      for(const operation of orderOfOperations){
        if(operation == "node-2" && selectedDataFeaturingColumns.length!=0){
          operationObj = {
            operation_name:"Data featuring",
            columns:[...selectedDataFeaturingColumns]
          }
          operationsList.push(operationObj);
        } else if(operation == "node-3"){

          if(normalizationColumns.length !=0){
            operationObj = {
            operation_name:"Normalization",
            columns:[...normalizationColumns]
          }
          operationsList.push(operationObj);
         } 
         if(standardizationColumns.length !=0 ){
            operationObj = {
              operation_name:"Standardization",
              columns:[...standardizationColumns]
            }
            operationsList.push(operationObj);
         }

        } else if(operation == "node-4"){
          if(imputationAlgs[0] == "KNN Imputation") {
              operationObj = {
                operation_name:"Data imputation",
                knn_imputation:true
              }
            operationsList.push(operationObj);
          } else if(imputationAlgs[0] == "Constant Value Imputation"){
            operationObj = {
              operation_name:"Data imputation",
              constant_value_imputation_columns:[...constant_value_imputation_columns],
              constant_value_imputation_values:[...constant_value_imputation_values]
            }
          operationsList.push(operationObj);

          } 
        }
      }
  }


    return (
      <div style={{ height: '100%' }}>        
        <div className="flow-container">
            <div class="container">
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
                <span className="circle">1</span>
                <span className="circle">2</span>
                <span className="circle">3</span>
                <div className="progress-bar">
                  <span className="indicator" style={{width:"0%",marginLeft:"-200px"}}></span>
                </div>
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
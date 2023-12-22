import React, { useEffect, useRef, useState } from "react";
import Flow from "./Flow";
import styles from './DataProcessing.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux/es/hooks/useSelector";
import LeftMenu from "./LeftMenu";
import { BLOCK_STATUS, FETCH_PIPELINE_RUN_DATA,  RUN_PIPELINE } from "../../utils/apiEndpoints";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";


function DataProcessing() {

    const pipelineNodes = useSelector((state) => state.orderedNodes);
    const pipelineName = useSelector((state) => state.selectedPipelineName);
    const blockVariables = useSelector((state) => state.blocksVariables);
    const circles = document.querySelectorAll(".circle"),
        progressBars = document.querySelectorAll("#indicators");
    const [isPipelineStarted, setIsPipelineStarted] = useState(false);
    const [pipelineFinished, setPipelineFinished] = useState(false);
    const [runData, setRunData] = useState(null);
    const [loading, setLoading] = useState(false);


    const blockAlert = (msg) => {
        toast.error(msg, {
            duration: 2000,
            position: 'top-right',
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

    const startPipeline = async () => {
        if (pipelineNodes.length < 2) {
            blockAlert("The pipeline does not meet the requirements!");
            return;
        }

        if (runData === null) {
            blockAlert("Run Data didn't load correctly!");
            return;
        }

        setLoading(true);
        try {
            const variables = {}
            for (let block of blockVariables) {
                variables[block.variable_name] = block.value;
            }
            const response = await axios({
                method: "POST",
                url: RUN_PIPELINE,
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    "run_id": runData.run_id,
                    "token": runData.token,
                    "variables": variables
                }
            })

            setLoading(false);
        } catch (e) {
            setLoading(false);
            blockAlert("Error starting the pipeline!");
            return;
        }
        setIsPipelineStarted(true);

        for (let i = 0; i < pipelineNodes.length; i++) {
            const makeAPIRequest = async (node) => {
                return new Promise((resolve) => {
                    const retry = async () => {
                        try {
                            const response = await axios({
                                method: 'GET',
                                url: BLOCK_STATUS(runData.run_id, node),
                            });

                            const data = response.data;

                            if (["completed", "failed", "cancelled", "upstream_failed"].includes(data)) {
                                console.log('Satisfactory response received:', data);
                                resolve(data);
                            } else {
                                console.log('Unsatisfactory response:', data);
                                setTimeout(retry, 2000);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            setTimeout(retry, 2000);
                        }
                    };
                    retry();
                });
            };

            const node = pipelineNodes[i]
            const result = await makeAPIRequest(node);
            console.log("Block status: ", result);

            if (result === "completed") {
                markStepCompleted(i);
            } else {
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
                url: FETCH_PIPELINE_RUN_DATA(pipelineName)
            }).then((response) => {
                setRunData(response.data);
            }).catch((error) => {
                blockAlert("Error loading pipeline run data!");
            })
        }
    }, [pipelineName]);

    const calculateProgressBarWidth = (totalCircles, circleWidth) => {
        if(totalCircles < 5){
            circleWidth = 40;
        } else {
            circleWidth = 30;
        }
        
        const fixedCircleWidth = circleWidth || 20;
        const totalWidth = totalCircles * fixedCircleWidth;
        const progressBarWidth = (totalWidth / totalCircles) * (totalCircles - 1);
        return progressBarWidth;
    };

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
                            <div key={index} style={{ maxWidth: 100, display: "flex", flexDirection: "row", alignItems: "center" }}>
                                <span className="circle">{index + 1}</span>
                                {index === pipelineNodes.length - 1 ? "" : (
                                    <span
                                        className="progress-bar"
                                        id="indicators"
                                        style={{ width: `${calculateProgressBarWidth(pipelineNodes.length, 40)}px` }}
                                    ></span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <Toaster />
                <LeftMenu />
                <Flow />
            </div>
        </div>
    );
}

export default DataProcessing;
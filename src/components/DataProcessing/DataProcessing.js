import React, { useEffect, useRef, useState } from "react";
import style from "../DataProcessing/DataProcessing.css";
import { useSelector } from "react-redux/es/hooks/useSelector";
import LeftMenu from "../LeftMenu/LeftMenu";
import toast, { Toaster } from 'react-hot-toast';
import {createTheme, styled} from '@mui/material/styles';
import {FETCH_PIPELINE_RUN_DATA,  PIPELINE_STATUS, RUN_PIPELINE} from "../../utils/apiEndpoints";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import axios from "axios";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { PipelineView } from "../PipelineView/PipelineView";
import {setSelectedTab, setSelectedView} from "../../reducers/nodeSlice";
import {useDispatch} from 'react-redux';

function DataProcessing() {

    const dispatch = useDispatch();
    const storedSelectedTab = useSelector((state) => state.selectedTab);
    const selectedPipelineNamePrediction  = useSelector((state)=>state.selectedPipelineNamePrediction);
    const selectedPipelineNameDataPreprocessing = useSelector((state)=>state.selectedPipelineNameDataPreprocessing);
    const selectedPipelineNameTrain = useSelector((state)=> state.selectedPipelineNameTrain);
    const [selectedTab, setSelectedTabHere] = useState('1');
    const isRun = useRef(false);
    const handleChangeTab = (event, newValue) => {
      setSelectedTabHere(newValue);
      dispatch(setSelectedView(newValue));
    };

    useEffect(()=>{
        if(storedSelectedTab["changed"] === true){
            dispatch(setSelectedTab({"changed": false, "tabSelected": storedSelectedTab["tabSelected"]}));
            setSelectedTabHere(storedSelectedTab["tabSelected"]);
        }
    },[storedSelectedTab])

    useEffect(()=>{
        dispatch(setSelectedView([1]));
    },[])
 
    return ( 
        <div style={{ height: '100%' }}>
            <TabContext value={selectedTab} className="tabs-container">
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginLeft:"250px" }}>
                                <TabList onChange={handleChangeTab} aria-label="lab API tabs example">
                                    <Tab label={<div className="tab-name"> <p>pre-processing </p>   {selectedPipelineNameDataPreprocessing.length !== 0 && <p class="blue-dot"></p>} </div>} value="1" />
                                    <Tab label={<div className="tab-name"> <p>Training Pipeline </p> {selectedPipelineNameTrain.length !== 0 && <p class="blue-dot"></p>}</div>} value="2" />
                                    <Tab label={<div className="tab-name"> <p>Predict </p>  {selectedPipelineNamePrediction.length !== 0 && <p class="blue-dot"></p>}</div>} value="3" />
                                </TabList>
                            </Box>
                <TabPanel value="1" sx={{padding:"0px"}}>  
                    <PipelineView pipelineType="data_preprocessing"/>
                </TabPanel>
                <TabPanel value="2" sx={{padding:"0px"}}>
                    <PipelineView pipelineType="training"/>
                </TabPanel>
                <TabPanel value="3" sx={{padding:"0px"}}>
                    <PipelineView pipelineType="prediction"/>
                </TabPanel>
            </TabContext>
            <LeftMenu />
        </div>
    );
}

export default DataProcessing;
import React, { useEffect, useRef, useState } from "react";
import "../DataProcessing/DataProcessing.css"; // Fixed: remove unused 'style' if not a CSS module
import { useSelector, useDispatch } from "react-redux";
import LeftMenu from "../LeftMenu/LeftMenu";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { PipelineView } from "../PipelineView/PipelineView";
import { setSelectedView, setBlocksVariables } from "../../reducers/nodeSlice";
import { Button } from "@mui/material";
import { setAllTabs, setTabIndex } from "../../reducers/nodeSlice";
import AreYouSure from "./dialogs/AreYouSure/AreYouSure";
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';

function DataProcessing({ logout }) {
  const dispatch = useDispatch();
  const allTabsStored = useSelector((state) => state.allTabs);
  const blocksVariablesStored = useSelector((state)=> state.blocksVariables);
  const selectedTabStored = useSelector((state)=>state.selectedTab);
  const tabIndexes = useSelector((state)=>state.tabIndex);
  const [selectedTab, setSelectedTabHere] = useState("");
  const [tabPipeline, setTabPipeline] = useState("");
  const [areYouSureOpen, setAreYouSureOpen] = useState(false);
  
 

  const handleChangeTab = (event, newValue) => {
    setSelectedTabHere(newValue);
    dispatch(setSelectedView(newValue));
  };

  const deletePipelineVariables = ()=>{
    
  }

  const closeTab = (tabInfo)=>{
    const fullTabInfo = allTabsStored.find(item=>item.name === tabInfo);

    const newTabIndexes = tabIndexes.filter( tab => tab !== fullTabInfo.tabOrder);
    dispatch(setTabIndex(newTabIndexes));
    const newTabArr = allTabsStored.filter(item=>item.name !== tabInfo);
    const newVariables = blocksVariablesStored.filter(item=>  item.tabName !== fullTabInfo.name);
    
    sessionStorage.removeItem(`${fullTabInfo.tabOrder}-${tabPipeline}-runData`);
    sessionStorage.removeItem(`${fullTabInfo.tabOrder}-${tabPipeline}-running-steps`);
    dispatch(setBlocksVariables(newVariables));

    dispatch(setAllTabs(newTabArr));
    if(newTabArr.length > 0){
      setSelectedTabHere(newTabArr[0]);
      dispatch(setSelectedView(newTabArr[0]));
    } else {
      dispatch(setTabIndex(null));
    }
    
  }


  useEffect(()=>{
    setSelectedTabHere(selectedTabStored.tabSelected);
  },[selectedTabStored])
  
  return (
    <div style={{ height: '100%' }}>
      <TabContext value={selectedTab} className="tabs-container">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', marginLeft: "250px" }}>
          <TabList onChange={handleChangeTab} aria-label="lab API tabs example">
            {allTabsStored && allTabsStored.map((tabData) => (
              <Tab
                key={tabData.name}
                label={<div className="tab-name">
                    <p className="tab-name">{tabData.name}</p>
                    <Button className="close-tab-btn" onClick={()=>{setAreYouSureOpen(true); setTabPipeline(tabData.pipelineName); }}>x</Button>
                </div>}
                value={tabData.name}
              />
            ))}
          </TabList>
        </Box>

        {allTabsStored.length == 0 && 
          <div>
            <div className="no-pipeline-open-text-container">
                <AutoAwesomeMosaicIcon style={{ fontSize: '60px' }}/>
                <div>To view a pipeline head to the Pipelines menu</div>
                <div>and select one</div>
            </div>
              
          </div>
        }
        
        {allTabsStored && allTabsStored.map((tabData, index) => (
          <TabPanel value={tabData.name} sx={{ padding: "0px" }} key={index}>
            <PipelineView
              pipelineType={tabData.pipelineType}
              pipelineName={tabData.pipelineName}
              tabName={tabData.name}
              tabOrder={tabData.tabOrder}
            />
          </TabPanel>
        ))}
      </TabContext>
      { areYouSureOpen && <AreYouSure open={areYouSureOpen} isDialogCustom={true} customMessage={`Are you sure you want to close the tab with ${tabPipeline} ?`} handleClose={()=>{setAreYouSureOpen(false)}} handleAction={()=>{closeTab(selectedTab)}} />}
      <LeftMenu /> 
    </div>
  );
}

export default DataProcessing;

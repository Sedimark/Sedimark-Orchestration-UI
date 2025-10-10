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
import { setAllTabs, setTabIndex, setModelVersionStored } from "../../reducers/nodeSlice";
import AreYouSure from "./dialogs/AreYouSure/AreYouSure";
import LinkIcon from '@mui/icons-material/Link';
import { truncateString } from "../../utils/truncateString";
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import Stack from "../../utils/stack";
    

function DataProcessing({ logout }) {
  const dispatch = useDispatch();
  const allTabsStored = useSelector((state) => state.allTabs);
  const blocksVariablesStored = useSelector((state)=> state.blocksVariables);
  const selectedTabStored = useSelector((state)=>state.selectedTab);
  const linkedTabToDelete = useSelector((state)=>state.linkedTabToDelete);
  const tabIndexes = useSelector((state)=>state.tabIndex);
  const [selectedTab, setSelectedTabHere] = useState("");
  const [tabPipeline, setTabPipeline] = useState("");
  const [areYouSureOpen, setAreYouSureOpen] = useState(false);
  
 

  const handleChangeTab = (event, newValue) => {
    setSelectedTabHere(newValue);
    dispatch(setSelectedView(newValue));
  };

  const fetchTabInfo = (tabInfo)=>{
    const fullTabInfo = allTabsStored.find(item=>item.name === tabInfo);
    return fullTabInfo;
  }
  
  const closeTab = (tabInfo)=>{
  
    const fullTabInfo = fetchTabInfo(tabInfo);
    
    // here we check if there is any pipeline who has 
    // as parentPipeline the pipeline to be deleted
    // and if so we delete the other pipelines too
    let pipeTabToDeleteName = fullTabInfo["pipelineName"];

    // implemented stack to push all the tabs that needs to be deleted and then
    //pop them off as we are proceeding with deletion
    
    const tabsStack = new Stack();
    
    tabsStack.push(fullTabInfo);
    // the parent pipeline may be linked to other pipelines
    // if we have the case with pipeline linked and we want to delete
    // the linked pipelines too such that for this we are searching
    // for those kind of pipelines and we want to have everything deleted

    // find multiple pipes here
    for(const tabPipe of allTabsStored){
      if (tabPipe["parentPipeline"] == pipeTabToDeleteName ) {
        tabsStack.push(fetchTabInfo(tabPipe["name"]));
      }
    }

    

    // pop tabIndexes of the shelf

    let intermediateTabIndexes = tabIndexes ;
    let intermediateallTabsStored = allTabsStored;
    let intermediatenewVariables = blocksVariablesStored;
 
    // tabInfo - nume tab
    let currTab;

    while (!tabsStack.isEmpty()) {
    // we pop items off the Stack   

    currTab = tabsStack.pop();

    intermediateTabIndexes = intermediateTabIndexes.filter( tab => tab !== currTab.tabOrder);
    intermediateallTabsStored = intermediateallTabsStored.filter(item=>item.name !== currTab.name);
    intermediatenewVariables = intermediatenewVariables.filter(item=>  item.tabName !== currTab.name);
    
  }
  
    sessionStorage.removeItem(`${fullTabInfo.tabOrder}-${tabPipeline}-runData`);
    sessionStorage.removeItem(`${fullTabInfo.tabOrder}-${tabPipeline}-running-steps`);
    

    dispatch(setBlocksVariables(intermediatenewVariables));
    dispatch(setAllTabs(intermediateallTabsStored));
    dispatch(setTabIndex(intermediateTabIndexes));

    if(intermediateallTabsStored.length > 0){
      setSelectedTabHere(intermediateallTabsStored[0]);
      dispatch(setSelectedView(intermediateallTabsStored[0]));
    } else {
      dispatch(setTabIndex(null));
    }
    
    dispatch(setModelVersionStored({}));

  }

  useEffect(()=>{
    setSelectedTabHere(selectedTabStored.tabSelected);
  },[selectedTabStored])


  useEffect(()=>{
    // this use effect has the purpose of deleting a chained tab
    if(linkedTabToDelete && linkedTabToDelete.length !== 0){
      closeTab(linkedTabToDelete);
    }
  },[linkedTabToDelete])


  
  return (
    <div style={{ height: '100%' }}>
      <TabContext value={selectedTab} className="tabs-container">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', marginLeft: "250px" }}>
          <TabList onChange={handleChangeTab} aria-label="lab API tabs example">
            {allTabsStored && allTabsStored.map((tabData) => (
              <Tab
                key={tabData.name}
                label={<div className="tab-name">
                   <>
                      { tabData.isChained && <LinkIcon/> }  
                        <p className="tab-name">{truncateString(tabData.name,30)}</p>
                       { !tabData.isChained &&  <Button className="close-tab-btn" onClick={()=>{setAreYouSureOpen(true); setTabPipeline(tabData.pipelineName); }}>x</Button> }
                   </>
                  
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
              isChained={tabData.isChained}
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

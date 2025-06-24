import {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EntityView from '../EntityView/EntityView';
import {BROKER_GET_ASSET_TYPES, BROKER_GET_ENTITY_TYPES, FETCH_PIPELINE_DATA} from "../../../../utils/apiEndpoints";
import {setAllTabs,  setTabIndex, setPipelinesBlocks, setSelectedTab, setBlocksVariables } from "../../../../reducers/nodeSlice";
import { faArrowLeft, faBoxOpen, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { truncateString } from '../../../../utils/truncateString';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {checkAndFormat} from "../../../../utils/checkAndFormat";
import toast from 'react-hot-toast';
import axios from 'axios';
import style from "./AssetManager.css";
import { useDispatch, useSelector } from 'react-redux';

 
export default function AssetManager(props) {
 

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const dispatch = useDispatch();
  const storedVariables = useSelector((state)=>state.blocksVariables);
  const allTabs = useSelector((state)=> state.allTabs);
  const tabIndexStored = useSelector((state)=> state.tabIndex);
  const storedPipelineBlocks = useSelector((state)=> state.pipelinesBlocks);
  const [typesMenu, setTypesMenu] = useState(true);
  const [allTypes, setAllTypes] = useState([]);
  const [entitiesList, setEntitiesList] = useState([]);
  const [entityDetails, setEntityDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [wasError, setWasError] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [entityViewOpen, setEntityViewOpen] = useState(false);

  const blockAlert = (msg) => {
      toast.error(msg, {
          duration: 2000,
          position: 'top-right',
      })
  };
  

  const pipelineSpawningToast = () =>{
      toast('A pipeline is being rendered...', {
      icon: '👷',
      duration: 2000,
      position:'top-right',
      style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
    },
    });

  }
  
  const fetchAllTypes = async()=>{
    
    setLoading(true);
    setWasError(false);
    
    try{
      const resp = await axios.get(BROKER_GET_ENTITY_TYPES);   
      setAllTypes(resp.data.typeList);
      
    } catch(err){
      console.log(err);
      setAllTypes([]);
      setWasError(true);
      blockAlert("There was an error while fetching the types!");
    }

    setLoading(false);
  }

  const resetAndMoveToNextView = ()=>{
    setWasError(false);
    setTypesMenu(false);
    
  }

  const fetchEntitiesRequest = async(typeSelected)=>{
    
    if(entitiesList.length!=0){
      resetAndMoveToNextView();
      return;
    }
    setLoading(true);
    try{
      const resp = await axios.get(BROKER_GET_ASSET_TYPES(typeSelected));   
      setEntitiesList(resp.data.map((ent)=> ent.id));
    
    } catch(err){
      console.log(err);
      setWasError(true);
      setEntitiesList([]);
      blockAlert("There was an error while fetching the types!");
    }
    
    
    setLoading(false);
    resetAndMoveToNextView();
   
  }


  useEffect(() => {
    fetchAllTypes();
}, []);

 
 // create pipeline from asset
 // aici ce ai de facut este ca trebuie sa spawnezi anomaly annotator
 // deci de investigat sa vezi pentru anomaly annotator concret ce cod este executat
 // apoi pentru anomaly annotator sa pui fain frumos acolo o variabila care sa fie variabila de aici atat

const fetchAndSaveBlockNames = async(pipeline_name , newTabName )=>{
    
      let pipeline_blocks;
      
      try{
        const resp = await axios.get(FETCH_PIPELINE_DATA(pipeline_name));

        pipeline_blocks = resp.data.pipeline.blocks;

      } catch(err){
        console.log(err);
      }
 

      let blocksInfoObj ;
      if(storedPipelineBlocks){
        blocksInfoObj = {...storedPipelineBlocks };
      } else { 
        blocksInfoObj = {};
      }

      for(const block of pipeline_blocks){
        blocksInfoObj[checkAndFormat(block.name)] = {
          "pipeline_name": pipeline_name,
          "tabName": newTabName
        }
      }

    
      dispatch(setPipelinesBlocks(blocksInfoObj));
   }

 
 const spawnPipeline = async(entity)=>{
  // numele la pipeline este anomaly_annotator
  pipelineSpawningToast()
  props.handleClose();
  const filteredVariables = [];  

    for(const variable of storedVariables){
      if( variable["pipelineName"] && variable["pipelineName"][0] !== pipeline){
          filteredVariables.push(variable);
      }
    }


  const pipeline = "anomaly_annotator";

   let newTabs = [];
  
      if(allTabs){
        newTabs = [...allTabs];
      }
        let newTabName;
        if(!tabIndexStored || tabIndexStored.length == 0){
          newTabName = `Tab 1`;
          dispatch(setTabIndex([1]));
          newTabs.push({
            "name":newTabName,
            "pipelineName": pipeline,
            "pipelineType": "data_preprocessing",
            "tabOrder":1
          });
  
        } else {
          newTabName = `Tab ${tabIndexStored[tabIndexStored.length-1]+1}`;
          newTabs.push({
            "name":newTabName,
            "pipelineName": pipeline,
            "pipelineType": "data_preprocessing",
            "tabOrder":tabIndexStored[tabIndexStored.length-1]+1
          });
          const newTabArr = [...tabIndexStored];
          newTabArr.push(tabIndexStored[tabIndexStored.length-1]+1);
          dispatch(setTabIndex(newTabArr));
        } 
        
        await fetchAndSaveBlockNames(pipeline , newTabName);
  
  
        dispatch(setAllTabs(newTabs));
  
        setTimeout(()=>{
          dispatch(setSelectedTab({"changed":true, tabSelected:newTabName}));
        },100)
        
        filteredVariables[filteredVariables.length] = {
                "block_name": "Broker Loader",
                "variable_name": "entity_id",
                "value": "urn:ngsi-ld:WeatherInformation:Forecasted:Hourly:France:Les_Orres",
                "nodeId": "broker_loader",
                "pipelineName": "anomaly_annotator",
                "tabName": newTabName
        };
        
        dispatch(setBlocksVariables(filteredVariables));

 }



  useEffect(() => {
    let timeoutId;
   
    if (loading) {
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, 100); // Delay of 300ms
    } else {
      setShowLoader(false);
    }
    
    return () => {
      clearTimeout(timeoutId);
    }
    
  }, [loading]);

  return (
     
    <ThemeProvider theme={darkTheme}>
                    <Dialog
                    open={props.open}
                    onClose={props.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description" 
                    maxWidth="md" 
                    fullWidth={true}
                >
 
                <DialogTitle id="alert-dialog-title">
                    {!typesMenu && <span><FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{setTypesMenu(true)}} className="left-icon-studio"/></span> }
                    <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                
                 {
                  typesMenu ?
                  <div className='menu-pipelines'>
                    {showLoader?
                     <div className="loading-circle-container" style={{marginTop:"20px"}}>
                          <div className="loading-circle"></div>
                          <p className="loading-text" style={{marginLeft:"45%", marginTop:"10px"}}>Loading...</p>
                      </div>
                    :
                    <>
                      {
                        wasError ?
                          <>  
                              <div>
                                <FontAwesomeIcon icon={faCircleXmark} style={{color:"red"}}  className="no-templates-icon"/>
                                <div className='no-templates-message'>There was an error while fetching the types!</div>
                              </div>   
                          </>
                        :
                        <>
                              {
                               allTypes && allTypes.length === 0 && !loading ?
                                <div>
                                    <FontAwesomeIcon icon={faBoxOpen}  className="no-templates-icon"/>
                                    <div className='no-templates-message'>There are no types available!</div>
                                </div>

                                :

                                <>
                                      {allTypes.map((type)=>{
                                        return(<div className='menu-pipelines-item'> {type} <div> <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{ fetchEntitiesRequest(type); }}> View Entities </Button></div></div>)
                                    })}
                                </>
                              }

                        </>
                          
                      }

                    </>
                  }

                    </div>
                    :
                    <div className='menu-pipelines'>
                          { showLoader?
                                <div className="loading-circle-container" style={{marginTop:"20px"}}>
                                      <div className="loading-circle"></div>
                                      <p className="loading-text" style={{marginLeft:"45%", marginTop:"10px"}}>Loading...</p>
                                  </div>
                                :
                                <>
                                  {
                                    wasError ?
                                      <>  
                                          <div>
                                            <FontAwesomeIcon icon={faCircleXmark} style={{color:"red"}}  className="no-templates-icon"/>
                                            <div className='no-templates-message'>There was an error while fetching the types!</div>
                                          </div>   
                                      </>
                                    :
                                    <>
                                          {
                                            entitiesList.length === 0 ?
                                            <div>
                                                <FontAwesomeIcon icon={faBoxOpen}  className="no-templates-icon"/>
                                                <div className='no-templates-message'>There are no types available!</div>
                                            </div>

                                            :

                                            <>
                                                  {entitiesList.map((entity)=>{
                                                    return(<div className='entity-item'> <div className='entity-item-text'>{truncateString(entity,40)}</div> <div> <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{setTypesMenu(false); setEntityViewOpen(true); setEntityDetails(entity)}}> Details </Button><Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{setTypesMenu(false); spawnPipeline(entity)}}> Create Pipeline </Button></div></div>)
                                                })}
                                            </>
                                          }

                                    </> 
                                      
                                  }

                                </>
                              }
                    </div>
                 }

                { entityViewOpen && <EntityView entityDetails={entityDetails} open={entityViewOpen} onClose={()=>{setEntityViewOpen(false)}}></EntityView> }

                </DialogContentText>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </ThemeProvider>

        
    );

}

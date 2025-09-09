import {useState, useEffect} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {GET_MODELS, BROKER_GET_ASSET_TYPES, BROKER_GET_ENTITY_TYPES, FETCH_PIPELINE_DATA} from "../../../../utils/apiEndpoints";
import {setAllTabs,  setTabIndex, setPipelinesBlocks, setSelectedTab, setBlocksVariables } from "../../../../reducers/nodeSlice";
import { faArrowLeft, faBoxOpen, faCircleXmark, faTag } from '@fortawesome/free-solid-svg-icons';
import { truncateString } from '../../../../utils/truncateString';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {checkAndFormat} from "../../../../utils/checkAndFormat";
import toast from 'react-hot-toast';
import axios from 'axios';
import style from "./AssetManager.css";
import { useDispatch, useSelector } from 'react-redux';

// sub components import
import TypesList from './components/TypesList';
import EntitiesList from './components/EntitiesList'; 
import PreSelectMenu from './components/PreSelectMenu';
import ModelsList from './components/ModelsList';
import EntityView from './components/EntityView/EntityView';
import Loading from './components/Loading';

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
  const [menuName, setMenuName] = useState("");
  const [fullModelsList, setFullModelsList] = useState([]);
  const [currentView, setCurrentView] = useState("preSelect");

  const blockAlert = (msg) => {
      toast.error(msg, {
          duration: 2000,
          position: 'top-right',
      })
  };

  const fetchModels = async()=>{

    setWasError(false);
    setLoading(true);
    try{
      const resp = await axios.get(GET_MODELS);
      setFullModelsList(resp.data);
      setLoading(false);
    } catch(err){
      blockAlert("There was an error while fetching the models!");
      setLoading(false);
      setWasError(true);
      console.log(err);
    }
 }
  

  const fetchAllTypes = async()=>{
    
    setLoading(true);
    setWasError(false);
  
    try{
      const resp = await axios.get(BROKER_GET_ENTITY_TYPES);
      const filteredTypes =  resp.data.typeList.filter((type) => type!=="WorkflowAsset" && type !== "Service");
      setAllTypes(filteredTypes);
      
    } catch(err){
      console.log(err);
      setAllTypes([]);
      setWasError(true);
      blockAlert("There was an error while fetching the types!");
    }

    setLoading(false);
  }
  

  const renderContent = () =>{

    // facem aici handling la partea de loading
    if(loading){
      return(
        <Loading/>
      );

    }

    // in the future o sa facem handling la partea de error tot asa
    // doar ca cu mesaje custom

     switch (currentView) {
      case 'preSelect':
        
        return (
          <PreSelectMenu
            selectView = {setCurrentView}
            fetchModels = {fetchModels}
            fetchAllTypes = {fetchAllTypes}
            fetchEntitiesRequest = {fetchEntitiesRequest}
            setMenuName = {setMenuName}
          />
        );
      case 'models':
        
        return (
          <ModelsList
            fullModelsList={fullModelsList}
            isLoading={loading}
            hasError={wasError}
          />
        );
      case 'types':
        
        return (
          <TypesList
            allTypes={allTypes}
            fetchEntitiesRequest={fetchEntitiesRequest}
            isLoading={loading}
            hasError={wasError}
            onSelectType={fetchEntitiesRequest}
            truncateString={truncateString}
            setCurrentView={setCurrentView}
          />
        );
      case 'entities':
        return (
          <EntitiesList
            entitiesList={entitiesList}
            isLoading={loading}
            hasError={wasError}
            onSelectEntity={""}
            truncateString={truncateString}
            setEntityDetails={setEntityDetails}
            setCurrentView={setCurrentView}
            setEntityViewOpen={setEntityViewOpen}
          />
        );
    
      default:
        return (
          <PreSelectMenu
            onSelectModels={"fetchModelsAndRenderMenu"}
            onSelectData={fetchAllTypes}
            onSelectWorkflows={fetchAllTypes}
          />
        );
    }
  }

 

  const resetAndMoveToNextView = ()=>{
    // possible BUG cause

    setWasError(false);
    setTypesMenu(false);
    
  }

  const fetchEntitiesRequest = async(typeSelected)=>{
    
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

  useEffect(() => {
    let timeoutId;
   
    if (loading) {
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, 100); 
    } else {
      setShowLoader(false);
    }
    
    return () => {
      clearTimeout(timeoutId);
    }
    
  }, [loading])

  
  return(

        <ThemeProvider theme={darkTheme}>
            <Dialog
              open={props.open}
              onClose={props.handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description" 
              maxWidth="md" 
              fullWidth={true}
            >

                    {
                        currentView !== "preSelect" &&
                            <div className="asset-manager-back" style={{marginBottom:"10px"}}>
                                <FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{
                                    setCurrentView("preSelect");
                                    setMenuName("");                      
                                }}
                                  className="left-icon-studio"/>
                            </div>
                    }

                    <DialogContent>
                      {currentView === "preSelect" && <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div> } 
                      <DialogContentText id="alert-dialog-description">
                        <div className='menu-name-container'>
                            {menuName}
                        </div>  
                         {renderContent()}
                      </DialogContentText>
                    </DialogContent>

                </Dialog>

          </ThemeProvider>
  );
}

//   return (
     
//     <ThemeProvider theme={darkTheme}>
//                     <Dialog
//                     open={props.open}
//                     onClose={props.handleClose}
//                     aria-labelledby="alert-dialog-title"
//                     aria-describedby="alert-dialog-description" 
//                     maxWidth="md" 
//                     fullWidth={true}
//                 >
 
//                 <DialogTitle id="alert-dialog-title">
                    
                   
//                     <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
//                       {
//                         !preSelectMenu &&
//                           <div className="left-back-icon asset-manager-back">
//                                  <FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{
//                                                             setPreSelectMenu(true);
//                                                             setModelsMenu(false);
//                                                             setTypesMenu(false);
//                                                             setLoading(false);
                                                               
//                                           }} className="left-icon-studio"/>
//                           </div>   
//                       }
                        
//                 </DialogTitle>
//                 <DialogContent>
//                 <DialogContentText id="alert-dialog-description">
//                      <div className='assets-title-spacing'> My Assets</div>

//                 {
//                     preSelectMenu ?
//                     <div className='menu-pipelines'>
//                         <div className="type-of-asset-btns" style={{paddingTop:"20px" , paddingBottom:"20px"}}>
//                             <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px", width:"150px", marginLeft: '40%'}} onClick={()=>{ fetchModelsAndRenderMenu() }}> Models </Button>
//                             <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px", width:"150px", marginLeft: '40%', marginTop: '20px'}} onClick={()=>{ fetchAllTypes(); setPreSelectMenu(false); setModelsMenu(false); }}>  Data </Button>
//                             <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px", width:"150px", marginLeft: '40%', marginTop: '20px'}} onClick={()=>{ fetchAllTypes(); setPreSelectMenu(false); setModelsMenu(false); }}>  Workflows </Button>
//                         </div>
//                     </div>
                    
//                     :

//                     <>
//                       {
//                         modelsMenu ?
//                             <div className='menu-pipelines'>
//                                  { showLoader ?
//                                         <div className="loading-circle-container" style={{marginTop:"20px"}}>
//                                             <div className="loading-circle"></div>
//                                             <p className="loading-text" style={{marginLeft:"45%", marginBottom:"70px"}}>Loading...</p>
//                                         </div>
//                                                   :
//                                         <div className="simple-models-list-wrapper">
//                                           <div className="models-list-title">Models List</div>
//                                               <div className="model-assets-grid"> {/* Changed to grid for better layout */}
//                                                 {fullModelsList.map((model) => {
//                                                   return (
//                                                     <div key={model.id} className="model-asset-container">
//                                                       {/* Added a Font Awesome icon for visual interest */}
//                                                       <FontAwesomeIcon icon={faTag} className="model-icon" />
//                                                       <span className="model-name-text">{model.name}</span>
//                                                     </div>
//                                                   );
//                                                 })}
//                                                 {/* Optional: Add a message if the list is empty */}
//                                                 {fullModelsList.length === 0 && (
//                                                     <p className="no-models-message">No models available.</p>
//                                                 )}
//                                               </div>
//                                       </div>
//                                   }

//                             </div>
//                           :
//                             <>
//                               {
//                                   typesMenu ?
//                                   <div className='menu-pipelines'>
//                                     {showLoader?
//                                     <div className="loading-circle-container" style={{marginTop:"20px"}}>
//                                           <div className="loading-circle"></div>
//                                           <p className="loading-text" style={{marginLeft:"45%", marginTop:"10px"}}>Loading...</p>
//                                       </div>
//                                     :
//                                     <>
//                                       {
//                                         wasError ?
//                                           <>  
//                                               <div>
//                                                 <FontAwesomeIcon icon={faCircleXmark} style={{color:"red"}}  className="no-templates-icon"/>
//                                                 <div className='no-templates-message'>There was an error while fetching the types!</div>
//                                               </div>   
//                                           </>
//                                         :
//                                         <>
//                                               {
//                                                   allTypes && allTypes.length === 0 && !loading ?
//                                                 <div>
//                                                     <FontAwesomeIcon icon={faBoxOpen}  className="no-templates-icon"/>
//                                                     <div className='no-templates-message'>There are no types available!</div>
//                                                 </div>

//                                                 :

//                                                 <>
//                                                       {allTypes.map((type)=>{
//                                                         return(<div className='menu-pipelines-item' title={type}> {truncateString(type,31)} <div> <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{  fetchEntitiesRequest(type) }}> View Entities </Button></div></div>)
//                                                     })}
//                                                 </>
//                                               }

//                                         </>
                                          
//                                       }

//                                     </>
//                                   }

//                                     </div>
//                                     :
//                                     <div className='menu-pipelines'>
//                                           { showLoader ?
//                                                 <div className="loading-circle-container" style={{marginTop:"20px"}}>
//                                                       <div className="loading-circle"></div>
//                                                       <p className="loading-text" style={{marginLeft:"45%", marginTop:"10px"}}>Loading...</p>
//                                                   </div>
//                                                 :
//                                                 <>
//                                                   {
//                                                     wasError ?
//                                                       <>  
//                                                           <div>
//                                                             <FontAwesomeIcon icon={faCircleXmark} style={{color:"red"}}  className="no-templates-icon"/>
//                                                             <div className='no-templates-message'>There was an error while fetching the types!</div>
//                                                           </div>   
//                                                       </>
//                                                     :
//                                                     <>
//                                                           {
//                                                             entitiesList &&  entitiesList.length === 0 ?
//                                                             <div>
//                                                                 <FontAwesomeIcon icon={faBoxOpen}  className="no-templates-icon"/>
//                                                                 <div className='no-templates-message'>There are no types available!</div>
//                                                             </div>

//                                                             :

//                                                             <div className='my-assets-list'>
//                                                                   { entitiesList && entitiesList.map((entity)=>{
//                                                                     return(<div className='entity-item'> <div className='entity-item-text' title={entity}>{truncateString(entity,60)}</div> <div> <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{setTypesMenu(false); setEntityViewOpen(true); setEntityDetails(entity)}}> Details </Button>
//                                                                         </div>
//                                                                     </div>
//                                                                     )
//                                                                 })}
//                                                             </div>
//                                                           }

//                                                     </> 
                                                      
//                                                   }

//                                                 </>
//                                               }
//                                     </div>
//                                 }
//                             </>                  
//                       }
                       
//                     </>

//                 }
                

//                 { entityViewOpen && <EntityView entityDetails={entityDetails} open={entityViewOpen} onClose={()=>{setEntityViewOpen(false)}}></EntityView> }
//                 {workflowMenu}
                

//                 </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                 </DialogActions>
//             </Dialog>
//         </ThemeProvider>

        
//     );

// }

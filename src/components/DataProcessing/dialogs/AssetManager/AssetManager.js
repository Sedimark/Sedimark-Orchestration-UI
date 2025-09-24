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

    if(loading){
      return(
        <Loading/>
      );

    }

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

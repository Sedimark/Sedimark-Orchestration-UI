import {useState, useEffect, useRef} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EntityView from '../EntityView/EntityView';
import {BROKER_GET_ASSET_TYPES, BROKER_GET_ENTITY_TYPES} from "../../../../utils/apiEndpoints";
import { faArrowLeft, faBoxOpen, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { truncateString } from '../../../../utils/truncateString';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import style from "./AssetManager.css";


export default function AssetManager(props) {
 

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const navigate = useNavigate();
  const isFirstRender = useRef(true);
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
                                                    return(<div className='entity-item'> <div className='entity-item-text'>{truncateString(entity,40)}</div> <div> <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{setTypesMenu(false); setEntityViewOpen(true); setEntityDetails(entity)}}> Details </Button><Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{setTypesMenu(false);}}> Create Pipeline </Button></div></div>)
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

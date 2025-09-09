import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import {BROKER_GET_ENTITIES_BY_ID} from "../../../../../../utils/apiEndpoints";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faBoxOpen, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import ControlledEditor from '@monaco-editor/react';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function EntityView(props) {


  const darkTheme = createTheme({
     palette: {
       mode: 'dark',
     },
   });

    const [loading, setLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [entityInfo, setEntityInfo] = useState("");
    const [editorValue, setEditorValue] = useState("");
    const [wasError, setWasError] = useState(false);
    const [defaultEditorValue, setDefaultEditorValue] = useState("");

    const blockSuccess = (msg) => {
        toast.success(msg, {
            duration: 2000,
            position: 'top-right',
        })
    }; 

    const blockAlert = (msg) => {
        toast.error(msg, {
            duration: 4000,
            position: 'top-right',
        })
    };

    const handleCopy = () => {

        navigator.clipboard
          .writeText(entityInfo)
          .then(() => {
            blockSuccess("Copied to clipboard!");
          })
          .catch((err) => {
            blockAlert("Failed to copy");
            console.err(err);
          });
      };

      const fetchEntityDetailsRequest = async()=>{

        if(entityInfo.length !== 0){
          return;
        }

        setLoading(true);
        setWasError(false);

        try{
          const resp = await axios.get(BROKER_GET_ENTITIES_BY_ID(props.entityDetails));   
          setEntityInfo(JSON.stringify(resp.data, null, 2));
          setEditorValue(JSON.stringify(resp.data, null, 2));
          setDefaultEditorValue(JSON.stringify(resp.data, null, 2));
        } catch(err){
          console.log(err);
          setWasError(true);
          blockAlert("There was an error while fetching the types!");
        }
    
        setTimeout(()=>{
          setLoading(false);
        },800);
      }


    useEffect(()=>{
        fetchEntityDetailsRequest();
    },[])

    useEffect(() => {
        let timeoutId;
        
        if (loading) {
          timeoutId = setTimeout(() => {
            setShowLoader(true);
          }, 1); // Delay of 300ms
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
            maxWidth="lg" fullWidth={true}
        >
            <DialogTitle id="alert-dialog-title">
                {"Entity Details"}
            </DialogTitle>
            <DialogContent sx={{ width: '95%', m:"auto", bgcolor: 'background.paper', marginTop:"10px" , borderRadius:"2px"}}>
                <DialogContentText id="alert-dialog-description">
                </DialogContentText>


                {
                    showLoader ?
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
                                    <div className='no-templates-message'>There was an error while fetching the entity's information!</div>
                                </div>   
                            </>
                            :
                            <>
                                {
                                    entityInfo && Object.entries(entityInfo).length === 0 ?
                                    <div>
                                        <FontAwesomeIcon icon={faBoxOpen}  className="no-templates-icon"/>
                                        <div className='no-templates-message'>There is no info related to the entity!</div>
                                    </div>

                                    :

                                    <div className='code-editor-container'> 
                                            <div className="code-editor-dialog-controls">
                                                <Button variant='contained' color="error"  onClick={()=>{props.onClose()}}>Close</Button>
                                                <Button variant='contained' onClick={()=>{handleCopy()}}>Copy  code</Button>
                                            </div>
                                    
                                            <ControlledEditor options={{
                                                    readOnly: true, // Set the editor to read-only mode
                                                    minimap: { enabled: false },
                                                    scrollBeyondLastLine: false,
                                                    contextmenu: false
                                                }} height="60vh" className='code-editor' defaultLanguage="json" editable={false}  theme="vs-dark" value={editorValue} onChange={()=>{setEditorValue(defaultEditorValue)}} />
                
                                     </div>
                                }

                            </>
                            
                        }

                        </>
                  }


                

                </DialogContent>
            <DialogActions>
            <Button onClick={props.onClose}>OK</Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

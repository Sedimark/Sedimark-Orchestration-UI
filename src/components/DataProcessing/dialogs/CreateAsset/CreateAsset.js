import {useState, useEffect} from "react";
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ControlledEditor from '@monaco-editor/react';
import { validateNgsiLdString } from "../../../../utils/ngsiLdValidate";
import { CREATE_ASSET } from "../../../../utils/apiEndpoints";
import style from "./CreateAsset.css";
import toast from 'react-hot-toast';
import { Block } from "@mui/icons-material";
import axios from 'axios';

export default function CreateAsset(props) {
 const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const [editorValue, setEditorValue] = useState();
  const handleEditorChange = (val)=>{
    setEditorValue(val);
  }

    const blockAlert = (msg) => {
        toast.error(msg, {
            duration: 4000,
            position: 'top-right',
        })
    };

    const blockSuccess = (msg) => {
    toast.success(msg, {
        duration: 2000,
        position: 'top-right',
    })
  };
  
  const validateAssetObject = async()=>{

     const result = validateNgsiLdString(editorValue);
  
      if (result.isValid) {
        //result.asset contains the asset
        try{
          const resp = axios.post(CREATE_ASSET,result.asset);
          blockSuccess("Asset was created successfully!");

        } catch(err){
          blockAlert("There was an error while posting the asset!");
        }

        //post the asset to the broker
      } else {
        //display error message
        blockAlert(result.error);
      }

      props.handleClose()
  }



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
 
                <DialogTitle id="alert-dialog-title">
                    
                    <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                
                    <div>
                      Create an asset by providing the ngsild object below:
                    </div>

                      <ControlledEditor
                        options={{
                            readOnly: false, // Set to false to make it editable
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            contextmenu: true // Enable context menu for editing
                        }}
                        height="60vh"
                        className='code-editor'
                        defaultLanguage="json"
                        theme="vs-dark"
                        value={editorValue}
                        onChange={handleEditorChange}
                    />
                   <Button variant='contained' color='primary'   sx={{ 
                      marginTop: '20px',
                      marginLeft: '45%',
                    }}  onClick={()=>{validateAssetObject()}}>
                       Create 
                    </Button>
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
  )


}
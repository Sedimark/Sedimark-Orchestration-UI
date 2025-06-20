import {useState, useEffect} from "react";
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { validateNgsiLdString } from "../../../../utils/ngsiLdValidate";
import { CREATE_ASSET } from "../../../../utils/apiEndpoints";
import { FormBuilder } from "./FormBuilder";
import style from "./CreateAsset.css";
import toast from 'react-hot-toast';
import axios from 'axios';

export default function CreateAsset(props) {
 const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const [editorValue, setEditorValue] = useState();
  const [asset, setAsset] = useState({});
  const [formDisplay, setFormDisplay] = useState(false);
  const formFields = [

  { name: "title", label: "Titlu", type: "string" },
  { name: "tags", label: "Cuvinte cheie", type: "keywords" },
  { name: "startDate", label: "Data început", type: "date" }

  ]

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
  
  const postAssetObject = async()=>{

    try{
      const resp = axios.post(CREATE_ASSET,asset);
      blockSuccess("Asset was created successfully!");

    } catch(err){
      blockAlert("There was an error while posting the asset!");
    }

      props.handleClose()
  }

  const generateAndDisplayForm = ()=>{
    setFormDisplay(true);
    //here we generate the form based on what is the requirement
  }

   const handleSubmit = ()=>{
     console.log("Form data:", data);
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

              {
                  formDisplay ?
                  <div>
                      <FormBuilder fields={formFields} onSubmit={handleFormSubmit}/>
                  </div>
                  :
                  <>
                    <div className="select-asset-type">Select what kind of asset you want to create:</div>

                        <div className="type-of-asset-btns">
                            <Button variant='contained' color='primary'   sx={{ 
                              marginTop: '',
                              marginLeft: '45%',
                              width:"150px"
                            }}  onClick={()=>{generateAndDisplayForm()}}>
                              Workflow  
                            </Button>
                            <Button variant='contained' color='primary'   sx={{ 
                              marginTop: '10px',
                              marginLeft: '45%',
                              width:"150px"
                            }}  onClick={()=>{generateAndDisplayForm()}}>
                              Data  
                            </Button>
                            <Button variant='contained' color='primary'   sx={{ 
                              marginTop: '10px',
                              marginLeft: '45%',
                              width:"150px"
                            }}  onClick={()=>{generateAndDisplayForm()}}>
                              AI Model  
                            </Button>
                            <Button variant='contained' color='primary'   sx={{ 
                              marginTop: '10px',
                              marginLeft: '45%',
                              width:"150px"
                            }}  onClick={()=>{generateAndDisplayForm()}}>
                              Service  
                            </Button>
                      </div>
                  </>
              }

                </DialogContentText>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
  )


}
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
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder } from "./FormBuilder";
import {
  formSchemaWorkflowAsset,
  serviceAsset,
  dataAsset,
  AIModelAsset
} from "../../../../utils/assetTypes";
import {transformFormDataToNgsiLdAsset} from "../../../../utils/createNGSILDAsset.js"
import { transformFormDataToNgsiLdWorkflowAsset } from "../../../../utils/createNGILDAssetWorkflow.js";
import { transformFormDataToNgsiLdAIModelAsset } from "../../../../utils/createNGSILDAIModel.js";
import style from "./CreateAsset.css";
import toast from 'react-hot-toast';
import axios from 'axios';
import { SelectAsset } from "./SelectAsset";

export default function CreateAsset(props) {
 const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const [editorValue, setEditorValue] = useState();
  const [asset, setAsset] = useState({});
  const [formDisplay, setFormDisplay] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState("");
  const [selectActualAsset, setSelectActualAsset] = useState(false);
  const [assetOfType, setAssetOfType] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(false);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;


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
  
  const postAssetObject = async(asset)=>{

    try{
      const resp = axios.post(CREATE_ASSET,asset);
      blockSuccess("Asset was created successfully!");

    } catch(err){
      blockAlert("There was an error while posting the asset!");
    }

    setTimeout(()=>{
      props.handleClose();
    },1500)
      
  }

  const getSchemaBasedOffAsset = ()=> {

    switch(selectedAssetType){
      case "workflow":
        return formSchemaWorkflowAsset;
      case "data":
        return dataAsset;
      case "AIModel":
        return AIModelAsset;
      case "service" :
        return serviceAsset

    }
  }


  const generateAndDisplayForm = (assetType)=>{
    setSelectedAssetType(assetType);
    setFormDisplay(true);
    setSelectActualAsset(false);
  }

   const handleSubmit = (data) => {

    let finalNGSILDAsset;
    switch(selectedAssetType){
      case "workflow":
        finalNGSILDAsset = transformFormDataToNgsiLdAsset(data);
        break;
      case "data":
        finalNGSILDAsset = transformFormDataToNgsiLdWorkflowAsset(data);
        break;
      case "AIModel":
        finalNGSILDAsset = transformFormDataToNgsiLdWorkflowAsset(data);
        break;
    }

    postAssetObject(finalNGSILDAsset);

  };



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
                  {formDisplay &&
                      <div className="left-back-icon">
                          <FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{setFormDisplay(false)}} className="left-icon-studio"/>
                      </div>    
                  }
                        
                    <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
                </DialogTitle>
                <DialogContent 
                    sx={{
                        
                      display: "flex",
                      flexDirection: "column",
                    }}
                 >
                <DialogContentText id="alert-dialog-description" >

              {
                  formDisplay ?

                      <>
                      {selectActualAsset ?

                          <div className="asset-type-select-btn" style={{marginTop:"20px"}}>
                             <SelectAsset assetType={assetOfType}  setSelectedAsset={setSelectedAsset} generateAndDisplayForm={generateAndDisplayForm} selectActualAsset={setSelectActualAsset}/>
                          </div>

                            :

                          <div className="form-container-dialog-inside">
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                  <FormBuilder fields={getSchemaBasedOffAsset()} onSubmit={handleSubmit} />
                              </LocalizationProvider>
                              
                          </div>
                        }
                      </>
                
                   :

                  <div className="asset-type-select-btn"> 
                    <div className="select-asset-type">Select what kind of asset you want to create:</div>

                        <div className="type-of-asset-btns">
                            <Button variant='contained' color='primary'   sx={{ 
                              marginTop: '',
                              marginLeft: '45%',
                              width:"150px"
                            }}  onClick={()=>{setSelectActualAsset(true); setFormDisplay(true); setAssetOfType("workflow");  }}>
                              Workflow  
                            </Button>
                            <Button variant='contained' color='primary'   sx={{ 
                              marginTop: '10px',
                              marginLeft: '45%',
                              width:"150px"
                            }}  onClick={()=>{ setSelectActualAsset(true); setFormDisplay(true); setAssetOfType("data");}}>
                              Data  
                            </Button>
                            <Button variant='contained' color='primary'   sx={{ 
                              marginTop: '10px',
                              marginLeft: '45%',
                              width:"150px"
                            }}  onClick={()=>{ setSelectActualAsset(true); setFormDisplay(true); setAssetOfType("AIModel"); } }>
                              AI Model  
                            </Button>
                            
                      </div>
                  </div>
              }

                </DialogContentText>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
  )


}
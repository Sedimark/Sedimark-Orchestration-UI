import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { faDownload ,faWarning} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector} from 'react-redux';
import axios from 'axios';
import { EXPORT_PIPELINE_MAGE } from '../../../../utils/apiEndpoints';
import toast from 'react-hot-toast';
import style from "./ExporterDialog.css";

export default function ExporterDialog(props) {


  const createdPipelineName = useSelector((state)=> state.pipelineStudioPipelineName);
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const blockAlert = (msg) => {
    toast.error(msg, {
        duration: 2000,
        position: 'top-right',
    })
};
    
  const downloadTheZip = async()=>{
    blockNotify();
    
      try{
        const data = await axios.get(EXPORT_PIPELINE_MAGE(createdPipelineName),{responseType:"arraybuffer"});
        console.log("data:");
        console.log(data);
        const url = window.URL.createObjectURL(new Blob([data], { type: "application/zip" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${createdPipelineName}.zip`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } catch(err){
        blockAlert("There was a problem in getting the zip!");
        console.log(err);
      }
  }

  function base64ToBlob(base64, mime) {
    const bytes = atob(base64);
    const ab = new ArrayBuffer(bytes.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) {
      ia[i] = bytes.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
  }
  
  // Function to download the zip file
  function downloadZipFileFromBase64(base64String) {
    const mimeType = 'application/zip'; // MIME type for zip files
    const blob = base64ToBlob(base64String, mimeType);
    const blobUrl = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'downloadedFile.zip'; // Filename for the download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl); // Clean up the URL object
    
  }

  const blockNotify = ()=>{
    toast.success("The download will start soon");
  }

  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth="sm"
            maxWidth="sm"
        >
            <DialogTitle id="alert-dialog-title">
            {"Export"}
              <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
            </DialogTitle>
              
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
               {
                 createdPipelineName.length != 0 ?
                 <div className='pipeline-exporter-menu'>
                  <div>
                    Pipeline Name: <span className='pipeline-export-pipeline-name'>{createdPipelineName}</span>
                  </div>
                  <Button outlined variant='contained' className='download-btn-exporter' sx={{marginTop:"40px", marginLeft:"30%"}} onClick={()=>{downloadTheZip()}} >Download zip <FontAwesomeIcon icon={faDownload} className='download-icon'/></Button>
               </div> : 
               <div className='pipeline-not-saved-message'>
                  <FontAwesomeIcon icon={faWarning} className='pipeline-not-saved-message-icon'/> You haven't saved this pipeline 
               </div>
               }
               
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

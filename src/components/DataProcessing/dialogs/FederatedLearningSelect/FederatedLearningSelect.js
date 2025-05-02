import * as React from 'react';
import { useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeletePipeline from '../DeletePipeline/DeletePipeline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ChangePipelineName from '../ChangePipelineName/ChangePipelineName';
import { faTrash, faPen, faArrowUpRightFromSquare,faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ExportPipeline from '../ExportPipeline/ExportPipeline';
import style from "./FederatedLearningSelect.css";

export default function FederatedLearningSelect(props) {

  const [initialMenu, setInitialMenu] = useState(true);
  const [deleteMenu, setDeleteMenu] = useState(false);
  const [editMenu, setEditMenu] = useState(false);
  const [exportMenuCWL, setExportMenuCWL] = useState(false);
  const [exportMenuMage, setExportMenuMage] = useState(false);
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


  const resetToInitialMenu = ()=>{
    setInitialMenu(true);
    setDeleteMenu(false);
    setEditMenu(false);
    setExportMenuCWL(false);
    setExportMenuMage(false);
  }

  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth="lg"
            maxWidth="lg"
        >
            <DialogTitle id="alert-dialog-title">
            {!initialMenu && 
            <div className="left-back-icon">
                      <FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{resetToInitialMenu()}} className="left-icon-pipeline-manager"/>
            </div> 
            }
            { initialMenu &&   <span>Pipeline Manager</span>}
             <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {
                initialMenu && 
                <div className='initial-menu-pipeline-manager'>
                  <Button onClick={()=>{setInitialMenu(false); setDeleteMenu(true)}} sx={{backgroundColor:"#d32f2f", width:"20%", padding:"10px",color:"#fff", fontWeight:"bold", margin:"auto", mt:"10px", mb:"10px",'&:hover': {
                    backgroundColor: '#f58e84', // Background color on hover
                    color: 'white', // Text color on hover
                  } }} className='button-shadow'> Delete <FontAwesomeIcon icon={faTrash} className='pipeline-manager-initial-screen-button-icon'/>  
                  </Button>
                   
                  <Button onClick={()=>{setInitialMenu(false); setEditMenu(true);}} sx={{backgroundColor:"#2e7d32", width:"20%", padding:"10px",color:"#fff", fontWeight:"bold", margin:"auto", mt:"10px", mb:"10px", 
                    '&:hover': {
                    backgroundColor: '#719170', // Background color on hover
                    color: 'white', // Text color on hover
                  } 
                  }} className='button-shadow'>Edit <FontAwesomeIcon icon={faPen} style={{"marginLeft":"30px"}} className='pipeline-manager-initial-screen-button-icon'
                   
                   />  </Button>
                  <Button onClick={()=>{setInitialMenu(false); setExportMenuCWL(true);}} sx={{backgroundColor:"#635bfc", width:"20%", padding:"10px",color:"#fff", fontWeight:"bold", margin:"auto", mt:"10px", mb:"10px", '&:hover': {
                    backgroundColor: '#908bfc', // Background color on hover
                    color: 'white', // Text color on hover
                  }}} className='button-shadow'>Export to CWL <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='pipeline-manager-initial-screen-button-icon' style={{"marginLeft":"35px"}} /> </Button>

                  <Button onClick={()=>{setInitialMenu(false); setExportMenuMage(true);}} sx={{backgroundColor:"#9c27b0", width:"20%", padding:"10px",color:"#fff", fontWeight:"bold", margin:"auto", mt:"10px", mb:"10px", '&:hover': {
                    backgroundColor: '#9e60a8', // Background color on hover
                    color: 'white', // Text color on hover
                  }}} className='button-shadow'>Export to MageAI <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='pipeline-manager-initial-screen-button-icon' /> </Button>

                </div>
              }
              {
                deleteMenu &&  
                  <DeletePipeline /> 
              }
              {
                editMenu && 
                <ChangePipelineName/>
              }
              {
                exportMenuCWL && 
                <ExportPipeline fromMage={false} subMenuName={"Export to CWL"}/>
              }
              {
                exportMenuMage && 
                <ExportPipeline fromMage={true} subMenuName={"Export to MageAI"}/>
              }

            </DialogContentText>
            </DialogContent>
            <DialogActions>
            
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

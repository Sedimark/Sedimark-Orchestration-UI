import * as React from 'react';
import style from "./BlockInfo.css"
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ControlledEditor from '@monaco-editor/react';
import { getCookie } from '../../../../utils/getCookie';
import {faCloudArrowUp} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { capitalizeFirstLetter } from '../../../../utils/capitalizeFirstLetter';
import BlockDescription from '../BlockDescription/BlockDescription';


export default function BlockInfo(props) {

    const [editorValue, setEditorValue] = useState("");
    const [defaultEditorValue, setDefaultEditorValue] = useState("");
    const [blockTemplateMetadata, setBlockTemplateMetadata] = useState({});
    const [isBlockDescriptionOpen, setIsBlockDescriptionOpen] = useState(false);
    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });

      useEffect(()=>{
        setEditorValue(props.fromPipelineStudio.blockCode);
        setDefaultEditorValue(props.fromPipelineStudio.blockCode);
      },[props])

    const saveBlockAsTemplate = ()=>{

      const userId = getCookie("userID");
      const generatedBlockType = props.blockData.fromPipelineStudio.type;
      let parsedGeneratedBlockType = "";
      if(generatedBlockType === "transformer" || generatedBlockType === "loader"){
        parsedGeneratedBlockType = `data_${generatedBlockType}`;
      } else {
        parsedGeneratedBlockType = generatedBlockType;
      }
      const blockMetadata = {
        block_type:generatedBlockType,
        language:"python",
        name: props.blockData.fromPipelineStudio.name,
        description:"",
        user_id:userId,
        code: editorValue
      }
      setBlockTemplateMetadata(blockMetadata);
      setIsBlockDescriptionOpen(true);
    }

  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="md"
            fullWidth="md"
        > 
            <DialogTitle id="alert-dialog-title">
            {"Block Info"}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
               <div> Name: <span className='generated-block-info-name'> {props.fromPipelineStudio.name} </span></div>
               <div> Type:  <span className='generated-block-info-name'> {capitalizeFirstLetter(props.fromPipelineStudio.type)} </span></div>
               <div className='generated-block-info-code-container'>
               <ControlledEditor options={{
                              readOnly: true, // Set the editor to read-only mode
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              contextmenu: false
                    }} height="60vh" className='code-editor' defaultLanguage="python" editable={false}  theme="vs-dark" value={editorValue} onChange={()=>{setEditorValue(defaultEditorValue)}} />
               </div>

               <Button variant='contained' color='primary' title='Saves the block as a template in MageAI' sx={{mt:"20px"}} onClick={()=>{saveBlockAsTemplate()}}> Save as Template  <FontAwesomeIcon icon={faCloudArrowUp}  className='generated-block-actions-icon'/></Button>
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={props.handleClose} autoFocus>
                OK
            </Button>
            </DialogActions>
            {isBlockDescriptionOpen && <BlockDescription handleClose={()=>{setIsBlockDescriptionOpen(false)}} open={isBlockDescriptionOpen} blockTemplateMetadata={blockTemplateMetadata} />}
        </Dialog>
        </ThemeProvider>
    );

}

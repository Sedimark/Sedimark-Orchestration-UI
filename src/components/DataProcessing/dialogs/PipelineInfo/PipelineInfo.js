import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Divider } from '@mui/material';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { truncateString } from '../../../../utils/truncateString';
import style from "./PipelineInfo.css";

export default function PipelineInfo(props) {

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

   const generatedPipelineName = useSelector((state)=> state.pipelineStudioPipelineName);
    const pipelineType = useSelector((state)=> state.pipelineStudioPipelineType);

  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
           fullWidth = "sm"
           maxWidth = "sm"
        > 
          
            <DialogTitle id="alert-dialog-title">
            {"Pipeline info"}
              <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
            </DialogTitle>
              <Divider/>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <div className='pipeline-info-dialog'>
                {generatedPipelineName.length === 0? 
                 <>
                  <FontAwesomeIcon icon={faCircleInfo} className='info-circle-container'/>  <p className='saved-as-text'><span className='pipeline-stored-name-container'> You haven't saved this pipeline yet</span>
                  <br/>
                  <span>Pipeline Type : <span className='pipeline-stored-name-container'>{`${pipelineType}`}</span></span>
                  </p>
                </>
                :     
                <>
                  <FontAwesomeIcon icon={faCircleInfo} className='info-circle-container'/>  <p className='saved-as-text'> Last Saved as: <span className='pipeline-stored-name-container' title={generatedPipelineName} > {truncateString(generatedPipelineName,19)} </span> <br/>
                   <span>Pipeline Type:  <span className='pipeline-stored-name-container'> {`${pipelineType}`} </span> </span>
                  </p>   
                </>
                }
              
              </div>
               
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

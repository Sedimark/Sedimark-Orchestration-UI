import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import formatName from '../../../../utils/formatName';
import { LOGS_FOR_PIPELINE } from '../../../../utils/apiEndpoints';
import {  faScrewdriverWrench, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
import {useDispatch} from 'react-redux';
import axios from 'axios';
import style from "./Logs.css";

export default function Logs(props) {
 
  const dispatch = useDispatch();
  const [fetchedLogs, setFetchedLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emptyList, setEmptyList] = useState(false);
  const [hasError, setHasError] = useState(false);


  const fetchLogsForBlock = async(pipeline_name, block_name)=>{
        try{
            const resp = await axios.get(LOGS_FOR_PIPELINE(pipeline_name, block_name));
            setFetchedLogs(resp.data);
            setIsLoading(false);
        } catch(err){
            setHasError(true);
            setIsLoading(false);
            console.log(err);
        }
  }

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  useEffect(()=>{
    fetchLogsForBlock(props.blockData.config.pipelineName,formatName(props.blockData.name));
  },[props.blockData])

 

  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth={"lg"}
            maxWidth={"lg"}
        > 
            <DialogTitle id="alert-dialog-title">
            {"Logs"}
            </DialogTitle>
            <DialogContent>
                {!isLoading && !hasError && fetchedLogs.length!=0 &&
                    <>
                       <p className='logs-block-name'> {props.blockData.name} </p> 
                        <Box sx={{ height: "120%", width: '100%', margin:"auto",borderRadius:"5px" }}  bgcolor="#000">
                            <div className='main-log-container'>
                                {fetchedLogs.map((elem)=>{
                                        const logLevelClass = elem["Log Level"].toLowerCase(); 
                                        const textLevelClass = `${elem["Log Level"].toLowerCase()}-text-color`;
                                    
                                    return(
                                     <div className={`log-box ${logLevelClass}`}>
                                        <p className={`${textLevelClass}`}>{elem["Log Level"]}</p>
                                        <p>{elem["Timestamp"]}</p>
                                        <p>{elem["Message"]}</p>
                                    </div>
                                );
                                })}
                            </div>
                        </Box>
                    </>
                }
                {
                     !isLoading && !hasError && fetchedLogs.length==0 &&
                     <div className='error-container'>
                        <FontAwesomeIcon icon={faBoxOpen} className='error-msg-big'/>
                        <p className='error-msg-big'>There are no logs for this block</p>
                    </div>  
                }
               
                {
                        isLoading &&
                        <div className="loading-circle-container logs-loader">
                            <div className="loading-circle"></div>
                            <p className="loading-text delete-pipeline-loading-text">Loading...</p>
                        </div>
                }
                {
                    hasError && !isLoading && 
                      <div className='error-container'>
                          <FontAwesomeIcon icon={faScrewdriverWrench} className='error-icon error-msg-big'/>
                          <p className='error-msg-big'>There was an error while fetching the logs.</p>
                          <p className='error-msg-big'>Please try again later!</p>  
                      </div>  
                }
                {

                }
            </DialogContent>
            <DialogActions>
            
            <Button onClick={props.handleClose} autoFocus>
                Close
            </Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

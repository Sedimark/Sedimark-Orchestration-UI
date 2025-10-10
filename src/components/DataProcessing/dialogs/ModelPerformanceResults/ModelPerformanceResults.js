import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBoxOpen} from '@fortawesome/free-solid-svg-icons';
import {GET_METRICS, GET_VERSION} from "../../../../utils/apiEndpoints";
import axios from 'axios';
import style from "./ModelPerformanceResults.css";

export default function ModelPerformanceResults(props) {
 
  const [loading, setLoading] = useState(true);
  const [emptyMetrics, setEmptyMetrics] = useState(false);
  const modelVersion = useSelector((state)=> state.modelVersion);


  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

   let [model1Data, setModel1Data ] = useState({});

  let [model2Data, setModel2Data ]= useState({});


  let [model1Name, setModel1Name] = useState("Model 1");
  let [model2Name, setModel2Name ] = useState("Model 2");
  
  const allKeys = Array.from(new Set([...Object.keys(model1Data), ...Object.keys(model2Data)]));

  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ') 
      .replace(/\b\w/g, (s) => s.toUpperCase()); 
  };

  const blockAlert = (msg) => {
      
        toast.error(msg, {
            duration: 2000,
            position: 'top-right',
        })
    }

  const fetchModelMetrics = async(modelMetrics)=>{

    let modelName = `${Object.keys(modelMetrics)[0]}_pruned`;
    let modelVersion = modelMetrics[modelName];

    // first we fetch all the versions;
    let version = "";

    try{
        const resp = await axios.get(GET_VERSION(modelName));
        console.log(resp.data);
        version = resp.data[0]["version"];

    } catch(err){
        blockAlert("There was an error fetching the models metrics!");
        console.log(err);
        setLoading(false);
        return;
    }

    setModel1Name(`${Object.keys(modelMetrics)[0]} - Initial Model`);
    setModel2Name(`${Object.keys(modelMetrics)[0]} - Prunned`);

    try{

        const resp = await axios.get(GET_METRICS(modelName, version));
        console.log(resp.data);
        let modelData = resp.data;
        let initialModelString = modelData["initial_model"];
        let prunedModelString = modelData["pruned_model"];
        const validJsonInitialModelString = initialModelString.replace(/'/g, '"');
        const validJsonPrunedModelString = prunedModelString.replace(/'/g, '"');
        setModel1Data(JSON.parse(validJsonInitialModelString));
        setModel2Data(JSON.parse(validJsonPrunedModelString));

        setLoading(false);

    } catch(err){
        blockAlert("There was an error fetching the models metrics!");
        console.log(err);
        setLoading(false);
        return;
    }

  }

  useEffect(()=>{
    
    if(Object.keys(modelVersion).length === 0){
        blockAlert("There is no model selected!");
        setLoading(false);
        setEmptyMetrics(true);
    } else {
        fetchModelMetrics(modelVersion);
    }
  },[modelVersion])


 
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
            {"Models metrics"}
            </DialogTitle>
            <DialogContent>
                {
                    loading &&
                    <div className="loading-circle-container" style={{marginTop:"20px"}}>
                        <div className="loading-circle"></div>
                        <p className="loading-text delete-pipeline-loading-text" style={{marginLeft:"46%", marginTop:"20px"}}>Loading...</p>
                    </div>
                }
                { !loading && emptyMetrics &&
                    <div className="no-metrics-container">
                            <FontAwesomeIcon icon={faBoxOpen} className='empty-node-container'/> 
                            <p> There are no metrics </p>
                    </div>
                }

                {!loading && !emptyMetrics && 
                    <TableContainer component={Paper} elevation={3}> 
                        <Table sx={{ minWidth: 650 }} aria-label="model metric comparison table">
                            <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Metric</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{model1Name}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{model2Name}</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {allKeys.length === 0 ? (
                                <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <Typography variant="subtitle1" color="text.secondary">
                                    No metrics to display. Please provide valid JSON data.
                                    </Typography>
                                </TableCell>
                                </TableRow>
                            ) : (
                                allKeys.map((key) => (
                                <TableRow
                                    key={key}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }} 
                                >
                                    <TableCell component="th" scope="row">
                                    {formatKey(key)}
                                    </TableCell>
                                    <TableCell align="right">
                                    
                                    {model1Data[key] !== undefined ? (
                                        model1Data[key]
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">N/A</Typography>
                                    )}
                                    </TableCell>
                                    <TableCell align="right">
                                   
                                    {model2Data[key] !== undefined ? (
                                        model2Data[key]
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">N/A</Typography>
                                    )}
                                    </TableCell>
                                </TableRow>
                                ))
                            )}
                            </TableBody>
                        </Table>
                    </TableContainer>
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

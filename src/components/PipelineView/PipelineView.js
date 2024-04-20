import React, {  useState, useEffect }  from "react";
import { formatString } from "../../utils/formatString";
import {FETCH_PIPELINE_RUN_DATA, PIPELINE_HISTORY, PIPELINE_STATUS, RUN_PIPELINE} from "../../utils/apiEndpoints";
import { useSelector } from "react-redux/es/hooks/useSelector";
import {Step, StepLabel, Stepper } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Table from "@mui/material/Table";
import Paper from "@mui/material/Paper";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AreYouSure from "../DataProcessing/dialogs/AreYouSure/AreYouSure";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import {createTheme, styled} from '@mui/material/styles';
import { faCirclePlay, faSpinner, faTrash, faCircleInfo, faTrashCan, faArrowsRotate, faBroom } from '@fortawesome/free-solid-svg-icons';
import {ThemeProvider} from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import {setSelectedTrainedModel, setIsPredictedSelected} from "../../reducers/nodeSlice";
import Box from '@mui/material/Box';
import Flow from "../Flow/Flow";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from '@mui/material/CircularProgress';


const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        color: 'white',
        maxWidth: 1000,
        boxShadow: theme.shadows[1],
        fontSize: 16, // Custom font size
        padding: '20px 20px', // Custom padding for larger tooltip
    },
}));

export const PipelineView = (props)=>{

    const dispatch = useDispatch();
    const typeForTheModel = useSelector((state)=> state.typeForModel);
    const versionForModel = useSelector((state)=> state.versionForModel);
    const selectedTrainedModel = useSelector((state)=> state.selectedTrainedModel);
    const pipelineNrOfVariables = useSelector((state)=> state.pipelineNrOfVariables)
    const pipelineNodes = useSelector((state) => state.orderedNodes);
    const blockVariables = useSelector((state) => state.blocksVariables);
    const pipelineNameTrain = useSelector((state)=> state.selectedPipelineNameTrain);
    const pipelineNamePreprocessing = useSelector((state)=> state.selectedPipelineDataPreprocessing);
    const selectedPipelineNamePrediction = useSelector((state)=> state.selectedPipelineNamePrediction);
    const pipelinePreProcessing = useSelector((state)=> state.selectedPipelineDataPreprocessing);
    const [isPipelineStarted, setIsPipelineStarted] = useState(false);
    const [runData, setRunData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAreYouSureOpen, setIsAreYouSureOpen] = useState(false);
    const steps = ["started", "running", "finished"];
    const [stepStatus, setStepStatus] = React.useState([true, true, true]);
    const [activeStep, setActiveStep] = React.useState(-1);
    const [open, setOpen] = React.useState(false);
    const [historyData, setHistoryData] = React.useState(null);
    const [historyValue, setHistoryValue] = React.useState(10);
    const [pipelineName, setPipelineName] = React.useState("");
    const [historyLoading, setHistoryLoading] = React.useState(false);
    const [showTooltip, setShowTooltip] = React.useState(false);
    
    const isRun = React.useRef(false);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  
    
    function VariablesForm({ variables }) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {Object.entries(variables).map(([key, value], index) => (
                    <Typography key={index} component="div" variant="body2">
                        <strong>{key}:</strong> {value ? value : "None"}
                    </Typography>
                ))}
            </Box>
        );
    }
      

    const blockAlert = (msg) => {
        toast.error(msg, {
            duration: 2000,
            position: 'top-right',
        })
    };
 
    const retrievePipelineVarCount = (allPipeVars, pipeline_name)=>{
        let varCount;
        
        if(Array.isArray(pipeline_name)){
            pipeline_name = pipeline_name[0];        
        }

        console.log()

        for(const pipe of allPipeVars){
            
            if(pipe["pipeline_name"] === pipeline_name){
                return pipe["number_of_variables"];
            }
        }
        return 0;
    }

    const parseVarsForPipeline = ()=>{    
        const theVars = [];
        for(const blockVar of blockVariables){
           
            if(blockVar["pipelineName"][0] == pipelineName){
                theVars.push(blockVar);
            }
        }

        return theVars;
    }


    const startPipeline = React.useCallback(async () => {

        let nrOfVars = 0;
        
        nrOfVars = retrievePipelineVarCount(pipelineNrOfVariables, pipelineName);        
        const blockVars = parseVarsForPipeline();

        if(blockVars.length !== nrOfVars || (blockVars.length == 0 && nrOfVars!=0)){
            blockAlert("Please enter a value for all the variables!");
            return;
        }

        const variables = {};

        blockVariables.forEach((value) => {
            variables[value["variable_name"]] = value["value"];
        })


        setStepStatus([true, true, true])
        setActiveStep(steps.indexOf("start"));
        try {
            await axios({
                method: "POST",
                url: RUN_PIPELINE,
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    "run_id": runData.id,
                    "token": runData.token,
                    "variables" : variables,
                    "model_type" : typeForTheModel,
                    "model_name" : selectedTrainedModel,
                    "model_version" : versionForModel
                }
            })
            return true;
        } catch(_) {
            blockAlert("Error occurred when starting the pipeline");
            return false;
        }
    }, [setActiveStep, setStepStatus, blockAlert, blockVariables, runData, pipelineNodes]);

    const runStep = React.useCallback( async () => {
        let counter = 0;
        let isResolved = false;
        return new Promise((resolve) => {
            const retry = async () => {
                if (isResolved) return;
                if (counter === 10) {
                    isResolved = true;
                    resolve("failed");
                    return;
                }
                try {
                    const response = await axios({
                        method: 'GET',
                        url: PIPELINE_STATUS(JSON.parse(localStorage.getItem(`${pipelineName}-runData`)).id),
                    });

                    const data = response.data;
                    
                    if (["completed", "failed", "cancelled", "upstream_failed"].includes(data)) {
                        isResolved = true;
                        const toSave = {...JSON.parse(localStorage.getItem(`${pipelineName}-running-steps`)), "isPipelineStarted": false}
                        localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
                        resolve(data);
                    } else {
                        
                        counter += 1;
                        setTimeout(retry, 5000);
                    }
                } catch (error) {
                    setTimeout(retry, 5000);
                }
            };
            retry();
        });
    }, [pipelineName]);

    const callStep = React.useCallback(async () => {
        const result = await runStep();

        setActiveStep(-1);

        const statuses = stepStatus;

        if (result === "completed") {
            steps.forEach((_, index) => {
                statuses[index] = true;
            })
        } else {
            steps.forEach((_, index) => {
                statuses[index] = index !== steps.length - 1;
            })
        }

        setStepStatus(statuses)
        setIsPipelineStarted(false);

        localStorage.removeItem(`${pipelineName}-running-steps`);
    }, [runStep, steps, pipelineName]);

    const runPipeline = React.useCallback(async (source) => {
        if (source === "button") {
            const result = await startPipeline();
              
            
            if (result) {
                setActiveStep(steps.indexOf("running"));
                setIsPipelineStarted(true);
                const toSave = {...JSON.parse(localStorage.getItem(`${pipelineName}-running-steps`)),
                    "activeStep": steps.indexOf("running"), "isPipelineStarted": true};
                
                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));

                await delay(10000);

                callStep().then((_) => {});
            } else {
                setActiveStep(-1);
                setStepStatus((prevState) => {
                    return prevState.map(() => {
                        return false;
                    });
                });
                
            
                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify({
                    "activeStep": -1,
                    "stepStatus": [false, false, false],
                    "isPipelineStarted": false
                }));
            }
        } else {
            callStep().then((_) => {});
        }
    }, [startPipeline, setActiveStep, setStepStatus, pipelineName, steps,
        setIsPipelineStarted, callStep]);

    useEffect(() => {
        if (pipelineName.length > 0) {
            axios({
                method: "GET",
                url: FETCH_PIPELINE_RUN_DATA(pipelineName)
            }).then((response) => {
                setRunData(response.data);
                localStorage.setItem(`${pipelineName}-runData`, JSON.stringify(response.data));
            }).catch((_) => {
                blockAlert("Error loading pipeline run data!");
            })

            if (isRun.current) return;

            isRun.current = true;
            
            let savedState;
           if(Array.isArray(pipelineName)){
            savedState = localStorage.getItem(`${pipelineName[0]}-running-steps`);
           } else {
            savedState = localStorage.getItem(`${pipelineName}-running-steps`);
           }
           
            if (savedState) {
                savedState = JSON.parse(savedState);
                // setStepStatus(savedState.stepStatus);
                setActiveStep(savedState.activeStep);
                setIsPipelineStarted(savedState.isPipelineStarted);
    
                if (savedState.isPipelineStarted) {
                    setTimeout(() => {
                        runPipeline("useEffect").then((_) => {});
                    }, 2000)
                }
            } else {
                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify({
                    "stepStatus": stepStatus,
                    "activeStep": -1,
                    "isPipelineStarted": isPipelineStarted
                }))
            }
        }

    }, [pipelineName]);

  

    const closAreYouSure = ()=>{
        setIsAreYouSureOpen(false);
    }

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            overrides: {
                MuiInputLabel: {
                    root: {
                        color: 'green',
                    },
                },
            },
        }
    });

    const handleClose = () => {
        setOpen(false);
    }

    const handleChange = (e) => {
        setHistoryValue(e.target.value);
    }

    const getHistoryData = async () => {
        setHistoryLoading(true);
        try {
            const response = await axios({
                method: "GET",
                url: PIPELINE_HISTORY(pipelineName, historyValue)
            })

            const result = [];

            for (let entry of response.data) {
                const variables = {}
                Object.entries(entry.variables).forEach(([key, value]) => {
                    if (key !== "execution_partition") {
                        variables[key] = value
                    }
                })
                result.push({...entry, "variables": variables});
            }
            setHistoryLoading(false);
            setHistoryData(result);
        } catch (_) {
            setHistoryLoading(false);
            blockAlert("Error getting the history");
        }
    }

    const selectPipelineBasedOffParameters = (pipelineType)=>{
        if(pipelineType === "training"){
            setPipelineName(pipelineNameTrain);
        } else if (pipelineType === "data_preprocessing"){
            setPipelineName(pipelineNamePreprocessing);
        } else if (pipelineType === "prediction"){
            setPipelineName(selectedPipelineNamePrediction);
        }
    }

    const handleDeleteTheRestData = ()=>{
        if(props.pipelineType === "prediction"){
            dispatch(setSelectedTrainedModel(""));
        }
        
        setIsPipelineStarted(false);
        setActiveStep(-1);
        setStepStatus([true, true,true])
        dispatch(setIsPredictedSelected(false));
    }

    useEffect(()=>{
        selectPipelineBasedOffParameters(props.pipelineType);
        setIsPipelineStarted(false);
        setActiveStep(-1);
        setStepStatus([true, true,true])
    },[pipelineNameTrain, pipelineNamePreprocessing]);
 
    useEffect(()=>{
        
        if(selectedPipelineNamePrediction.length !== 0 && props.pipelineType === "prediction"){
            setPipelineName(selectedPipelineNamePrediction);
        } else if( props.pipelineType === "prediction" ) {
            setPipelineName("");
        }

        setIsPipelineStarted(false);
        setActiveStep(-1);
        setStepStatus([true, true,true])
    },[selectedPipelineNamePrediction]);


  
    return(
        <div>
                    <ThemeProvider theme={darkTheme}>
                            <Dialog open={open} onClose={handleClose} sx={{ display: "flex", flexDirection: "column", alignItems: "space-between", justifyContent: "space-between", color: "white", textAlign:"center", backgroundColor:""}} maxWidth="xll" fullWidth="true" >
                                <Box sx={{ height: "120%", width: '90%', margin:"auto",borderRadius:"5px", marginTop:"40px", marginBottom:"40px", padding:"20px" }}  bgcolor="#000" >
                                
                                    <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <FormControl sx={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth:"1000px", paddingBottom:"20px", paddingTop:"20px" }}>
                                            <Typography variant="p" sx={{ color: "white", textAlign:"center", width:"100%", fontSize:"1.7rem" }}>History Limit</Typography>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                onChange={handleChange}
                                                sx={{ width: 500 }}
                                            >
                                                <MenuItem value={10}>10</MenuItem>
                                                <MenuItem value={15}>15</MenuItem>
                                                <MenuItem value={30}>30</MenuItem>
                                                <MenuItem value={50}>50</MenuItem>
                                                <MenuItem value={100}>100</MenuItem>
                                            </Select>

                                        </FormControl>

                                        <CircularProgress sx={{ color: "white", display: historyLoading ? "block" : "none" }} />

                                        {historyData && (
                                            <TableContainer component={Paper} sx={{ display: historyLoading ? "none" : "block" }}>
                                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                    <TableHead sx={{backgroundColor:"#000", borderBottom:"none"}}>
                                                        <TableRow>
                                                            <TableCell sx={{ fontSize:"1.3rem"}}>Status</TableCell>
                                                            <TableCell align="right" sx={{ fontSize:"1.3rem"}}>Running Date</TableCell>
                                                            <TableCell align="right" sx={{ fontSize:"1.3rem"}}>Last Completed Block</TableCell>
                                                            <TableCell align="right" sx={{ fontSize:"1.3rem"}}>First Failed Block</TableCell>
                                                            <TableCell align="right" sx={{ fontSize:"1.3rem"}}>Error Message</TableCell>
                                                            <TableCell align="right" sx={{ fontSize:"1.3rem"}}>Variables (JSON)</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody sx={{ marginBottom:"20px"}}>
                                                        {historyData.map((row, index) => (
                                                            <TableRow
                                                                key={index}
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell component="th" scope="row" style={{color:row["status"] === "failed"?"red":"green", fontSize:"1.3rem"}}>
                                                                    {row.status}
                                                                </TableCell>
                                                                <TableCell align="right" style={{fontSize:"1.3rem"}}>{row.running_date}</TableCell>
                                                                <TableCell align="right" style={{fontSize:"1.3rem"}}>{row["last_completed_block"]}</TableCell>
                                                                <TableCell align="right" style={{fontSize:"1.3rem"}}>{row["last_failed_block"]}</TableCell>
                                                                <CustomTooltip title={row["error_message"]} sx={{ display: showTooltip ? "block" : "none" }}>
                                                                    <TableCell align="right" style={{fontSize:"1.3rem"}}><Button onClick={() => setShowTooltip(!showTooltip)} sx={{ textAlign: "center", backgroundColor: "#383838", fontSize: "0.75rem" }} >Click For Details</Button></TableCell>
                                                                </CustomTooltip>
                                                                <TableCell align="right" style={{fontSize:"1.3rem"}}>
                                                                    <VariablesForm variables={row.variables} />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}


                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={getHistoryData} sx={{ textAlign: "center", backgroundColor: "#383838", fontSize: "1rem" }} >Fetch Data</Button>
                                        <Button onClick={()=>{setOpen(false)}} sx={{ textAlign:"center", backgroundColor: "#383838", fontSize:"1rem"}} autoFocus>
                                            close
                                        </Button>
                                    </DialogActions>
                                </Box>
                            </Dialog>
                        </ThemeProvider>
                        <div className="flow-container">

                         {
                            pipelineName.length != 0  && 
                            <>
                               <div className="container">
                                    {loading ? <div className="pipeline-controller pipeline-loading">
                                        <p className="play-btn"><FontAwesomeIcon icon={faSpinner} spin /></p>
                                        <p>Starting Pipeline...</p>
                                    </div>
                                        : isPipelineStarted ?
                                            <div className="pipeline-controller pipeline-started">
                                                <p className="play-btn"><FontAwesomeIcon icon={faSpinner} spin /></p>
                                                <p>Running...</p>
                                            </div> :
                                                <div className="pipeline-controller">
                                                    <p className="play-btn" onClick={() => runPipeline("button")}><FontAwesomeIcon icon={faCirclePlay} /></p>
                                                    <p>Start Pipeline</p>
                                                </div>
                                    }

                                    <div className="steps" style={{ width: "100%" }}>
                                        {pipelineName && (
                                            <Stepper activeStep={activeStep} sx={{ width: "100%" }}>
                                                {steps && steps.map((label, index) => {
                                                    const labelProps = {};
                                                    if (!stepStatus[index]) {
                                                        labelProps.optional = (
                                                            <Typography variant="caption" color="error">

                                                            </Typography>
                                                        );

                                                        labelProps.error = true;
                                                    }

                                                    return (
                                                        <Step key={index}>
                                                            <StepLabel {...labelProps}>{label.toUpperCase()}</StepLabel>
                                                        </Step>
                                                    )
                                                })}
                                            </Stepper>
                                        )}
                                    </div>
                                    {pipelineName.length !== 0 &&
                                        <div className="side-info-container">
                                            <Tooltip title="Clear">
                                                <FontAwesomeIcon icon={faBroom}  onClick={()=>{setIsAreYouSureOpen(true)}} className="trash-icon-side"/>
                                            </Tooltip>
                                            
                                            <Tooltip title={`${props.pipelineType === "data_preprocessing"? formatString(pipelineName[0]): formatString(pipelineName)}`}>
                                                <Button><FontAwesomeIcon icon={faCircleInfo}  className="info-icon-side"/>   </Button>
                                            </Tooltip>
                                            <Tooltip title="Run History">
                                                <FontAwesomeIcon icon={faArrowsRotate} onClick={() => setOpen(true)} className="info-icon-side"/>
                                            </Tooltip>
                                        </div>
                                    } 
                                </div>
                          </>
                         }                            
                           
                            
                            <Toaster />
                                
                            <Flow pipelineType={props.pipelineType}/>
                                
                            { isAreYouSureOpen && <AreYouSure pipelineName={pipelineName} open={isAreYouSureOpen} pipelineType={props.pipelineType} handleClose={closAreYouSure} additionalSteps={handleDeleteTheRestData} thePipelineName={pipelineName} ></AreYouSure>}
                            
                        </div>

                    </div>
    );
};
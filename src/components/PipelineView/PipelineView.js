import React, {  useState, useEffect }  from "react";
import { formatString } from "../../utils/formatString";
import {
    FETCH_PIPELINE_RUN_DATA,
    PIPELINE_HISTORY,
    PIPELINE_STATUS,
    RUN_PIPELINE,
    RUN_STREAMING_PIPELINE, STREAMING_PIPELINE_STATUS,
    CREATE_TRIGGER
} from "../../utils/apiEndpoints";
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
import Metrics from "../DataProcessing/dialogs/Metrics/Metrics";
import axios from "axios";
import toast from 'react-hot-toast';
import {createTheme, styled} from '@mui/material/styles';
import {
    faCirclePlay,
    faSpinner,
    faCircleInfo,
    faArrowsRotate,
    faHourglassStart,
    faLink,
    faCircleStop,
    faMicrochip,
    faWarning
} from '@fortawesome/free-solid-svg-icons';
import {ThemeProvider} from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import {setSelectedTrainedModel, setIsPredictedSelected, setRunningPipelines} from "../../reducers/nodeSlice";
import { deleteElement } from "../../utils/deleteElement";
import {containsString} from "../../utils/containsString";
import Box from '@mui/material/Box';
import Flow from "../Flow/Flow";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from '@mui/material/CircularProgress';
import style from "./PipelineView.css"


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
    const runningPipelines = useSelector((state)=> state.runningPipelines);
    const pipelineNrOfVariables = useSelector((state)=> state.pipelineNrOfVariables)
    const pipelineNodes = useSelector((state) => state.orderedNodes);
    const blockVariables = useSelector((state) => state.blocksVariables);
    // ** These are the values for the pipelines names **//
    const pipelineNameTrain = useSelector((state)=> state.selectedPipelineNameTrain);
    const pipelineNamePreprocessing = useSelector((state)=> state.selectedPipelineDataPreprocessing);
    const selectedPipelineNamePrediction = useSelector((state)=> state.selectedPipelineNamePrediction);
    const pipelineNameStreaming = useSelector((state)=> state.selectedPipelineStreaming);
    const pipelinePreProcessing = useSelector((state)=> state.selectedPipelineDataPreprocessing);
    // ** Here values for the pipelines names end ** //
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
    const [metricsOpen, setMetricsOpen]  = React.useState(false);
    const [pipelineType , setPipelineType] = React.useState("");
    const [noTrigger, setNoTrigger] = React.useState(false);
    const [errorLoadingData, setErrorLoadingData] = React.useState(false);
    const [createAndFetchTrigger, setCreateAndFetchTrigger] = React.useState(false);
    const [isChained, setIsChained] = React.useState(false);
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
      

    const blockAlert = (msg, type = "error") => {
        if (type === "error") {
            toast.error(msg, {
                duration: 2000,
                position: 'top-right',
            })
        } else if(type === "success"){
            toast.success(msg, {
                duration: 2000,
                position: 'top-right',
            })
        } else if(type === "info"){
            toast(msg, {
                 icon: 'ℹ️️',
            });
        }
    };
 
    const retrievePipelineVarCount = (allPipeVars, pipeline_name)=>{
        
        let varCount;
        
        if(Array.isArray(pipeline_name)){
            pipeline_name = pipeline_name[0];        
        }

        for(const pipe of allPipeVars){
            
            if(pipe["pipeline_name"] === pipeline_name){
                return pipe["number_of_variables"];
            }
        }
        return 0;
    }

    const parseVarsForPipeline = ()=>{    
        
        const theVars = [];
        // aici trebuie sa adaugi si in functie de tab name la if
        /*
            block.tabName - nume tab de pe block
            props.tabName
        */
        for(const blockVar of blockVariables){
           
            if(blockVar["pipelineName"] == pipelineName && blockVar.tabName === props.tabName){
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
                if (counter === 100) {
                    isResolved = true;
                    resolve("failed");
                    return;
                }
                try {
                    const response = await axios({
                        method: 'GET',
                        url: PIPELINE_STATUS(JSON.parse(sessionStorage.getItem(`${props.tabOrder}-${pipelineName}-runData`)).id),
                    });

                    const data = response.data;
                    
                    if (["completed", "failed", "cancelled", "upstream_failed"].includes(data)) {
                        isResolved = true;

                        // here we find all the pipelines
                        let allRunningPipelines = runningPipelines;
                        
                       
                        
                        const toSave = {...JSON.parse(sessionStorage.getItem(`${props.tabOrder}-${pipelineName}-running-steps`)), "isPipelineStarted": false}
                        sessionStorage.setItem(`${props.tabOrder}-${pipelineName}-running-steps`, JSON.stringify(toSave));
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
       

        sessionStorage.removeItem(`${props.tabOrder}-${pipelineName}-running-steps`);
    }, [runStep, steps, pipelineName]);

    const runPipeline = React.useCallback(async (source) => {

        // aici ar fii pipeline starting code
        if (source === "button") {
            const result = await startPipeline();
              
            
            if (result) {
                setActiveStep(steps.indexOf("running"));
                setIsPipelineStarted(true);
                
                // pipeline starting code
                const toSave = {...JSON.parse(sessionStorage.getItem(`${props.tabOrder}-${pipelineName}-running-steps`)),
                    "activeStep": steps.indexOf("running"), "isPipelineStarted": true};
                
                sessionStorage.setItem(`${props.tabOrder}-${pipelineName}-running-steps`, JSON.stringify(toSave));

                await delay(10000);

                callStep().then((_) => {});
            } else {
                setActiveStep(-1);
                setStepStatus((prevState) => {
                    return prevState.map(() => {
                        return false;
                    });
                });
                
            
                sessionStorage.setItem(`${props.tabOrder}-${pipelineName}-running-steps`, JSON.stringify({
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


    const handleDeleteTheRestData = ()=>{
        if(props.pipelineType === "prediction"){
            dispatch(setSelectedTrainedModel(""));
        }
        
        setIsPipelineStarted(false);
        setActiveStep(-1);
        setStepStatus([true, true,true])
        dispatch(setIsPredictedSelected(false));
    }

    const deleteCurrentPipeline = ()=>{
        let allRunningPipelines = [...runningPipelines];
                    
        if(allRunningPipelines){
            let localPipelineName = "";
            if(Array.isArray(pipelineName)){
                localPipelineName = pipelineName[0];
            } else {
                localPipelineName = pipelineName;
            }

            deleteElement(allRunningPipelines,localPipelineName);
            dispatch(setRunningPipelines(allRunningPipelines));
        }
    }

    const addCurrentPipeline = ()=>{
       
        let allRunningPipelines = [...runningPipelines];

        let currentPipeline = "";
        if(Array.isArray(pipelineName)){
            currentPipeline = pipelineName[0];
        } else {
            currentPipeline = pipelineName;
        }
        
        for(const pipeline of allRunningPipelines){
            if(pipeline == currentPipeline){
                return;
            }
        }

        if(!allRunningPipelines){
            allRunningPipelines = [];
        }
        if(Array.isArray(pipelineName)){
            allRunningPipelines.push(pipelineName[0]);
        } else {
            allRunningPipelines.push(pipelineName);
        }
        
        dispatch(setRunningPipelines(allRunningPipelines));
    }

    


    const handleStreamingPipeline = async (status) => {
        try {
            const response = await axios({
                method:  "PUT",
                url: RUN_STREAMING_PIPELINE,
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    "trigger_id": runData.id,
                    "status": status,
                    "pipeline_uuid": pipelineNameStreaming[0]
                }
            })

            if (response.status === 200) {
                blockAlert("Pipeline status updated successfully!", "success");
                if(!isPipelineStarted){
                    addCurrentPipeline();
                } else {
                    deleteCurrentPipeline();
                }
                setIsPipelineStarted(!isPipelineStarted);
            }
        } catch (_) {
            blockAlert("Encounter an error when updating the status of the pipeline!")
        }
    }

    const pollWithTimeout = (asyncOperation, maxAttempts, delayMs, attempt = 1) => {
        return new Promise((resolve, reject) => {
            asyncOperation()
            .then(result => {
                if (Object.keys(result.data).length !== 0) { 
                resolve(result.data);
                } else if (attempt < maxAttempts) {
                setTimeout(() => {
                    pollWithTimeout(asyncOperation, maxAttempts, delayMs, attempt + 1)
                    .then(resolve)
                    .catch(reject);
                }, delayMs);
                } else {
                reject(new Error(`Polling failed after ${maxAttempts} attempts.`));
                }
            })
            .catch(error => {
                // if there was an erro we notify the user accordingly
              reject(new Error(`Polling failed after ${maxAttempts} attempts with error: ${error.message}`));
            });
        });
    }

    const handleCreateAndFetchPipelineTrigger = async()=>{
        let runDataResp;

        try{
            const response = await axios.get(FETCH_PIPELINE_RUN_DATA(pipelineName));
            runDataResp = response.data;
        }  catch(err){
              if (err.response && err.response.status === 404) {
                    // Handle 404 Not Found specifically
                    console.log("Resource not found (404).");
                    // Maybe set a specific state for 404 or show a different message
                    blockAlert("Pipeline run data not found!", "info");
                    //set runDataResp to an empty object to fit with the rest of the code functionality
                    runDataResp = {}
                } else {
                    // Handle other errors (network issues, 5xx, etc.)
                    console.error("Error loading pipeline run data:", err);
                    blockAlert("Error loading pipeline run data!");
                    setErrorLoadingData(true);
                    return false;
                }

            // blockAlert("Error loading pipeline run data!");
            // setErrorLoadingData(true);
            // return false;
        }
        

            // if the response received on the API is not an empty object
            // this pipeline does have a trigger and we may use that trigger
            if(Object.keys(runDataResp).length !== 0 ){
                setRunData(runDataResp);
                sessionStorage.setItem(`${props.tabOrder}-${pipelineName}-runData`, JSON.stringify(runDataResp));
                return true;
            } else {
                // here we deal with the case when there is no trigger
                // we need to first create the trigger 
                // then pool the API for n times
                // and we need to notify the user
                
                //STEP 0 - notify the user
                blockAlert("This pipeline does not have a trigger so we are creating one...","info");
                
                // here we handle the special case - createAndFetch trigger
                setCreateAndFetchTrigger(true);

                // STEP 1 create the trigger

                const newDate = Date.now();

                const requestPayload = {
                "name": pipelineName,
                "trigger_type": "api",
                "trigger_name": `ORCHESTRATOR_${pipelineName}`,
                "interval": "",
                "start_time": newDate
                }

                axios({
                method: "POST",
                url: CREATE_TRIGGER,
                data: requestPayload

                }).then((response) => {
                    blockAlert("Pipeline trigger got created in MageAI!","info");
                    return true;
                }).catch((_) => {
                    blockAlert("Error creating pipeline trigger");
                    setErrorLoadingData(true);
                    setCreateAndFetchTrigger(false);
                    return false;
                })
                // now we are fetching with timeout ... for some retries
                blockAlert("Fetching the pipeline trigger into the Orchestrator UI...", "info");

                pollWithTimeout(
                    async () => { // <--- Wrap your axios call in an async function
                        try {
                        const response = await axios.get(FETCH_PIPELINE_RUN_DATA(pipelineName));
                        // Return the data if it's not empty, otherwise return null/empty object to continue polling
                        return Object.keys(response.data).length > 0 ? response.data : null;
                        } catch (error) {
                        // Handle axios specific errors if needed, or re-throw to stop polling
                        console.log("Axios request failed during polling, retrying...", error.message);
                        blockAlert("Error while fetching the data", "error");
                        setCreateAndFetchTrigger(false);
                        return null; // Return null to indicate it should retry (if error is transient)
                        }
                    },
                        5, // maxAttempts
                        1000 // delayMs
                )
                    .then(resource => {
                        // here the resource is the resource that is like the actual runData object that 
                        //we need to work with it further
                        setRunData(resource);
                        blockAlert("Trigger fetched successfully!", "info")
                        sessionStorage.setItem(`${props.tabOrder}-${pipelineName}-runData`, JSON.stringify(resource));                        
                        return true;
                    })
                    .catch(error => {
                        blockAlert("There was an error while fetching the pipeline trigger!","error");
                        setCreateAndFetchTrigger(false);
                        return false;
                    });

            }
    }
    

    useEffect(() => {

        if (pipelineName.length > 0) {

            // first check if the trigger exists
            // if it does exists than we return it 
            // if it does not exists than we create it and then return it

           const createTriggerResp = handleCreateAndFetchPipelineTrigger();

           // if the response from createTrigger is false than this means that
           // the process of creating the trigger did not worked properly

           if(!createTriggerResp){
                return;
           } else {
                setNoTrigger(false);
           }

            if (isRun.current) return;

            isRun.current = true;
            
           let savedState;
           if(Array.isArray(pipelineName)){
            savedState = sessionStorage.getItem(`${props.tabOrder}-${pipelineName[0]}-running-steps`);
           } else {
            savedState = sessionStorage.getItem(`${props.tabOrder}-${pipelineName}-running-steps`);
           }
           
            if (savedState) {
                savedState = JSON.parse(savedState);
                setActiveStep(savedState.activeStep);
             
                setIsPipelineStarted(savedState.isPipelineStarted);
    
                if (savedState.isPipelineStarted) {
                    setTimeout(() => {
                        runPipeline("useEffect").then((_) => {});
                    }, 2000)
                }
            } else {
                sessionStorage.setItem(`${props.tabOrder}-${pipelineName}-running-steps`, JSON.stringify({
                    "stepStatus": stepStatus,
                    "activeStep": -1,
                    "isPipelineStarted": isPipelineStarted
                }))
            }
        }

    }, [pipelineName]);

    useEffect(()=>{
        
        if(!runData || Object.keys(runData).length === 0)
        {
            setNoTrigger(true);
        } else {
            setNoTrigger(false);
        }

    },[runData])

    useEffect(()=>{
        
        setPipelineName(props.pipelineName);
        if (pipelineNameStreaming.length > 0 && props.pipelineType === "streaming") {
            axios({
                method: "GET",
                url: STREAMING_PIPELINE_STATUS(pipelineNameStreaming)
            }).then((response) => {
             
                if (response.data === "active") {
                    setIsPipelineStarted(true);
                    
                } else {
                    setIsPipelineStarted(false);
                    
                }
            }).catch((_) => {
                blockAlert(`Encounter an error when trying to get the status for pipeline ${pipelineName}`)
            })
        }
        if (props.pipelineType !== "streaming") {
            setIsPipelineStarted(false);
            setActiveStep(-1);
            setStepStatus([true, true,true]);
        }

    },[pipelineNameTrain, pipelineNamePreprocessing, pipelineNameStreaming]);

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

    useEffect(()=>{
       
        //aici daca pipeline-ul este pornit atunci va merge adica va incerca sa il spawneze cred
        if(pipelineName.length == 0){
            return;
        }
        if(isPipelineStarted){
            addCurrentPipeline();
        } else {
            
            deleteCurrentPipeline();
        }
        

    },[isPipelineStarted, pipelineName])


    useEffect(()=>{
        
        if(props["isChained"]){
            setIsChained(true);
        } else {
            setIsChained(false);
        }
    },[props])


    return(
        <div>
                    <ThemeProvider theme={darkTheme}>
                            <Dialog open={open} onClose={handleClose} sx={{ display: "flex", flexDirection: "column", alignItems: "space-between", justifyContent: "space-between", color: "white", textAlign:"center", backgroundColor:""}} maxWidth="xl" fullWidth="xl" >
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
                            pipelineName.length !== 0  && pipelineNodes.length!==0 && !errorLoadingData &&
                            <>
                               <div className="container">
                                    <>
                                 {isChained ? 
                                    <>
                                        <div className="pipeline-controller pipeline-loading">
                                            <p className="play-btn"><FontAwesomeIcon icon={faLink} /></p>
                                            <p>Subpipeline Chained</p>
                                        </div>
                                    </>

                                    :

                                     <>
                                        {
                                            !noTrigger ?
                                            <>
                                                { (!createAndFetchTrigger) ?
                                                        <>
                                                            { loading ?
                                                                <div className="pipeline-controller pipeline-loading">
                                                                        <p className="play-btn"><FontAwesomeIcon icon={faSpinner} spin /></p>
                                                                        <p>Starting Pipeline...</p>
                                                                    </div>
                                                                : isPipelineStarted ?
                                                                    <div className="pipeline-controller pipeline-started">
                                                                        {props.pipelineType !== "streaming" ?
                                                                            <p className="play-btn"><FontAwesomeIcon icon={faSpinner} spin /></p>
                                                                            :
                                                                            <p className="play-btn" onClick={() => handleStreamingPipeline("stop")}><FontAwesomeIcon icon={faCircleStop} /></p>
                                                                        }

                                                                        <p>Running...</p>
                                                                    </div> :
                                                                        <div className="pipeline-controller">
                                                                            <p className="play-btn" onClick={() => props.pipelineType === "streaming" ? handleStreamingPipeline("start") : runPipeline("button")}><FontAwesomeIcon icon={faCirclePlay} /></p>
                                                                            <p>Start Pipeline</p>
                                                                        </div>
                                                                }
                                                        </>
                                                        :
                                                        <>
                                                                  <div className="pipeline-controller">
                                                                        <p className="play-btn" ><FontAwesomeIcon icon={faHourglassStart} /></p>
                                                                        <p> Fetching trigger.. </p>
                                                                    </div>
                                                        </>
                                                    }
                                            </>
                                            :

                                            <>
                                                        <div className="pipeline-controller pipeline-controller-warning">
                                                                <p className="play-btn" ><FontAwesomeIcon icon={faWarning} /></p>
                                                                <p>No trigger in MageAI!</p>
                                                            </div>
                                            </>

                                        }
                                     </>

                                    }
                                   
                                    
                                      
                                    </>
                                 
                                 {
                                    props.pipelineType !== "streaming" && !isChained &&
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
                                 }
                                
                                { pipelineName.length !== 0   &&

                                   <>

                                    {
                                        props.pipelineType === "streaming" ?
                                        <div className="side-info-container-small">
                                                                                   
                                            <Tooltip title={`${(props.pipelineType === "data_preprocessing" ||  props.pipelineType === "streaming")? formatString(pipelineName): formatString(pipelineName)}`} overlayStyle={{ 
                                                fontSize: '16px',
                                                maxWidth: '300px',
                                                padding: '10px'
                                            }} >
                                                <Button><FontAwesomeIcon icon={faCircleInfo}   className="info-icon-side-small"/>   </Button>
                                            </Tooltip>

                                           </div>

                                           :

                                           <div className="side-info-container">

                                           <Tooltip title={`${(props.pipelineType === "data_preprocessing" ||  props.pipelineType === "streaming")? formatString(pipelineName): formatString(pipelineName)}`}>
                                               <Button><FontAwesomeIcon icon={faCircleInfo}  className="info-icon-side"/>   </Button>
                                           </Tooltip>
                                            
                                               
                                               <Tooltip title="Run History">
                                                   <FontAwesomeIcon icon={faArrowsRotate} onClick={() => setOpen(true)} className="info-icon-side"/>
                                               </Tooltip>

                                            <Tooltip title="Resources">
                                                 <FontAwesomeIcon icon={faMicrochip}  onClick={()=>{setMetricsOpen(true)}} style={{paddingRight:"20px"}} className="info-icon-side"/>
                                             </Tooltip>
                                              
                                             </div>

                                       }
                                      
                                   </>
                                
                                } 

                            </div>
                          </>
                         }                            
 
                           <Flow tabName={props.tabName} pipelineType={props.pipelineType} pipelineName={props.pipelineName}/>
                                
                            { isAreYouSureOpen && <AreYouSure pipelineName={pipelineName} open={isAreYouSureOpen} pipelineType={props.pipelineType} handleClose={closAreYouSure} additionalSteps={handleDeleteTheRestData} thePipelineName={pipelineName} pipelineStudio={false} ></AreYouSure>}
                            { metricsOpen && <Metrics open={metricsOpen} pipelineName={pipelineName} handleClose={()=>{setMetricsOpen(false)}} />}
                        
                        </div>

                    </div>
    );
};
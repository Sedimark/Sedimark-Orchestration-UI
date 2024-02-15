import React, { useEffect, useRef, useState } from "react";
import Flow from "./Flow";
import style from "../DataProcessing/DataProcessing.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay, faSpinner, faTrash, faCircleInfo, faTrashCan, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux/es/hooks/useSelector";
import LeftMenu from "./LeftMenu";
import AreYouSure from "./dialogs/AreYouSure/AreYouSure";
import {createTheme, makeStyles, styled, ThemeProvider} from '@mui/material/styles';
import {FETCH_PIPELINE_RUN_DATA, PIPELINE_HISTORY, PIPELINE_STATUS, RUN_PIPELINE} from "../../utils/apiEndpoints";
import toast, { Toaster } from 'react-hot-toast';
import Button from '@mui/material/Button';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import axios from "axios";
import {Step, StepLabel, Stepper} from "@mui/material";
import {localStorageAvailable} from "@mui/x-data-grid/utils/utils";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Table from "@mui/material/Table";
import Paper from "@mui/material/Paper";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Box from "@mui/material/Box";

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

function DataProcessing() {
    const pipelineNodes = useSelector((state) => state.orderedNodes);
    const pipelineName = useSelector((state) => state.selectedPipelineName);
    const blockVariables = useSelector((state) => state.blocksVariables);
    const [isPipelineStarted, setIsPipelineStarted] = useState(false);
    const [pipelineFinished, setPipelineFinished] = useState(false);
    const [runData, setRunData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAreYouSureOpen, setIsAreYouSureOpen] = useState(false);
    const steps = ["started", "running", "finished"];
    const [stepStatus, setStepStatus] = React.useState([true, true, true]);
    const [activeStep, setActiveStep] = React.useState(-1);
    const [open, setOpen] = React.useState(false);
    const [historyData, setHistoryData] = React.useState(null);
    const isRun = React.useRef(false);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleClose = () => {
        setOpen(false);
    }

    const HtmlTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} />
      ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
          backgroundColor: '#f5f5f9',
          color: 'rgba(0, 0, 0, 0.87)',
          maxWidth: 420,
          fontSize: theme.typography.pxToRem(15),
          border: '1px solid #dadde9',
        },
      }));
      

    const blockAlert = (msg) => {
        toast.error(msg, {
            duration: 2000,
            position: 'top-right',
        })
    };

    const handleStop = () => {
        setPipelineFinished(false);
        setStepStatus((prevState) => {
            return prevState.map(() => {
                return true;
            });
        });
        setActiveStep(-1);

        const toSave = {
            "pipelineFinished": false,
            "isPipelineStarted": false,
            "stepStatus": [true, true, true],
            "activeStep": -1
        };

        localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
    }

    const startPipeline = React.useCallback(async () => {
        if (pipelineNodes.length < 2) {
            blockAlert("A pipeline should have 2 or more blocks!");
            return false;
        }

        if (blockVariables.length === 0) {
            blockAlert("Please enter at least on block variable!");
            return false;
        }

        const variables = {};

        blockVariables.forEach((value) => {
            variables[value["variable_name"]] = value["value"];
        })

        setActiveStep(steps.indexOf("start"));
        try {
            await axios({
                method: "POST",
                url: RUN_PIPELINE,
                headers: {
                    "Content-Type": "application/json"
                },
                data: {
                    "run_id": runData.run_id,
                    "token": runData.token,
                    "variables": variables
                }
            })
            return true;
        } catch(_) {
            blockAlert("Error occurred when starting the pipeline");
            return false;
        }
    }, [setActiveStep, setStepStatus, setPipelineFinished, blockAlert, blockVariables, runData, pipelineNodes]);

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
                        url: PIPELINE_STATUS(JSON.parse(localStorage.getItem(`${pipelineName}-runData`)).run_id),
                    });

                    const data = response.data;

                    console.log(data);

                    if (["completed", "failed", "cancelled", "upstream_failed"].includes(data)) {
                        isResolved = true;
                        const toSave = {...JSON.parse(localStorage.getItem(`${pipelineName}-running-steps`)), "pipelineFinished": true, "isPipelineStarted": false}
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
        setPipelineFinished(true);

        const toSave = {
            "stepStatus": statuses,
            "activeStep": -1,
            "pipelineFinished": true,
            "isPipelineStarted": false
        }

        localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify(toSave));
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
                setPipelineFinished(true);

                localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify({
                    "activeStep": -1,
                    "stepStatus": [false, false, false],
                    "pipelineFinished": true,
                    "isPipelineStarted": false
                }));
            }
        } else {
            callStep().then((_) => {});
        }
    }, [startPipeline, setPipelineFinished, setActiveStep, setStepStatus, pipelineName, steps,
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
        }
    }, [pipelineName]);

    React.useEffect(() => {
        if (isRun.current) return;

        isRun.current = true;

        let savedState = localStorage.getItem(`${pipelineName}-running-steps`);

        if (savedState) {
            savedState = JSON.parse(savedState);
            setStepStatus(savedState.stepStatus);
            setActiveStep(savedState.activeStep);
            setPipelineFinished(savedState.pipelineFinished);
            setIsPipelineStarted(savedState.isPipelineStarted);

            if (!savedState.pipelineFinished && savedState.isPipelineStarted) {
                setTimeout(() => {
                    runPipeline("useEffect").then((_) => {});
                }, 2000)
            }
        } else {
            localStorage.setItem(`${pipelineName}-running-steps`, JSON.stringify({
                "stepStatus": stepStatus,
                "activeStep": -1,
                "pipelineFinished": false,
                "isPipelineStarted": false
            }))
        }
    })

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

    const handleChange = async (e) => {
        try {
            const response = await axios({
                method: "GET",
                url: PIPELINE_HISTORY(pipelineName, e.target.value)
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
            setHistoryData(result);
        } catch (_) {
            blockAlert("Error getting the history");
        }
    }

    return (
        <div style={{ height: '100%' }}>
            <ThemeProvider theme={darkTheme}>
                <Dialog open={open} onClose={handleClose} sx={{ display: "flex", flexDirection: "column", alignItems: "space-between", justifyContent: "space-between", color: "white", textAlign:"center", backgroundColor:""}} maxWidth="xl" fullWidth="true" >
                    <DialogTitle>
                        RUN HISTORY
                    </DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth>
                            <Typography variant="p" sx={{ color: "white" }}>History Limit</Typography>
                            <Select
                                labelId="demo-simple-select-label"
                                onChange={handleChange}
                                fullWidth
                            >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={15}>15</MenuItem>
                                <MenuItem value={30}>30</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                            </Select>
                        </FormControl>
                        {historyData && (
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Running Date</TableCell>
                                            <TableCell align="right">Variables (JSON)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {historyData.map((row, index) => (
                                            <TableRow
                                                key={index}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {row.status}
                                                </TableCell>
                                                <TableCell align="right">{row.running_date}</TableCell>
                                                <TableCell align="right">
                                                    <VariablesForm variables={row.variables} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DialogContent>
                </Dialog>
            </ThemeProvider>
            <div className="flow-container">
                    <div className="container">
                    {loading ? <div className="pipeline-controller pipeline-loading">
                        <p className="play-btn"><FontAwesomeIcon icon={faSpinner} spin /></p>
                        <p>Starting Pipeline...</p>
                    </div>
                        : isPipelineStarted ?
                            <div className="pipeline-controller pipeline-started">
                                <p className="play-btn"><FontAwesomeIcon icon={faSpinner} spin /></p>
                                <p>Running...</p>
                            </div> : pipelineFinished ?
                                <div className="pipeline-controller pipeline-started">
                                    <p className="play-btn" onClick={handleStop}><FontAwesomeIcon icon={faTrash} /></p>
                                    <p>Clear Run</p>
                                </div>
                                :
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
                            <FontAwesomeIcon icon={faTrashCan}  onClick={()=>{setIsAreYouSureOpen(true)}} className="trash-icon-side"/>
                            <HtmlTooltip
                                title={
                                <React.Fragment>
                                    <div>
                                        <Typography color="inherit"><h3>Selected Pipeline</h3></Typography>
                                        <em>{pipelineName}</em>
                                    </div>
                                </React.Fragment>
                                }
                            >
                                <Button><FontAwesomeIcon icon={faCircleInfo}  className="info-icon-side"/>   </Button>
                            </HtmlTooltip>
                            <Tooltip title="Run History">
                                <FontAwesomeIcon icon={faArrowsRotate} onClick={() => setOpen(true)} className="info-icon-side"/>
                            </Tooltip>
                        </div>
                    }
                </div>
                
                <Toaster />
                <LeftMenu />
                <Flow />
                { isAreYouSureOpen && <AreYouSure open={isAreYouSureOpen} handleClose={closAreYouSure}></AreYouSure>}
                
            </div>
        </div>
    );
}

export default DataProcessing;
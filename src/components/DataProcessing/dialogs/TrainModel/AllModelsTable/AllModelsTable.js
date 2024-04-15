import React from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import SelectModelVersion from "../../../dialogs/SelectModelVersion/SelectModelVersion";
import axios from "axios";
import style from "./AllModelsTable.css";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Button from '@mui/material/Button';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import CheckIcon from '@mui/icons-material/Check';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {setSelectModelVersionStore} from "../../../../../reducers/nodeSlice"
import toast, { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { styled } from '@mui/system';



export const AllModelsTable = (props)=>{

    const selectedModel =  useSelector((state)=> state.selectedTrainedModel);
    const selectedModelVersion = useSelector((state)=> state.selectedModelVersion);
    const [selectedTrainedModel, setSelectedTrainedModel] = useState("");
    const [modelSelectedVersionName, setModelSelectedVersionName] = useState("");
    const [selectModelVersionDialog, setSelectModelVersionDialog] = useState(false);
    const [modelNameForVersion, setModelNameForVersion] = useState({});
    const isFirstRun = useRef(true);


    const dispatch = useDispatch();

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
      PaperProps: {
        style: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width: 250,
        },
      },
    };
    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
          backgroundColor: theme.palette.common.black,
          color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
          fontSize: 19,
        },
      }));
      
      const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
          backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
          border: 0,
        },
      }));

    const truncateString = (inputString, maxLength)=>{
      inputString = inputString.trim();
        if (inputString.length <= maxLength) {
          return inputString;
        } else {
          return inputString.slice(0, maxLength) + "...";
        }
      }

      const handleSeeMore = (model_data)=>{
          if(!checkModelSelected(model_data.model_name)){
            return;
          }
          props.handleSwitch();
          props.selectModel(model_data);
      }

      const blockAlert = (msg) => {
        toast.error(msg, {
            duration: 2000,
            position: 'top-right',
        })
      };

      const checkModelSelected = (model_name) =>{
          if( Object.keys(modelNameForVersion).length == 0 ||  !modelNameForVersion.hasOwnProperty(model_name)){
            blockAlert(`There is no version selected for the model: ${model_name}`)
            return false
          } else if(modelNameForVersion[model_name].length == 0) {
            blockAlert(`There is no version selected for the model: ${model_name}`)
            return false
          }
          return true;
           
          
      }

      const handleChangeSelectedModel = (row_name)=>{
        
        if(!checkModelSelected(row_name)){
          return;
        }
        props.setRowName(row_name);
          if(row_name!= selectedTrainedModel )
          { 
            setSelectedTrainedModel(row_name);
          } else if (row_name == selectedTrainedModel){
            setSelectedTrainedModel("");
          }
      }

      const handleChangeModelVersion = (model_name, versionObj)=>{
          const oldObj = {...modelNameForVersion};
          oldObj[model_name] = versionObj;
          setModelNameForVersion(oldObj);
          dispatch(setSelectModelVersionStore(oldObj));
          props.setAllModelVersions(oldObj);
      }

      useEffect(()=>{
        setSelectedTrainedModel(selectedModel);
      },[selectedModel])


    

      useEffect(()=>{
        if (isFirstRun.current) {
          
          if(selectedModelVersion){
            setModelNameForVersion(selectedModelVersion);
          }
          isFirstRun.current = false;
        } 
      },[selectedModelVersion])

    return(
        <div>
            
              {
               !props.isLoading && props.allModelsData.length === 0 && 
                <div className="no-models-container">
                  
                  <p className="no-models-text"> 
                  <FontAwesomeIcon icon={faFile} />
                    <p>
                        There are no trained models!
                    </p>
                  </p>
                </div>
              }
             
              {
                !props.isLoading && props.allModelsData.length !=0 && 
                <TableContainer component={Paper}>
                    <Table sx={{ width: "100%" }}  aria-label="customized table">
                      <TableHead>
                        <TableRow >
                           <StyledTableCell sx={{ fontSize:"1.1rem" }}>Model Name</StyledTableCell>
                           <StyledTableCell align="left" sx={{ fontSize:"1.1rem" , paddingLeft:"40px"}}>Date</StyledTableCell>
                           <StyledTableCell align="left" sx={{ fontSize:"1.1rem" , paddingLeft:"40px"}}>Predict</StyledTableCell>
                           <StyledTableCell align="left" sx={{ fontSize:"1.1rem" , paddingLeft:"40px"}}>Version</StyledTableCell>
                           <StyledTableCell align="right" sx={{ fontSize:"1.1rem" }}>Full Data</StyledTableCell>
                         </TableRow>
                       </TableHead>
                      <TableBody>
                      { props.allModelsData.length!=0 &&  props.allModelsData.map((row) => (
                           <StyledTableRow key={row.name}>
                             <StyledTableCell align="left">
                               <p title={row.name}>{truncateString(row.name,21)}</p>
                             </StyledTableCell>
                             <StyledTableCell align="left">{row.creation_date}</StyledTableCell>
                             <StyledTableCell align="left">
                              {row.name !== selectedTrainedModel && 
                                      <Button variant="contained"   sx={{ width: 150,
                                        color: 'white',
                                        backgroundColor:"green",
                                        "&:hover": {
                                          backgroundColor: '#00cc30',
                                          color: '#fff',
                                      }
                              }}
        onClick={()=>{handleChangeSelectedModel(row.name)}} 
        endIcon={<LibraryAddCheckIcon/>}>Select</Button>
                              }
                              
                         
                                { row.name == selectedTrainedModel && 

                                <Button variant="contained"   sx={{ width: 150,
                                                color: 'white',
                                      }}
                            onClick={()=>{handleChangeSelectedModel(row.name)}} 
                            endIcon={<CheckIcon/>}>Selected</Button>
                                } 
                             </StyledTableCell>
                              <StyledTableCell align="center">
                                  <div className="version-container">
                                    { (modelNameForVersion[row.name] && modelNameForVersion[row.name].length!==0)? 
                                      <div className="version-text-simple"> {truncateString(modelNameForVersion[row.name],10)} </div> :
                                      <div className="version-text"> Select </div>
                                    }
                                  
                                      <div  className="edit-version-btn" onClick={()=>{setSelectModelVersionDialog(true); setModelSelectedVersionName(row.name);}}>
                                          <EditOutlinedIcon className="edit-version-btn-icon"/>
                                      </div>
                                    <div>

                                    </div>
                                  </div>
                              </StyledTableCell>

                             <StyledTableCell align="right"><Button variant="contained"   sx={{ width: 150,
                                                                                                color: 'white',
                                                                                                backgroundColor:"#2431bd"
                                                                                      }}
                                     onClick={()=>{handleSeeMore({model_name:row.name, model_date:row.creation_date})}} 
                                     endIcon={<OpenInNewIcon/>}>See more</Button></StyledTableCell>

                           </StyledTableRow>
                         ))}
                       
                       </TableBody>
                     </Table>
              </TableContainer>    
              }     
           {selectModelVersionDialog && <SelectModelVersion handleVersionForModel={(model_name,version)=>{handleChangeModelVersion(model_name , version)}} open={selectModelVersionDialog} modelForVersion={modelSelectedVersionName} handleClose={()=>{setSelectModelVersionDialog(false)}} /> }
        </div>
    );

}

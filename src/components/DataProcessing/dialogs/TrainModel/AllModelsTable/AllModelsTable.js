import React from "react";
import {useState, useEffect} from "react";
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
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import {setTypeForModel, setVersionForModel} from "../../../../../reducers/nodeSlice";
import { MODEL_VERSION } from "../../../../../utils/apiEndpoints";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { styled } from '@mui/system';
import { useSelector } from "react-redux";
import { useDispatch } from 'react-redux';
import axios from "axios";

export const AllModelsTable = (props)=>{

    const selectedModel =  useSelector((state)=> state.selectedTrainedModel);
    const [selectedTrainedModel, setSelectedTrainedModel] = useState("");
    const [dropdownValues, setDropDownValues] = useState({});
    const [selectedValues, setSelectedValues] = useState({});
    const [typeForModel, setTypeForModel] = useState({});

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
        if (inputString.length <= maxLength) {
          return inputString;
        } else {
          return inputString.slice(0, maxLength) + "...";
        }
      }

      const handleSeeMore = (model_data)=>{
          props.handleSwitch();
          props.selectModel(model_data);
      }

      const handleChangeSelectedModel = (row_name)=>{
    
        props.setRowName(row_name);
          if(row_name!= selectedTrainedModel )
          { 
            setSelectedTrainedModel(row_name);
          } else if (row_name == selectedTrainedModel){
            setSelectedTrainedModel("");
          }
      }

      useEffect(()=>{
        setSelectedTrainedModel(selectedModel);
      },[selectedModel])

      const parseSelectedValues = (values, model_name)=>{
      
        dispatch(setTypeForModel(typeForModel[model_name][values]));
        dispatch(setVersionForModel(values));
        const oldSelectedValues = {...selectedValues};
        if(values == oldSelectedValues[model_name]){
          oldSelectedValues[model_name] = [];
        } else {
          oldSelectedValues[model_name] = [values];
        }
        
        setSelectedValues(oldSelectedValues);
      }



      const fetchValuesForModel = async(model_name, values_obj, types_obj)=>{
          try{
            const resp = await axios.get(MODEL_VERSION(model_name))
            const typeObj = {};
            const allVersions = [];
            for(const elem of resp.data){
              allVersions.push(elem.version);
              typeObj[elem.version] = elem.type;
            }
          
            types_obj[model_name] = typeObj;
            values_obj[model_name] = allVersions;
          } catch(err){ 
            console.log(err);
            return [];
          }
      }

      useEffect(()=>{
        if (props.allModelsData && props.allModelsData.length) {
          const fetchData = async () => {
            const allVersions = {};
            const typeObj = {};
            await Promise.all(props.allModelsData.map(async (model) => {
              await fetchValuesForModel(model.name, allVersions, typeObj);
            }));
            const newDropdownValues = { ...allVersions }; // Creăm o nouă copie a obiectului pentru a evita mutarea datelor
            setDropDownValues(newDropdownValues);
            setTypeForModel(typeObj);
            props.setIsDataLoading(false);
          };
          
          fetchData();
          const allSelectedVals = {};
          for(const model of props.allModelsData){
            allSelectedVals[model.name]=[];
          }
          setSelectedValues(allSelectedVals);
        }
      },[props])

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
                              <StyledTableCell align="right">
                                  <FormControl sx={{ m: 1, width: "80%" }}>
                                            <InputLabel id="demo-multiple-name-label">{`Model Version`}</InputLabel>
                                            <Select
                                              labelId="demo-multiple-name-label"
                                              id="demo-multiple-name"
                                              
                                              value={selectedValues[row.name]}
                                              onChange={(event)=>{  parseSelectedValues(event.target.value, row.name) }}
                                              input={<OutlinedInput label="Name" />}
                                              MenuProps={MenuProps}
                                            >
                                             
                                              {dropdownValues[row.name] && dropdownValues[row.name].map((variableName) => {
                                                 
                                                return(
                                                  <MenuItem
                                                    key={variableName}
                                                    value={variableName}
                                                    
                                                  >
                                                    {variableName}
                                                  </MenuItem>
                                                );
                                              })}
                                            </Select>
                                    </FormControl>
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
        </div>
    );

}

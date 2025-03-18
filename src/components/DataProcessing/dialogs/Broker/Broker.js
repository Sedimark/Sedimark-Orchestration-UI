import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import {BROKER_GET_ENTITY_TYPES, BROKER_GET_ASSET_TYPES} from "../../.././../utils/apiEndpoints";
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { setBrokerEntityId } from '../../../../reducers/nodeSlice';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';     
import axios from 'axios';
import style from "./Broker.css";
import { useDispatch, useSelector } from 'react-redux';

 
export default function Broker(props) {

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
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
  
  function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }
  
  const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
  ];

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const MenuProps = {
        PaperProps: {
          style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
          },
        },
      };

  const [typeList, setTypeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAssetList, setLoadingAssetList] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [assetList, setAssetList] = useState([]);
  const [selectedTypeError, setSelectedTypeError] = useState(false);
  const [fetchedAssetListError, setFetchedAssetListError] = useState(false);
  const [optionSelected, setOptionSelected] = useState(false);
      

  const dispatch = useDispatch();

  const getAllTypes = async()=>{
    setLoading(true);
    setSelectedTypeError(false);
    try{
      const resp = await axios.get(BROKER_GET_ENTITY_TYPES);
      setLoading(false);
      setTypeList(resp.data.typeList);
    } catch(err){
      setLoading(false);
      console.log(err);
      setSelectedTypeError(true);
    }
  }

  const processAssetList = (asset_list)=>{
    const finalAssetList = [];

    for(const item of asset_list){

      finalAssetList.push({
        id:item.id,
        type: item.type
      });
    }
    setAssetList(finalAssetList);
  }

  const loadDataForType = async(asset_type)=>{

    setFetchedAssetListError(false);
    if(asset_type){
      setLoadingAssetList(true);
      try{
        const resp = await axios.get(BROKER_GET_ASSET_TYPES(asset_type));
        processAssetList(resp.data);
        setLoadingAssetList(false);
      } catch(err){
        console.log(err);
        setLoadingAssetList(false);
        setFetchedAssetListError(true);
      }
    }
  }
 
  useEffect(()=>{
    getAllTypes();
  },[])

  useEffect(()=>{
    loadDataForType();
  },[selectedType])

 const handleSpawnPipeline = ()=>{
  props.openPipelineDialog();
  props.handleClose();
 }

 

  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            fullWidth={"md"}
            maxWidth={"md"}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
            {"Broker - NGSILD"}
                <div className="close-button-save-pipeline" onClick={props.handleClose}> x </div>
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
               {props.dialogText}
            </DialogContentText>
                <div>
                  {
                    loading &&
                      <div className="loading-circle-container" style={{marginTop:"20px"}}>
                          <div className="loading-circle"></div>
                          <p className="loading-text delete-pipeline-loading-text">Loading...</p>
                      </div>
                  }
                  {
                    !loading && 
                   <div>
                          <p className='select-type-text'>Select Asset Type</p>
                          <div className='broker-dialog-type-selector'>
                            
                              <FormControl sx={{  width: "60%", mb:"10px" }}>             
                                      <InputLabel id="demo-multiple-name-label"></InputLabel>
                                      <Select
                                        labelId="demo-multiple-name-label"
                                        id="demo-multiple-name"
                                        value={selectedType}
                                        onChange={(event)=>{setSelectedType(event.target.value); if(event.target.value.length!==0) {loadDataForType(event.target.value);  } }}
                                        input={<OutlinedInput label="Name" />}
                                        MenuProps={MenuProps}
                                        className="shamrock-control-input"
                                      >

                                      {   
                                            typeList.map((variableName) => (
                                              <MenuItem
                                                key={variableName}
                                                value={variableName} 
                                              >
                                                {variableName}
                                              </MenuItem>
                                                  )) 
                                      }

                                      </Select>      
                                      { selectedTypeError &&  <div className='variable-description error-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon exclamation-icon-error"/> Error while loading assets! </div> }
                                    
                                </FormControl>
                            </div>
                            {
                                loadingAssetList && 
                                <div className="loading-circle-container" style={{marginTop:"20px"}}>
                                        <div className="loading-circle"></div>
                                        <p className="loading-text delete-pipeline-loading-text">Loading...</p>
                                 </div>
                            }

                            {
                              !loadingAssetList && fetchedAssetListError &&
                               <div className='error-container'>
                                  <FontAwesomeIcon icon={faCircleXmark} className='error-icon'/>
                                  <p>There was an error while fetching the assets</p>
                                  <p>Please try again later!</p>  
                              </div>

                            }

                            {assetList.length !== 0 && !loadingAssetList &&
                            
                                <div>   
                                      <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: 700 }} aria-label="customized table">
                                              <TableHead>
                                                <TableRow>
                                                  <StyledTableCell>Id</StyledTableCell>
                                                  <StyledTableCell>Type</StyledTableCell>
                                                  <StyledTableCell align="right">Select</StyledTableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {assetList.map((row) => (
                                                  <StyledTableRow key={row.id}>
                                                    <StyledTableCell component="th" scope="row">
                                                      {row.id}
                                                    </StyledTableCell>
                                                    <StyledTableCell>{row.type}</StyledTableCell>
                                                    <StyledTableCell align="right"><Button variant="contained" disabled={optionSelected} onClick={()=>{ setOptionSelected(true); dispatch(setBrokerEntityId(row.id))}}>Select</Button></StyledTableCell>
                                                  </StyledTableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                  </TableContainer>
                              </div>
                            }         
                            {
                              optionSelected &&
                              <div className='next-action-broker-container'>
                                  <Button variant="contained" onClick={()=>{props.newPipelineGeneration(); props.handleClose()}}> Generate new pipeline </Button>
                                  <Button variant="contained" onClick={handleSpawnPipeline}> Select a pipeline </Button>
                              </div>
                            }
                   </div>
                  }
                   
                </div>
            </DialogContent>
            <DialogActions>
          
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

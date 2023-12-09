import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import styles from "./DataFeaturing.css";
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import DataSetInfo from '../DataSelectDialog/DataSetInfo';
import { unstable_useNumberInput as useNumberInput } from '@mui/base/unstable_useNumberInput';
import {setSelectedDataFeaturingColumns} from "../../../../reducers/nodeSlice";
import {useDispatch} from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from "react-redux/es/hooks/useSelector";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Typography } from '@mui/material';
import {
  Unstable_NumberInput as BaseNumberInput,
  numberInputClasses,
} from '@mui/base/Unstable_NumberInput';
import TextField from '@mui/material/TextField';
import {DATASET_FETCH_DATASET_INFO , DATASET_FETCH_DATASET_SNIPPET} from "../../../../utils/apiEndpoints";
import { unstable_useForkRef as useForkRef } from '@mui/utils';
import axios from "axios";



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
 
const CustomNumberInput = React.forwardRef(function CustomNumberInput(props, ref) {
  const {
    getRootProps,
    getInputProps,
    getIncrementButtonProps,
    getDecrementButtonProps,
    focused,
  } = useNumberInput(props);

  const inputProps = getInputProps();

  // Make sure that both the forwarded ref and the ref returned from the getInputProps are applied on the input element
  inputProps.ref = useForkRef(inputProps.ref, ref);

  return (
    <StyledInputRoot {...getRootProps()} className={focused ? 'focused' : null}>
      <StyledStepperButton {...getIncrementButtonProps()} className="increment">
        ▴
      </StyledStepperButton>
      <StyledStepperButton {...getDecrementButtonProps()} className="decrement">
        ▾
      </StyledStepperButton>
      <StyledInputElement {...inputProps} />
    </StyledInputRoot>
  );
});

export default function DataFeaturing(props){

    const dispatch = useDispatch();
    const dataFeaturing = useSelector((state)=>state.selectedDataFeaturingColumns);
    const [datasetName, setDatasetName] = useState("");
    const [isLoadingId , setIsLoadingId] = useState(true);
    const [datasetId, setDatasetId] = useState(0);
    const [fetchedDatasetInfo, setFetchedDatasetInfo] = useState({});
    const [snippet, setSnippet] = useState([]);
    const [rows, setRows] = useState([]);
    const [selectedColumnsFeaturing,setSelectedColumnsFeaturing] = useState();
    const selectedRows = [1,2,3];
    const dataset = useSelector((state)=>state.selectedDataset);
    const [checked, setChecked] = React.useState([]);

    const [personName, setPersonName] = React.useState([]);

    const handleChange = (event) => {
    const {
      target: { value },
      } = event;
        setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
         );
    };

    const customStyles = {
      control: (base, state) => ({
        ...base,
        background: "#023950",
        // Overwrittes the different states of border
        borderColor: state.isFocused ? "yellow" : "green",
        // Removes weird border around container
        boxShadow: state.isFocused ? null : null,
        "&:hover": {
          // Overwrittes the different states of border
          borderColor: state.isFocused ? "red" : "blue"
        }
      })
    };

    const options = [
      { label: "Apple", value: 1 },
      { label: "Banana", value: 2 },
      { label: "Orange", value: 3 }
    ];

    const [selectedOption, setselectedOption] = useState();

    
    const names = [
      'Oliver Hansen',
      'Van Henry',
      'April Tucker',
      'Ralph Hubbard',
      'Omar Alexander',
      'Carlos Abbott',
      'Miriam Wagner',
      'Bradley Wilkerson',
      'Virginia Andrews',
      'Kelly Snyder',
    ];


    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });
    const columns = [{field:"id", headerName:"ID", width:60},{field:"column_name", headerName:"Column Name", width:320},{field:"sample_data", headerName:"Sample Data", width:230}]

    const parseAndSetData = (data)=>{
      setDatasetName(data[0].dataset_name);
      setDatasetId(data[0].id);
      fetchDatasetInfo(data[0].id);
      fetchDatasetSnippet(data[0].id);
    }


    const parseAndSetRows = (data)=>{
      
      const sampleObj = data[0];
      const allColumns = Object.keys(sampleObj);
      const rowsData = [];
      let i = 1;
      for(const columnName of allColumns){
          const newObj = {
            id:i,
            column_name:columnName,
            sample_data:data[0][columnName]
          }
          i++;
          rowsData.push(newObj);
      }
      
      setRows(rowsData);
    } 

    const handleToggle = (value) => () => {
      const currentIndex = checked.findIndex((item,index) => {return item.column_name === value.column_name && item.sample_data === value.sample_data;});
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
  
      setChecked(newChecked);
    };

    
    const fetchDatasetInfo = (datasetId)=>{
        axios.get(DATASET_FETCH_DATASET_INFO(datasetId))
        .then(resp => {  setFetchedDatasetInfo(resp.data)})
        .catch(err => {console.log(err)})
      }
  
      const fetchDatasetSnippet = (datasetId) =>{
        axios.get(DATASET_FETCH_DATASET_SNIPPET(datasetId))
        .then(resp => { setSnippet(resp.data); parseAndSetRows(resp.data);})
        .catch(err => {console.log(err)})
      }

    const handleSelection = (selection)=>{
      
      const selectedRows = [];
      for(let itemID of selection)
      {
        selectedRows.push(rows[itemID-1]);
      }
      setSelectedColumnsFeaturing(selectedRows);
    }

    const handleDone = ()=>{
        
        dispatch(setSelectedDataFeaturingColumns(checked));
        props.handleClose();
    }

    useEffect(()=>{
        // parseAndSetData(dataset)
    },[dataset])

    useEffect(()=>{
      setChecked(dataFeaturing);
    },[dataFeaturing])

  
    return (
    <div>
        <ThemeProvider theme={darkTheme}>
          <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="300" fullWidth="true" >
    
               <DialogTitle> Anomaly Detection</DialogTitle>
                <DialogContent sx={{textAlign:'center'}}>   
                <Box sx={{ height: "40vh", width: '90%', margin:"auto",borderRadius:"5px" }}  bgcolor="black" >
                  
                  <div className='section-title'>
                      <h1>Variables</h1>
                  </div>  
                  
                <FormControl sx={{ m: 1, width: "60%" }}>
                    <InputLabel id="demo-multiple-checkbox-label">Columns</InputLabel>
                        <Select
                          labelId="demo-multiple-checkbox-label"
                          id="demo-multiple-checkbox"
                          multiple
                          value={personName}
                          onChange={handleChange}
                          input={<OutlinedInput label="Columns" />}
                          renderValue={(selected) => selected.join(', ')}
                          MenuProps={MenuProps}
                        >
                          {names.map((name) => (
                            <MenuItem key={name} value={name}>
                              <Checkbox checked={personName.indexOf(name) > -1} />
                              <ListItemText primary={name} />
                            </MenuItem>
                          ))}
                        </Select>      
                             
                        <TextField id="variable-input" label="Treshold" variant="outlined"  sx={{ marginTop: 5, marginBottom:8 }} />
                        <InputLabel sx={{ marginTop: 21, marginBottom: 1 }}>Number of rows for prediction</InputLabel>
                        <CustomNumberInput aria-label="Demo number input" placeholder="Type a number…" sx={{ marginTop: 5, marginBottom:1 }}/>
                </FormControl>
                
                 </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={props.handleClose}>Close</Button>
                  <Button onClick={()=>{handleDone()}}>Done</Button>
                </DialogActions>
              
          </Dialog>
          </ThemeProvider>
        </div> 
      );
}


const blue = {
  100: '#DAECFF',
  200: '#B6DAFF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0059B2',
  900: '#003A75',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const StyledInputRoot = styled('div')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 4px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.05)'
  };
  display: grid;
  grid-template-columns: 1fr 19px;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;
  column-gap: 8px;
  padding: 4px;

    &.focused {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[700] : blue[200]};

      & button:hover {
        background: ${blue[400]};
      }
      // firefox
      &:focus-visible {
        outline: 0;
    }
  `,
);

const StyledInputElement = styled('input')(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  grid-column: 1/2;
  grid-row: 1/3;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: inherit;
  border: none;
  border-radius: inherit;
  padding: 8px 12px;
  outline: 0;
`,
);

const StyledStepperButton = styled('button')(
  ({ theme }) => `
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  appearance: none;
  padding: 0;
  width: 19px;
  height: 19px;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1;
  box-sizing: border-box;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 0;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

    &.increment {
      grid-column: 2/3;
      grid-row: 1/2;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border: 1px solid;
      border-bottom: 0;
      border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
      background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
      color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};

      &:hover {
        cursor: pointer;
        color: #FFF;
        background: ${theme.palette.mode === 'dark' ? blue[600] : blue[500]};
        border-color: ${theme.palette.mode === 'dark' ? blue[400] : blue[600]};
      }
    }

    &.decrement {
      grid-column: 2/3;
      grid-row: 2/3;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      border: 1px solid;
      border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
      background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
      color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};

      &:hover {
        cursor: pointer;
        color: #FFF;
        background: ${theme.palette.mode === 'dark' ? blue[600] : blue[500]};
        border-color: ${theme.palette.mode === 'dark' ? blue[400] : blue[600]};
      }
  }
  `,
);
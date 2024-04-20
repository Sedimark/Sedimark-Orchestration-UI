import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useDispatch, useSelector} from 'react-redux';
import { MODEL_VERSION } from "../../../../utils/apiEndpoints";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import axios, { all } from "axios";


export default function SelectModelVersion(props) {

  const storedVariables = useSelector((state)=>state.blocksVariables);
  const [selectedPipeline,setSelectedPipeline] = useState("");
  const [allVersions, setAllVersions] = useState([]);
  const [age, setAge] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedVersion, setSelectedVersion] = useState("");

  const handleChange = (event) => {
    setSelectedVersion(event.target.value);
  };

  const dispatch = useDispatch();
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const updateVersion = () => {
    if(selectedVersion.length!=0){
    
      props.handleVersionForModel(props.modelForVersion, selectedVersion);
    }
    props.handleClose();
  }


  const fetchValuesForModel = async(model_name)=>{
    try{
      const resp = await axios.get(MODEL_VERSION(model_name))
      
      const allVersions = [];
      for(const elem of resp.data){
        allVersions.push(elem.version);
      }
      setIsLoading(false);
      setAllVersions(allVersions);
    
    } catch(err){ 
      setIsLoading(false);
      console.log(err);
    }
}


  
 useEffect(()=>{
  if(props.modelForVersion){
      fetchValuesForModel(props.modelForVersion);
  }
 },[props])
 



  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
      
        >
            <DialogTitle id="alert-dialog-title">
            {"Select Version for model"}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description" style={{"padding":"20px", width:"300px"}}>
            {
                      isLoading &&
                      <div className="loading-circle-container">
                        <div className="loading-circle"></div>
                        <p style={{"textAlign":"center", "paddingTop":"10px"}}>Loading...</p>
                      </div>
              }
              {
                !isLoading &&
                <div style={{"paddingLeft":"40px","paddingRight":"40px"}}>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedVersion}
                  label="Age"
                  onChange={handleChange}
                  sx={{"width":"100%"}}
                >
                  {allVersions.map((version)=>{
                    return(
                      <MenuItem value={version}>{version}</MenuItem>
                    );
                  })}
                </Select>
              </div>
              }
              
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={updateVersion} autoFocus>
                OK
            </Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

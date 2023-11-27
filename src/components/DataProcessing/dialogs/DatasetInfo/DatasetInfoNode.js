import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DataSetInfo from '../DataSelectDialog/DataSetInfo';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from "react-redux/es/hooks/useSelector";


export default function DataSetInfoNode(props){

    const [datasetName, setDatasetName] = useState("");
    const [isLoadingId , setIsLoadingId] = useState(true);
    const [datasetId, setDatasetId] = useState(0);
    const dataset = useSelector((state)=>state.selectedDataset);
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });

    const parseAndSetData = (data)=>{
      setDatasetName(data[0].dataset_name);
      setDatasetId(data[0].id);
    }

    useEffect(()=>{
        setIsLoadingId(false);
    },[datasetId])

    useEffect(()=>{
        parseAndSetData(dataset)
    },[dataset])

    return (
    <div>
        <ThemeProvider theme={darkTheme}>
          <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="600" fullWidth="true" >
    
               <DialogTitle> Dataset </DialogTitle>
                <DialogContent>   
                 { !isLoadingId &&  <DataSetInfo notBtnDisplayed={false} handleDisplayDataSetInfo={true} selectedDatasetId={datasetId} selectedDatasetName={datasetName}/> }
                </DialogContent>
                <DialogActions>
                  <Button onClick={props.handleClose}>Close</Button>
                
                </DialogActions>
              
          </Dialog>
          </ThemeProvider>
        </div> 
      );
}
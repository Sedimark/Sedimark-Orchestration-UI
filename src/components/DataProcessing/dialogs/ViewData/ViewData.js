import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FETCH_MINIO_FILE , FETCH_MINIO_SAMPLE} from '../../../../utils/apiEndpoints';
import { useSelector } from "react-redux/es/hooks/useSelector";
import { BarChart, Bar,  Tooltip } from 'recharts';
import axios from 'axios';


export default function ViewData(props) {

    const selectedTab = useSelector((state) => state.selectedView);
    const pipelineTrain = useSelector((state)=> state.selectedPipelineTrain);
    const pipelinePreprocessing = useSelector((state)=> state.selectedPipelineDataPreprocessing);
    const selectedPipelinePrediction = useSelector((state)=> state.selectedPipelinePrediction);
    const [allColumnsData, setAllColumnsData] = useState();
    const [columnNames, setColumnNames] = useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [doneLoading, setDoneLoading] = React.useState(false);
    const [allColumnsSamples, setAllColumnsSamples] = React.useState([]);
    const [allHistValues,setAllHistValues] = React.useState({});
    const [selectedPipeline, setSelectedPipeline] = React.useState("");
    const initialized = useRef(false);

   
    const CustomTooltip = ({ active, payload, label }) => {
      if (active) {
      
        
        return (
          <div className="custom-tooltip">
           <p style={{
            backgroundColor:"#fff",
            color:"#000", 
            border:"1px solid #000",
            boxShadow:"10px 10px 5px -10px rgba(77,77,77,1)",
            WebkitBoxShadow:"10px 10px 5px -10px rgba(77,77,77,1)", 
            borderRadius:"5px",
            font:"helvetica",
            padding:"10px",
            fontWeight:"bold",
            fontSize:"0.9rem"
            }}>{payload[0].payload.name} : {payload[0].payload.value}</p>
          </div>
        );
      }
    
      return null;
    };
    
    const loopArray = Array.from({ length: 5 }, (_, index) => index);
   
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    const BootstrapDialog = styled(Dialog)(({ theme }) => ({
      '& .MuiDialogContent-root': {
          padding: theme.spacing(2),
      },
      '& .MuiDialogActions-root': {
          padding: theme.spacing(1),
      },
  }));


    const rows = [
        createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
        createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
        createData('Eclair', 262, 16.0, 24, 6.0),
        createData('Cupcake', 305, 3.7, 67, 4.3),
        createData('Gingerbread', 356, 16.0, 49, 3.9),
      ];

    function createData(name, calories, fat, carbs, protein) {
        return { name, calories, fat, carbs, protein };
      }
    

      const parseBucketName = (inputString)=>{
      
        if (inputString.includes('_')) {
          inputString = inputString.split("_").join("-");
        } 
      
        if (inputString.includes(' ')) {
          inputString =  inputString.split(' ').join("-");
        } 
      
        return inputString;
      }

    
      const parseHistogram = (histObj)=>{
   
        const resArr = [];
        for(const key in histObj){
          const obj = {
            name:key,
            value:histObj[key]
          }
          resArr.push(obj);
        }
        return resArr;
      }

      const parseHistValues = (allValues) =>{
        
        const resultObject = {};
        for(const val of allValues){
          if(val.type == "hist"){
            resultObject[val.column_name] = parseHistogram(val.hist);
          }
        }

        setAllHistValues(resultObject);
      }


      const fetchAndParseMinioJson = async (bucket_name) => {
        let jsonFileLink;
        let jsonFileData;

    
        try{
            jsonFileLink = await axios.get(FETCH_MINIO_FILE(parseBucketName(bucket_name)));
            jsonFileLink = jsonFileLink.data.url;
        } catch(err){
            console.log(err);
            return;
        }


      
        try{
            jsonFileData = await axios.get(jsonFileLink);
            parseHistValues(jsonFileData.data);
            setAllColumnsData(jsonFileData.data);
            parseAndSetColumnNames(jsonFileData.data);
        } catch(err){
            console.log(err);
        }
      };
    
      
      const parseAndSetColumnNames = (allColumnsData)=>{
        const allColumnNames = [];
        for(const column of allColumnsData){
          allColumnNames.push(column.column_name);
        }
        setColumnNames(allColumnNames);
      } 


      const truncateString = (inputString)=> {
        const maxLength = 30;
      
        if (inputString.length <= maxLength) {
          return inputString;
        } else {
          return inputString.substring(0, maxLength) + '...';
        }
      }

      const fetchSampleData = async(bucket_name)=>{
      
        let jsonFileLink, jsonFileData;
        try {
            jsonFileLink = await axios.get(FETCH_MINIO_SAMPLE(parseBucketName(bucket_name)));
            jsonFileLink = jsonFileLink.data.url;
         } catch(err){
           console.log(err);
           return;
        }
      
      try {
           jsonFileData = await axios.get(jsonFileLink);
           
           setAllColumnsSamples(jsonFileData.data);
       } catch(err){
          console.log(err);
       }

      }

      useEffect(() => {
        
        if(selectedPipeline.length !== 0){
          
            if (!initialized.current) {
              initialized.current = true
              fetchAndParseMinioJson(selectedPipeline);
              fetchSampleData(selectedPipeline);
              }
        }
       
        },[selectedPipeline])

      useEffect(()=>{
        setSelectedPipeline();
      },[])

      useEffect(()=>{
        if(columnNames.length!=0 && allColumnsSamples.length!=0){
              setIsLoading(false);
        }
      },[ columnNames , allColumnsSamples])

    
      useEffect(()=>{
        
          if(selectedTab == 1){
            setSelectedPipeline(pipelinePreprocessing[0]);
          } else if(selectedTab == 2) {
            setSelectedPipeline(pipelineTrain[0]);
          } else {
            
            setSelectedPipeline(selectedPipelinePrediction[0]);
          }
      },[selectedTab])

    return (
      
      <React.Fragment>
         <ThemeProvider theme={darkTheme}>
          <BootstrapDialog
                    onClose={props.handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={props.open}
                    maxWidth={300}
                    fullWidth={true}
                >
                    <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                        View Data
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={() => { props.handleClose() }}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogContent dividers>
                        {
                        isLoading &&
                        <div className="loading-circle-container">
                            <div className="loading-circle"></div>
                            
                        </div>
                        }
                        {
                          !isLoading && 
                          <TableContainer component={Paper} >
                            <Table  aria-label="simple table" sx={{ minWidth: 1950, padding:"10px" }}>
                                <TableHead>
                                    <TableRow>
                                        {columnNames.map((colName, index)=>{
                                            return(
                                                <TableCell style={{ border: '1px solid #000' }}><p style={{ fontSize:"1.1rem", textAlign:"center"}} className='truncate-text' title={colName}>{truncateString(colName)}</p></TableCell>
                                            );
                                        })}
                                        
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                   
                                    <TableRow
                                        key={"ldksad"}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } , padding:"30px"}}
                                    >
                                        {allColumnsData && allColumnsData.map((row,index)=>{
                                         
                                            if(row.type == "unique_values"){
                                                return(<div style={{  width: '300px' ,  borderLeft: '1px solid #000', height:"150px" , fontSize:"1.2rem" ,textAlign:"center", paddingTop:"40px"}}>
                                                        <p >{row.unique_values} </p>
                                                        <p style={{fontWeight:"bold"}}> UNIQUE VALUES </p>
                                                    </div>);
                                            } else if(row.type == "hist"){
                                          
                                            const fetchedData = allHistValues[row.column_name];
                    
                                                return(    
                                                    <TableCell  style={{ border: '1px solid #000' }}>
                                                        <div style={{ width: '300px', marginLeft:"60px" }}>
                                                            <BarChart width={150} height={80} data={fetchedData}>
                                                                <Tooltip   content={<CustomTooltip />}/>
                                                                <Bar dataKey="value" fill="#8884d8" />
                                                            </BarChart>
                                                        </div>
                                                    </TableCell>
                                                    
                                                );
                                            }

                                        })}
                                  
                                    </TableRow>
                                   {
                                    loopArray.map((value, indexLoop) => {
                                      return(
                                        <TableRow>
                                              { columnNames.map((data, index)=>{
                                                     return(
                                                     <TableCell style={{ border: '1px solid #000', textAlign:"center" }}>
                                                          {allColumnsSamples[data][indexLoop]}
                                                     </TableCell>
                                                     )
                                                  })
                                                }
                                        </TableRow>
                                      )
                                    })
                                  
                                   }     

                                </TableBody>
                            </Table>
                        </TableContainer>
                        }
                        
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={props.handleClose}>
                            Ok
                        </Button>
                    </DialogActions>
                </BootstrapDialog>
                </ThemeProvider>
        </React.Fragment>
    );
}
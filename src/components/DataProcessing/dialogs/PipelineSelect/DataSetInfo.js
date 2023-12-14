import React ,{useEffect, useState} from "react";
import styles from "./DataSetInfo.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faAnglesLeft } from '@fortawesome/free-solid-svg-icons';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Button } from "@mui/material";
import axios from "axios";
import {DATASET_FETCH_DATASET_INFO , DATASET_FETCH_DATASET_SNIPPET} from "../../../../utils/apiEndpoints";

export default function DataSetInfo (props){

    const [isLoading, setIsLoading] = React.useState(true);
    const [fetchedDatasetInfo, setFetchedDatasetInfo] = useState({});
    const [snippet, setsnippet] = useState([]);
    const [backBtnDisplayed, setBackBtnDisplayed] = useState(true);

    const [columns, setColumns] = useState([]);

      function createData(
        name,
        code,
        population,
        size
      ) {
        const density = population / size;
        return { name, code, population, size, density };
      }

      
    const [rows,setRows] = useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
    };


    const fetchDatasetInfo = (datasetId)=>{
      axios.get(DATASET_FETCH_DATASET_INFO(datasetId))
      .then(resp => { setFetchedDatasetInfo(resp.data)})
      .catch(err => {console.log(err)})
    }

    const fetchDatasetSnippet = (datasetId) =>{
      axios.get(DATASET_FETCH_DATASET_SNIPPET(datasetId))
      .then(resp => { setsnippet(resp.data) })
      .catch(err => {console.log(err)})
    }

    const populateColumns = ()=>{

      if(snippet.length != 0){
        const sampleObjectKeys = Object.keys(snippet[0]);
        const newColumnsList = sampleObjectKeys.map((id)=>{
          const newObj = {
            id:id,
            label:id,
            minWidth: 170,
            align: 'right',
            format: (value) => value,
          }
          return newObj;
        });
        setColumns(newColumnsList)
      }
        
    }

    const populateRows = () =>{
        setRows(snippet);
    }

    useEffect(()=>{
      populateColumns();
      populateRows();
    },[snippet])

    useEffect(()=>{
      fetchDatasetInfo(props.selectedDatasetId);
      fetchDatasetSnippet(props.selectedDatasetId);

      if(props.notBtnDisplayed == false){
        setBackBtnDisplayed(false);
      }
    },[])

    useEffect(()=>{
  
      if(snippet.length !=0 && Object.keys(fetchedDatasetInfo).length!=0){
        setIsLoading(false);
      }
      
    },[snippet,fetchedDatasetInfo])



    return(
        <div>
           {backBtnDisplayed && <p className="back-btn" onClick={()=>{props.handleDisplayDataSetInfo();}}><FontAwesomeIcon icon={faAnglesLeft}/></p> }
            <h1>{props.selectedDatasetName}</h1>
            {isLoading && 
              <>
                <div className="loading-spinner"></div>
                <div>Loading...</div>
              </>
            }
            {!isLoading&&  
                <div className="data-set-info-section">
                  <p className="about-dataset-text">About Dataset</p>
                  <p> &nbsp; &nbsp;  {fetchedDatasetInfo.about}</p>
                  <p className="about-dataset-text">Authors</p>
                  {fetchedDatasetInfo.authors.map((value,index)=>{
                     return <p key={index}> &nbsp; &nbsp;  {value}</p>
                  })}
                  
                  <p className="about-dataset-text">Keywords</p>
                  <div className="keywords-container">
                  {fetchedDatasetInfo.keywords.map((value,index)=>{
                    return <div className="keywords-bubble" key={index}>{value}</div>
                  })}
            
                  </div>
                  <Paper sx={{ width: '100%',marginTop:"30px", overflow: 'hidden' }}>
                      <TableContainer sx={{ maxHeight: 940 }}>
                          <Table stickyHeader aria-label="sticky table">
                          <TableHead>
                              <TableRow>
                              {columns.map((column) => (
                                  <TableCell
                                  key={column.id}
                                  align={column.align}
                                  style={{ minWidth: column.minWidth }}
                                  >
                                  {column.label}
                                  </TableCell>
                              ))}
                              </TableRow>
                          </TableHead>
                          <TableBody>
                              {rows
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((row) => {
                                  return (
                                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                      {columns.map((column) => {
                                      const value = row[column.id];
                                      return (
                                          <TableCell key={column.id} align={column.align}>
                                          {column.format && typeof value === 'number'
                                              ? column.format(value)
                                              : value}
                                          </TableCell>
                                      );
                                      })}
                                  </TableRow>
                                  );
                              })}
                          </TableBody>
                          </Table>
                      </TableContainer>
                      <TablePagination
                          rowsPerPageOptions={[10, 25, 100]}
                          component="div"
                          count={rows.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={handleChangePage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                      />
                  </Paper>
                  <div className="dataset-info-toolbox">
                    {backBtnDisplayed && <Button variant="contained" sx={{marginTop:"40px"}}>Select this dataset</Button>}  
                    {backBtnDisplayed && <Button variant="contained" sx={{marginTop:"40px"}}>Donwload CSV</Button>}  
                      
                  </div>
              </div>
            }
        </div>
    );

}
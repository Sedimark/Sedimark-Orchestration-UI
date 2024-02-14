import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import style from "./ModelDetails.css";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import Divider from '@mui/material/Divider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { GET_PARAMETERS_FOR_MODEL, GET_METRICS_FOR_MODEL } from "../../../../../utils/apiEndpoints";
import axios from "axios";
import { styled } from '@mui/system';


function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;
  
    const handleFirstPageButtonClick = (event) => {
      onPageChange(event, 0);
    };
  
    const handleBackButtonClick = (event) => {
      onPageChange(event, page - 1);
    };
  
    const handleNextButtonClick = (event) => {
      onPageChange(event, page + 1);
    };
  
    const handleLastPageButtonClick = (event) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
  
    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    );
  }
  
  TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
  };
  
  function createData(name, calories, fat) {
    return { name, calories, fat };
  }
  





export const ModelDetails = (props) =>{

  /*
    {
      "parameter_name":"This is the parameter name",
      "parameter_value":"This is the parameter value"
    }
  */
    const [rowsParameters, setRowsParameters] = useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [isDataLoading, setIsDataLoading] = React.useState(true);
    const [rowsMetrics, setRowsMetrics] = React.useState([]);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rowsParameters.length) : 0;
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

 
    const truncateString = (inputString, maxLength)=>{
        if (inputString.length <= maxLength) {
          return inputString;
        } else {
          return inputString.slice(0, maxLength) + "...";
        }
    }

    const parseParameters = (parameters)=>{
        const paramArr = [];
        Object.entries(parameters).forEach(([key,value])=>{
          const paramObj = {
            "parameter_name":key,
            "parameter_value":value[0]
          }

          paramArr.push(paramObj);
        })
        setRowsParameters(paramArr);
    }

    const parseMetrics = (metrics)=>{
      const metricsArr = [];
      Object.entries(metrics).forEach(([key,value])=>{
        const paramObj = {
          "parameter_name":key,
          "parameter_value":value[0]
        }

        metricsArr.push(paramObj);
      })
      setRowsMetrics(metricsArr);
    }

      const fetchParametersForModel = async()=>{
       
        try{
            const response = await axios.get(GET_PARAMETERS_FOR_MODEL(props.model_data.model_name));
            setIsDataLoading(false);
            parseParameters(response.data);
          } catch(err){
              setIsDataLoading(false);
              console.log(err);
          }
      }

      const fetchMetricsForModel = async ()=>{
        try{
          const response = await axios.get(GET_METRICS_FOR_MODEL(props.model_data.model_name));
          console.log(response);
        } catch(err){
            
            console.log(err);
        }
      }

      useEffect(()=>{
        fetchParametersForModel();
        fetchMetricsForModel();
      },[])

    return(
    <div className="model-details-container">
      <div>
        <FontAwesomeIcon icon={faArrowLeft}  onClick={()=>{props.handleSwitch()}} className="left-icon"/>
      </div>
        <h1>Model Details</h1>    
        {
                isDataLoading &&
                <div className='data-loading-container'>
                  <div className="loading-circle-container">
                      <div className="loading-circle"></div>
                      <p className="loading-text">Loading...</p>
                  </div>
                </div>
        }
        {
            !isDataLoading && 
             <div className="params-container">
                <p className="param-title"><span className="param-name"> Name: </span> {props.model_data.model_name} </p>
                <Divider/>
                <p className="param-title"><span className="param-name"> Date:</span> {props.model_data.model_date}</p>
                <Divider/>
                <div className="param-title">
                    <p className="param-name"> Parameters:</p>
                    <TableContainer component={Paper} sx={{marginTop:"10px", marginBottom:"20px"}}>
                      <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                        <TableBody>
                        {(rowsPerPage > 0
                            ? rowsParameters.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : rowsParameters
                        ).map((row) => (
                            <TableRow key={row.parameter_name}>
                            <TableCell component="th" scope="row" style={{ fontSize:"1.1rem" }}>
                                {row.parameter_name}
                            </TableCell>
                            <TableCell style={{ width: 160 }} align="right" style={{ fontSize:"1.1rem" }}>
                                {row.parameter_value}
                            </TableCell>
                           
                            </TableRow>
                        ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                            </TableRow>
                        )}
                        </TableBody>
                        <TableFooter>
                        <TableRow>
                            <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={3}
                            count={rowsParameters.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            SelectProps={{
                                inputProps: {
                                'aria-label': 'rows per page',
                                },
                                native: true,
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                        </TableFooter>
                    </Table>
                  </TableContainer>
                </div>
                <Divider/>
                <div className="param-title">
                    <p className="param-name"> Metrics:</p>
                    <TableContainer component={Paper} sx={{marginTop:"10px", marginBottom:"20px"}}>
                      <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                        <TableBody>
                        {(rowsPerPage > 0
                            ? rowsMetrics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : rowsMetrics
                        ).map((row) => (
                            <TableRow key={row.name}>
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell style={{ width: 160 }} align="right">
                                {row.calories}
                            </TableCell>
                            </TableRow>
                        ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                            </TableRow>
                        )}
                        </TableBody>
                        <TableFooter>
                        <TableRow>
                            <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={3}
                            count={rowsMetrics.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            SelectProps={{
                                inputProps: {
                                'aria-label': 'rows per page',
                                },
                                native: true,
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                        </TableFooter>
                    </Table>
                  </TableContainer>
                  <Divider/>
                </div>
                <div>
                    <p className="param-name">Training metrics</p>
                </div>
            </div>
        }
        
    </div>
    );
}
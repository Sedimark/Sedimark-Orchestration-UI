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
import { faArrowLeft, faBoxOpen,faChartColumn, faImage } from '@fortawesome/free-solid-svg-icons';
import { GET_PARAMETERS_FOR_MODEL, GET_METRICS_FOR_MODEL, GET_TRAINING_METRICS_IMAGES } from "../../../../../utils/apiEndpoints";
import { formatString } from "../../../../../utils/formatString";
import axios from "axios";


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
  



export const ModelDetails = (props) =>{

    const [rowsParameters, setRowsParameters] = useState([]);
    const [page, setPage] = React.useState(0);
    const [pageParameters, setPageParameters] = React.useState(0);
    const [pageMetrics, setPageMetrics] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rowsPerPageMetrics, setRowsPerPageMetrics] = React.useState(5);
    const [rowsPerPageParameters, setRowsPerPageParameters] = React.useState(5);
    const [isDataLoading, setIsDataLoading] = React.useState(false);
    const [rowsMetrics, setRowsMetrics] = React.useState([]);
    const [hasParametersLoaded, setHasParametersLoaded] = React.useState(false);
    const [hasMetricsLoaded, setHasMetricsLoaded] = React.useState(false);
    const [hasTrainingMetricsImagesLoaded, setHasTrainingMetricsImagesLoaded] = React.useState(false);
    const [metricsImages, setMetricsImages] = React.useState([]);
    const [modelVersion, setModelVersion] = React.useState("");

    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rowsParameters.length) : 0;
  

  
    const handleChangePage = (event, newPage, menuType) =>{
      if(menuType == "parameters"){
        setPageParameters(newPage);  
      } else if (menuType == "metrics"){
        setPageMetrics(newPage);
      }
    }

    const handleChangeRowsPerPage = (event, menuType) => {
      if(menuType == "parameters"){
        setRowsPerPageParameters(parseInt(event.target.value, 10));
        setPageParameters(0);
      } else if(menuType == "metrics"){
        setRowsPerPageMetrics(parseInt(event.target.value, 10));
        setPageMetrics(0);
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
          "metric_name":key,
          "metric_value":value
        }

        metricsArr.push(paramObj);
      })
      
      setRowsMetrics(metricsArr);
    }

    const parseImagesMetrics = (images_obj)=>{
      const imagesMetricsArr = [];
      Object.entries(images_obj).forEach(([key,value])=>{
        const paramObj = {
          "image_metric_name":key,
          "image_metric_source":value
        }

        imagesMetricsArr.push(paramObj);
      })
      
      setMetricsImages(imagesMetricsArr);
    }

      const fetchParametersForModel = async()=>{
       
        try{
            const response = await axios.get(GET_PARAMETERS_FOR_MODEL(props.model_data.model_name, modelVersion));
            
            setHasParametersLoaded(true);
            parseParameters(response.data);
          } catch(err){
              setIsDataLoading(false);
              setHasParametersLoaded(true);
              console.log(err);
          }
      }

      const fetchMetricsForModel = async ()=>{
        try{
          const response = await axios.get(GET_METRICS_FOR_MODEL(props.model_data.model_name, modelVersion));
          parseMetrics(response.data);
          setHasMetricsLoaded(true);
        } catch(err){
            setHasMetricsLoaded(true);
            console.log(err);
        }
      }

      const fetchTrainingMetrics = async ()=>{
        try{
          const response = await axios.get(GET_TRAINING_METRICS_IMAGES(props.model_data.model_name, modelVersion));
          parseImagesMetrics(response.data);
          setHasTrainingMetricsImagesLoaded(true);
        } catch(err){
            console.log(err);
            setHasTrainingMetricsImagesLoaded(true);
        }
      }


      const imageParse = (imgName)=>{
        const newImgName = imgName.split(".")[0].toUpperCase();
        return newImgName;
      }

      const truncateString = (inputString)=> {
        const maxLength = 13;
        inputString = `${inputString}`
        if (inputString.length <= maxLength) {
          return inputString;
        } else {
          return inputString.substring(0, maxLength) + '...';
        }
      }



      useEffect(()=>{
        if(modelVersion.length!=0){
          fetchParametersForModel();
          fetchMetricsForModel();
          fetchTrainingMetrics();
        }
      
      },[modelVersion])

      
       useEffect(()=>{
          console.log("props:");
          console.log(props);
        if(props.allModelVersions.hasOwnProperty(props.model_data.model_name)){
          console.log("HELLO I AM HERE!!")
          setModelVersion(props.allModelVersions[props.model_data.model_name]);
        } else {
          setModelVersion("");
        }
       },[props])


     
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
        
           
             <div className="params-container">
                <p className="param-title"><span className="param-name"> Name: </span> {formatString(props.model_data.model_name)} </p>
                <Divider/>
                <p className="param-title"><span className="param-name"> Date:</span> {props.model_data.model_date}</p>
                <Divider/>
                <div className="param-title">
                    <p className="param-name"> Parameters:</p>

                  {
                      hasParametersLoaded && rowsParameters.length!=0 &&
                      <TableContainer component={Paper} sx={{marginTop:"10px", marginBottom:"20px"}}>
                        <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                          <TableBody>
                          {(rowsPerPage > 0
                              ? rowsParameters.slice(pageParameters * rowsPerPageParameters, pageParameters * rowsPerPageParameters + rowsPerPageParameters)
                              : rowsParameters
                          ).map((row) => (
                              <TableRow key={formatString(row.parameter_name)}>
                              <TableCell component="th" scope="row" style={{ fontSize:"1.1rem" }}>
                                  {formatString(row.parameter_name)}
                              </TableCell>
                              <TableCell style={{ width: 160 }} align="right" sx={{ fontSize:"1.1rem" }} title={row.parameter_value}>
                                  {truncateString(row.parameter_value)}
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
                              rowsPerPage={rowsPerPageParameters}
                              page={pageParameters}
                              SelectProps={{
                                  inputProps: {
                                  'aria-label': 'rows per page',
                                  },
                                  native: true,
                              }}
                              onPageChange={(ev,page) =>{ handleChangePage(ev, page, "parameters")}}
                              onRowsPerPageChange={(ev) =>{ handleChangeRowsPerPage(ev, "parameters"); }}
                              ActionsComponent={TablePaginationActions}
                              />
                          </TableRow>
                          </TableFooter>
                      </Table>
                    </TableContainer>

                  }
                  {
                    hasParametersLoaded && rowsParameters.length == 0 && 
                    <div className="no-parameters-container">
                        <FontAwesomeIcon icon={faBoxOpen} className="empty-page-icon" />
                        <p>There are no parameters!</p>
                    </div>  
                  }
                   {
                    !hasParametersLoaded && 
                      <div className='data-loading-container'>
                        <div className="loading-circle-container">
                            <div className="loading-circle">
                            </div>
                            <p className="loading-text loading-text-section">Loading...</p>
                        </div>
                      </div>
                    }
                    
                </div>
                <Divider/>
                <div className="param-title">
                    <p className="param-name"> Metrics:</p>

                    {
                      hasMetricsLoaded && rowsMetrics.length == 0 && 
                      <div className="no-parameters-container">
                          <FontAwesomeIcon icon={faChartColumn} className="empty-page-icon" />
                          <p>There are no metrics!</p>
                      </div>  
                    }
                    {
                      hasMetricsLoaded && rowsMetrics.length!==0 &&
                       <TableContainer component={Paper} sx={{marginTop:"10px", marginBottom:"20px"}}>
                            <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
                              <TableBody>
                              {(rowsPerPage > 0
                                  ? rowsMetrics.slice(pageMetrics * rowsPerPage, pageMetrics * rowsPerPage + rowsPerPage)
                                  : rowsMetrics
                              ).map((row) => (
                                  <TableRow key={formatString(row.metric_name)}>
                                  <TableCell component="th" scope="row" style={{ fontSize:"1.1rem" }}>
                                      {formatString(row.metric_name)}
                                  </TableCell>
                                  <TableCell style={{ width: 160 }} align="right" sx={{ fontSize:"1.1rem" }} title={row.metric_value}>
                                      {truncateString(row.metric_value)}
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
                                  rowsPerPage={rowsPerPageMetrics}
                                  page={page}
                                  SelectProps={{
                                      inputProps: {
                                      'aria-label': 'rows per page',
                                      },
                                      native: true,
                                  }}
                                  onPageChange={(ev, page)=>{handleChangePage(ev, page, "metrics")}}
                                  onRowsPerPageChange={(ev) => { handleChangeRowsPerPage(ev, "metrics");}}
                                  ActionsComponent={TablePaginationActions}
                                  />
                              </TableRow>
                              </TableFooter>
                          </Table>
                      </TableContainer>
                    }

                    {
                      !hasMetricsLoaded && 
                        <div className='data-loading-container'>
                          <div className="loading-circle-container">
                              <div className="loading-circle">
                              </div>
                             <p className="loading-text loading-text-section">Loading...</p>
                          </div>
                       </div>
                    }
                    
                  <Divider/>
                </div>
                <div>
                    <p className="param-name">Model Images</p>
                  {
                    hasTrainingMetricsImagesLoaded &&  metricsImages.length == 0 && 
                      <div className="no-parameters-container">
                        <FontAwesomeIcon icon={faImage} className="empty-page-icon" />
                        <p>There are no images for metrics!</p>
                      </div>  
                  }

                  {
                    hasTrainingMetricsImagesLoaded && metricsImages.map((img)=>{
                        
                      return(
                      <div>
                          <div className="img-container">
                            <img src = {img.image_metric_source} width={600}/>
                          </div>

                          <figcaption className="img-caption"> {imageParse(img.image_metric_name)} </figcaption>
                      </div>
                      )

                    })
                  }


                {
                      !hasTrainingMetricsImagesLoaded && 
                        <div className='data-loading-container'>
                          <div className="loading-circle-container">
                              <div className="loading-circle">
                              </div>
                             <p className="loading-text loading-text-section">Loading...</p>
                          </div>
                       </div>
                    }
                </div>
            </div>
        
        
    </div>
    );
}
import React from "react";
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
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { styled } from '@mui/system';


export const AllModelsTable = (props)=>{

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

    return(
        <div>
            
              {
                props.allModelsData.length === 0 && 
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
                props.allModelsData.length !=0 && 
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                      <TableHead>
                        <TableRow >
                           <StyledTableCell sx={{ fontSize:"1.1rem" }}>Model Name</StyledTableCell>
                           <StyledTableCell align="left" sx={{ fontSize:"1.1rem" , paddingLeft:"40px"}}>Date</StyledTableCell>
                           <StyledTableCell align="left" sx={{ fontSize:"1.1rem" , paddingLeft:"40px"}}>Predict</StyledTableCell>
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
                             <Button variant="contained"   sx={{ width: 150,
                                                                                                color: 'white',
                                                                                                backgroundColor:"green",
                                                                                                "&:hover": {
                                                                                                  backgroundColor: '#00cc30',
                                                                                                  color: '#fff',
                                                                                              }
                                                                                      }}
                                     onClick={()=>{handleSeeMore({model_name:row.name, model_date:row.creation_date})}} 
                                     endIcon={<LibraryAddCheckIcon/>}>Select</Button>
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

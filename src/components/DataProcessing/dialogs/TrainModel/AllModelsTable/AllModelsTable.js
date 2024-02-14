import React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Button from '@mui/material/Button';
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

    return(
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                      <TableHead>
                        <TableRow >
                           <StyledTableCell sx={{ fontSize:"1.1rem" }}>Model Name</StyledTableCell>
                           <StyledTableCell align="left" sx={{ fontSize:"1.1rem" , paddingLeft:"40px"}}>Date</StyledTableCell>
                           <StyledTableCell align="right" sx={{ fontSize:"1.1rem" }}>Full Data</StyledTableCell>
                         </TableRow>
                       </TableHead>
                      <TableBody>
                      { props.allModelsData.length!=0 &&  props.allModelsData.map((row) => (
                           <StyledTableRow key={row.model_name}>
                             <StyledTableCell align="left">
                               <p title={row.model_name}>{truncateString(row.model_name,21)}</p>
                             </StyledTableCell>
                             <StyledTableCell align="left">{row.date}</StyledTableCell>
                             <StyledTableCell align="right"><Button variant="contained"   sx={{ width: 150,
                                                                                                color: 'white',
                                                                                                backgroundColor:"#2431bd"
                                                                                      }}
                                     onClick={props.handleSwitch} 
                                     endIcon={<OpenInNewIcon/>}>See more</Button></StyledTableCell>

                           </StyledTableRow>
                         ))}
                       </TableBody>
                     </Table>
              </TableContainer>
    );

}
import React, { memo, useState,useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import styles from "./BaseNodesStyles.css";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDispatch } from 'react-redux';
import { useSelector } from "react-redux/es/hooks/useSelector";
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { setNodes, resetSelectedModelType} from "../../../reducers/nodeSlice";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}
 
export default memo(({ data, isConnectable }) => {
 
  const [nodeName, setNodeName] = useState("");
  const [fullNodeName, setFullNodeName] = useState("");
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

  const dispatch = useDispatch();
  const allNodes = useSelector((state)=>state.nodes);
  const [variablesPresent, setVariablesPresent] = useState(false);
  const [allColumns, setAllColumns] = useState([]);
  const rows = [
    createData('Training loss', 159),
    createData('Validation Loss', 237),
    createData('Training Accuracy', 262)
  ];

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const deleteNode = ()=>{
    let newNodeList = [...allNodes];
    newNodeList = newNodeList.filter((node)=> node.nodeData.type!=="Model Training");
    dispatch(setNodes(newNodeList));
    setTimeout(()=>{
      dispatch(resetSelectedModelType());
    },100)
  }

  const processName = (str)=>{
    const truncateString = "...";
    const maxLength = 29;
    if(str.length > maxLength){
       setNodeName(str.substring(0, maxLength) + truncateString);
    } else {
      setNodeName(str);
    }
  }
  

  useEffect(()=>{
    processName(data.name);
    setFullNodeName(data.name);
  },[])


 
  return (
    <div style={{ width:"400px", borderRadius:"6%",padding:"0px",border:"2px solid yellow", backgroundColor:"#f5ffcd", minHeight:"200px" }}>
        <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{padding:"10px",border:"4px solid #e9e008"}}
        isConnectable={isConnectable}
      />
      <div> 
      
       <div className='export-node-header node-header-filter model-training-card-header'>
            <p className='exporter-node-header-title' title={fullNodeName}> {nodeName? nodeName:"Custom"}</p>
        </div>   

        {variablesPresent && 
          <div className='base-node-info-section-container'>
                <h3> Variables</h3>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 200 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Variable Name</StyledTableCell>
                        <StyledTableCell align="right">Value</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allColumns.map((row,index) => (
                        <StyledTableRow key={index}>
                          <StyledTableCell component="th" scope="row">
                            {row.name}
                          </StyledTableCell>
                          <StyledTableCell align="right">{row.algType}</StyledTableCell>
                    
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              
              <div className='custom-node-bottom-toolbox'>
                  <button className='custom-node-toolbox-btn'onClick={()=>{}}> Edit Variables <FontAwesomeIcon icon={faArrowUpRightFromSquare}/></button>
              </div>
          </div>
         }
        {
          !variablesPresent && <FontAwesomeIcon icon={faDiagramProject} className='empty-node-container' /> 
        }


      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{padding:"10px",border:"4px solid #e9e008"}}
        isConnectable={isConnectable}
      />
    </div>
  );
});

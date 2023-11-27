import React, {useEffect} from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Typography } from '@mui/material';
import {useDispatch} from 'react-redux';
import { useSelector } from "react-redux/es/hooks/useSelector";
import AIModelDialogInfo from "../AIModelsDialogInfo/AIModelDialogInfo";
import {addNode, setSelectedModelType, setNodes, resetSelectedModelType} from "../../../../reducers/nodeSlice";

export default function AIModels (props) {

    const dispatch = useDispatch();
    const allNodes = useSelector((state)=>state.nodes);
    const storedNodes = useSelector((state)=>state.nodes);
    const selectedModel = useSelector((state)=>state.selectedModelType)
    const [checked, setChecked] = React.useState([]);
    const [dataSetSearch,setDatasetSearch] = React.useState(true);
    const [displayMoreInfo, setDisplayMoreInfo] = React.useState(false);
    const [selectedMLAlgorithm , setSelectedMLAlgorithm] = React.useState("");

    const handleDisplayDataSetInfo = () =>{
      setDatasetSearch(!dataSetSearch);
      setDisplayMoreInfo(true);
    }

    const deleteNode = ()=>{
      let newNodeList = [...allNodes];
      newNodeList = newNodeList.filter((node)=> node.nodeData.type!=="Model Training");
      setTimeout(()=>{
        dispatch(setNodes(newNodeList));
      },200)
      
      setTimeout(()=>{
        dispatch(resetSelectedModelType());
      },100)
  
    }
 
    const handleDisplayAlgInfo = ()=>{
      setDisplayMoreInfo(false);
    }
  
    const handleToggle = (value) => () => {
    
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
      
      if(newChecked.length == 1){
        if(currentIndex != -1){
          newChecked.pop();
         
        } else {
          newChecked.pop();
          newChecked.push(value);
        }
      } else {
        if (currentIndex === -1) {
          newChecked.push(value);
        } 
      }
      setChecked(newChecked);
    };
   
  
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });
  
    const allAlgorithms = ['Procedure name','ResNet (Residual Neural Network)','BERT (Bidirectional Encoder Representations from Transformers)','Random Forest','SVM (Support Vector Machine)']
   
    const appliedMLModels = ()=>{
      
      if(checked.length!=0){
          for(const node of storedNodes){
            if(node.nodeData.type == "Model Training")
            {
              return;
            }
          }
      } else {
      
        deleteNode();
      }
      const newNodePayload = {
        type:"Model Training"
      }
   
      dispatch(addNode(newNodePayload));
     
    }

    const setModel = ()=>{
      dispatch(setSelectedModelType(checked[0]));
    }

    useEffect(()=>{
      setChecked([selectedModel]);
    },[selectedModel])


    return(
        <div>

    <ThemeProvider theme={darkTheme}>
      <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="600" fullWidth="true" >
           <DialogTitle> ML Models </DialogTitle>
          {!displayMoreInfo && 
                <DialogContent>   
                    <List dense sx={{ width: '100%', bgcolor: 'background.paper', marginTop:"10px" }}>
                    {allAlgorithms.map((value,index) => {
                      const labelId = `checkbox-list-secondary-label-${value}`;
                      if(index == 0){
                          return(
                            <ListItem
                            key={value}
                            secondaryAction={
                              <div className='dataset-select-toolbox'>
                                <p>Select</p>
                                <p>More Info</p>
                              </div>
                            }
                            disablePadding
                            sx={{
                              padding:"15px",
                              pointerEvents:"none"
                            }}
                          >
                            <ListItemButton>
                              
                              <ListItemText  id={labelId}  disableTypography
                              primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>Procedure Name</Typography>} />
                            </ListItemButton>
                          </ListItem>
                          );
                      } else {
                      return (
                        <ListItem
                          key={value}
                          secondaryAction={
                            <div className='dataset-select-toolbox'>
                              <Checkbox
                                edge="end"
                                onChange={handleToggle(value)}
                                checked={checked.indexOf(value) !== -1}
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                              <Button variant="outlined" onClick={()=>{handleDisplayDataSetInfo(); setSelectedMLAlgorithm(allAlgorithms[index])}}>Info</Button>
                            </div>
                          }
                          disablePadding
                          sx={{
                            padding:"15px"
                          }}
                        >
                          <ListItemButton>
                            <ListItemAvatar>
                              <p className='select-dialog-list'><FontAwesomeIcon icon={faChartLine}/></p> 
                            </ListItemAvatar>
                            <ListItemText  id={labelId}  disableTypography
                            primary={<Typography variant="body2" style={{ color: '#FFFFFF',fontSize:"1.3rem" }}>{value}</Typography>} />
                          </ListItemButton>
                        </ListItem>
                      );
                      } 
                    })}
                  </List>
            </DialogContent> 
           }

           {displayMoreInfo && <AIModelDialogInfo handleClose={handleDisplayAlgInfo} selectedMLAlgorithm={selectedMLAlgorithm} />}
          
            <DialogActions>
              <Button onClick={props.handleClose}>Close</Button>
              <Button onClick={()=>{props.handleClose(); appliedMLModels(); setModel()}}>Apply</Button>
            </DialogActions>

          
      </Dialog>
      </ThemeProvider>
    </div>
    );
}
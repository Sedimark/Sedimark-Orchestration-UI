import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DialogTitle from '@mui/material/DialogTitle';
import axios from "axios";
import { FETCH_ALL_BLOCKS } from '../../../../utils/apiEndpoints';
import {useDispatch, useSelector} from 'react-redux';
import { faCircleInfo, faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';
import { formatString } from '../../../../utils/formatString';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { v4 as uuidv4 } from 'uuid';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {setPipelineStudioNodes, setBlockCatalogSelectedOptions, setPipelineStudioEdgeToDelete} from "../../../../reducers/nodeSlice.js";
import style from "./BlockCatalog.css";
 
export default function BlockCatalog(props) {

  const blockCatalogSelectedOptions = useSelector((state)=> state.blockCatalogSelectedOptions);
  const currentBlocks = useSelector((state)=> state.pipelineStudioNodes);
  const allEdges = useSelector((state)=>state.pipelineStudioEdges);
  const [firstRender, setFirstRender] = useState(true);
  const [blocksAreLoading, setBlocksAreLoading] = useState(false);
  const [transformerBlocks, setTransformerBlocks] = useState([]);
  const [dataLoaderBlocks, setDataLoaderBlocks] = useState([]);
  const [exporterBlocks, setExporterBlocks] = useState([]);
  const [allSelectedBlocks, setAllSelectedBlocks] = useState([]);
  const [wasSomethingChanged, setWasSomethingChanged] = useState(false);
  const [thereWasAnError, setThereWasAnError] = useState(false);

  const dispatch = useDispatch();
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


  const parseTheBlocks = (allTheBlocks) =>{

    const transformerBlocks = [];
    const dataLoaderBlocks = [];
    const dataExporterBlocks = [];

    for(const block of allTheBlocks){
      
      if(block["type"] === "transformer"){
        transformerBlocks.push(block);
      } else if (block["type"] === "data_loader"){
        dataLoaderBlocks.push(block);
      } else if(block["type"] === "data_exporter") {
        dataExporterBlocks.push(block);
      }
    }

    setTransformerBlocks(transformerBlocks);
    setDataLoaderBlocks(dataLoaderBlocks);
    setExporterBlocks(dataExporterBlocks);
  }

  const truncateString = (inputString, maxLength)=>{
    inputString = inputString.trim();
      if (inputString.length <= maxLength) {
        return inputString;
      } else {
        return inputString.slice(0, maxLength) + "...";
      }
    }

  const fetchAllBlocks = async()=>{
    setBlocksAreLoading(true);
    try{
      const allBlocks = await axios.get(FETCH_ALL_BLOCKS(props.pipelineType));
      
      setBlocksAreLoading(false);
      parseTheBlocks(allBlocks.data);
      setThereWasAnError(false);
    } catch(err){
      setBlocksAreLoading(true);
      setThereWasAnError(true);
      console.log(err);
    }
  
  }

  const handlePlaceBlocks = ()=>{



    props.handleClose();
    const newNodes = [];
    let xPosition = 0;

    //aici tratam cazul 1 unde nu avem niciun block plasat pe interfata

    if(allSelectedBlocks.length === 0){
      dispatch(setPipelineStudioNodes([]))
      return;
    }

    if(currentBlocks.length === 0){
      for(const block of allSelectedBlocks){
      
        if(block.type === "data_loader") {
          const nodeId = uuidv4();
          newNodes.push({
            id:nodeId,
            type:'loader',
            data: { nodeId: nodeId, label: 'Loader', config:{} , name: "Loader", pipelineType: "", fromPipelineStudio:{name:block.name, description:block.description, initialName: block.name}},
            position: { x: xPosition, y: 25 },
          })
        } else if(block.type === "transformer") {
          const nodeId = uuidv4();
          newNodes.push({
            id:nodeId,
            type:'transformer',
            data: { nodeId:nodeId , label: 'Transformer', config:{} , name: "Transformer", pipelineType: "", fromPipelineStudio:{name:block.name, description:block.description, initialName: block.name}},
            position: { x: xPosition, y: 25 },
          })
        } else if(block.type === "data_exporter"){
          const nodeId = uuidv4();
          newNodes.push({
            id:nodeId,
            type:'exporter',
            data: { nodeId:nodeId , label: 'Exporter', config:{} , name: "Exporter", pipelineType: "", fromPipelineStudio:{name:block.name, description:block.description, initialName: block.name}},
            position: { x: xPosition, y: 25 },
          })
        } 
        xPosition += 800; 
      }
      
      dispatch(setPipelineStudioNodes(newNodes))
      
      return;
    }

    
    //cazul 2 deja avem block-uri plasate pe interfata
    // si in acest caz trebuie sa stergem pe cele care sunt pe interfata dar nu si in lista de block-uri selectate

    let newPlacedBlocks = [];
    let blocksToBePlaced = [];
    let nodesToDelete = [];

    if(currentBlocks.length != 0){
        for(const block of currentBlocks){
          //cautam block-ul plasat in lista de blocuri selectate
          // daca nu este inseamna ca a fost deselectat si il vom sterge
          let found = false;
          for(const selectedBlock of allSelectedBlocks){
              if(block.data.fromPipelineStudio.name === selectedBlock.name || block.type === "generated"){
                newPlacedBlocks.push(block);
                found = true;
                break;
              }
          }
          
          if(found === false){
            nodesToDelete.push(block);
          }
      }
    }

    if(nodesToDelete.length !=0 ){
      const edgesToDelete = [];
      for(const node of nodesToDelete){
        for(const edge of allEdges){
          if(edge.source === node.id || edge.target === node.id){
            edgesToDelete.push(edge.id);
          }
        }
      }

      for(const edge of edgesToDelete){
        let i = 1;
        setTimeout(()=>{
          dispatch(setPipelineStudioEdgeToDelete(edge));
        },200*i);
        i++
        
      }

    }
     // 3. adauga block-urile care au fost noi selectate

     for(const selectedBlock of allSelectedBlocks){
      //daca nu gasim block-ul pe interfata atunci il punem in lista de block-uri noi gasite si il spawnam acusica
      let found = false;
      for(const block of currentBlocks){
         if(block.data.fromPipelineStudio.name === selectedBlock.name){
            found = true;
            break;
         }
      }
      if(found === false){
        blocksToBePlaced.push(selectedBlock);
      }

     }

      for(const block of blocksToBePlaced){
      
        if(block.type === "data_loader") {
          const nodeId = uuidv4();
          newPlacedBlocks.push({
            id:nodeId,
            type:'loader',
            data: { nodeId: nodeId, label: 'Loader', config:{} , name: "Loader", pipelineType: "", fromPipelineStudio:{name:block.name, description:block.description}},
            position: { x: xPosition, y: 25 },
          })
        } else if(block.type === "transformer") {
          const nodeId = uuidv4();
          newPlacedBlocks.push({
            id:nodeId,
            type:'transformer',
            data: { nodeId: nodeId, label: 'Transformer', config:{} , name: "Transformer", pipelineType: "", fromPipelineStudio:{name:block.name, description:block.description}},
            position: { x: xPosition, y: 25 },
          })
        } else if(block.type === "data_exporter"){
          const nodeId = uuidv4();
          newPlacedBlocks.push({
            id:nodeId,
            type:'exporter',
            data: { nodeId: nodeId, label: 'Exporter', config:{} , name: "Exporter", pipelineType: "", fromPipelineStudio:{name:block.name, description:block.description}},
            position: { x: xPosition, y: 25 },
          })
        } 
        xPosition += 800; 
      }
      
      dispatch(setPipelineStudioNodes(newPlacedBlocks))
      return;
    


  }

  const handleToggle = (value) => () => {
      
    setWasSomethingChanged(true);
    const currentIndex = allSelectedBlocks.findIndex(data => data.name === value.name);
    const newChecked = [...allSelectedBlocks];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }


    setAllSelectedBlocks(newChecked);
    dispatch(setBlockCatalogSelectedOptions(newChecked));
  };
  

  useEffect(()=>{
   
    if(props.pipelineType.length!==0){
      fetchAllBlocks();
    }
    
  },[props.pipelineType])


    useEffect(()=>{
     
      if( blockCatalogSelectedOptions.length!=0 && firstRender === true){
        
        setAllSelectedBlocks(blockCatalogSelectedOptions);
        setFirstRender(false);
      } 

      if(blockCatalogSelectedOptions.length === 0){
        setWasSomethingChanged(true);
      }

    },[blockCatalogSelectedOptions])


  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            sx={{textAlign:"center", backgroundColor:""}} maxWidth="600" 
            fullWidth={true}
        >
            <DialogTitle id="alert-dialog-title">
            {"Block Catalog"}
            </DialogTitle>
            <DialogContent sx={{ width: '95%', m:"auto", bgcolor: 'background.paper', marginTop:"10px" }}>
              {
                blocksAreLoading && 
                <div className="loading-circle-container" style={{marginTop:"20px"}}>
                  <div className="loading-circle"></div>
                  <p className="loading-text">Loading...</p>
                 </div>
              }
              {
                !blocksAreLoading && !thereWasAnError && 
                <div className='blocks-catalog-container'>
                  <div className='blocks-catalog-section'>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ArrowDropDownIcon />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                    >
                      <div className='blocks-catalog-section-title' > Data Loaders </div>
                    </AccordionSummary>
                    <AccordionDetails>
                    <div className='blocks-catalog-section-blocks-container'>
                        {dataLoaderBlocks.map((block)=>{
                            return(
                             <div>
                                <div className='catalog-block-container catalog-block-container-data-loader'>
                                  <div className='catalog-block-container-data-loader-title' title={`${formatString(block.name)}`}>
                                      {truncateString(formatString(block.name),29)}
                                  </div>
                                    <FontAwesomeIcon icon={faCircleInfo}  className=""/> 
                                  <div>
                                      {block.description}
                                  </div>
                                </div>
                                <Checkbox edge="end"  sx={{
                                color: "#e0e9ff",
                                '&.Mui-checked': {
                                  color: "#e0e9ff",
                                },
                              }} 
                                onChange = {handleToggle(block)}
                                checked = {allSelectedBlocks.find(selectedBlock => selectedBlock.name === block.name)}
                              />
                              </div>
                            )
                          })}
                      </div>  
                    </AccordionDetails>
                  </Accordion>


                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ArrowDropDownIcon />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                    >
                         <div className='blocks-catalog-section-title'> Transformers </div>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className='blocks-catalog-section-blocks-container'>
                          {transformerBlocks.map((block)=>{
                            return(
                            <div>
                              <div className='catalog-block-container catalog-block-container-transformer'>
                                <div className='catalog-block-container-transformer-title' title={`${formatString(block.name)}`}>
                                    {truncateString(formatString(block.name),29)}
                                </div>
                                  <FontAwesomeIcon icon={faCircleInfo}  className=""/> 
                                <div>
                                    {block.description}
                                </div>
                                
                              </div>
                              <Checkbox edge="end" color="secondary" 
                              sx={{
                                color: "#ffdbfe",
                                '&.Mui-checked': {
                                  color: "#ffdbfe",
                                },
                              }} 
                              onChange = {handleToggle(block)}
                              checked = {allSelectedBlocks.find(selectedBlock => selectedBlock.name === block.name)}
                              />
                            </div>
                            
                            )
                          })}
                            
                        </div>
                    </AccordionDetails>
                  </Accordion>


                  <Accordion>
                  <AccordionSummary
                    expandIcon={<ArrowDropDownIcon />}
                    aria-controls="panel2-content"
                    id="panel2-header"
                  >
                         <div className='blocks-catalog-section-title'> Data Exporters </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className='blocks-catalog-section-blocks-container'>
                    {exporterBlocks.map((block)=>{
                          return(
                            <div>
                              <div className='catalog-block-container catalog-block-container-data-exporter'>
                                <div className='catalog-block-container-data-exporter-title' title={`${formatString(block.name)}`}>
                                    {truncateString(formatString(block.name),29)}
                                </div> 
                                  <FontAwesomeIcon icon={faCircleInfo}  className=""/> 
                                <div>
                                    {block.description}
                                </div>
                              </div>
                              <Checkbox edge="end"   sx={{
                                color: "#ece93b",
                                '&.Mui-checked': {
                                  color: "#ece93b",
                                },
                              }} 
                              onChange = {handleToggle(block)}
                              checked = {allSelectedBlocks.find(selectedBlock => selectedBlock.name === block.name)}
                              />
                            </div>
                            
                          )
                      })}
                          
                      </div>
                  </AccordionDetails>
                </Accordion>
        
                </div>
              </div>
              }

              {
                      thereWasAnError && !blocksAreLoading &&
                      <div className='error-container'>
                          <FontAwesomeIcon icon={faScrewdriverWrench} className='error-icon error-msg-big'/>
                          <p className='error-msg-big'>There was an error while fetching the blocks.</p>
                          <p className='error-msg-big'>Please try again later!</p>  
                      </div>
              }
                
            </DialogContent>
            <DialogActions>
            <Button onClick={props.handleClose}>Cancel</Button>
            <Button onClick={()=>{handlePlaceBlocks()}} disabled={allSelectedBlocks.length === 0 || !wasSomethingChanged} autoFocus>
                Place
            </Button>
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

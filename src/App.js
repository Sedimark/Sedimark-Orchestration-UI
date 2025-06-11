import './App.css';
import { useEffect, useState, useRef } from 'react';
import DataProcessing from './components/DataProcessing/DataProcessing.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PipelineCreatorCanvas } from './components/PipelineCreator/PipelineCreatorCanvas/PipelineCreatorCanvas.js';
import { GENERATE_BLOCK_WS, CHECK_BLOCK_WS, ADD_TO_RAG } from './utils/apiEndpoints.js';
import { useSelector } from 'react-redux';
import { setGeneratedBlockCode, setErrorWhileGenerating, setNotifyBlockGenerated, setGeneratedBlockPayload, setStoredGeneratedBlockName, setSocketBlockIsGenerating, setGeneratedBlockResult, setBlockWasGenerated} from "./reducers/nodeSlice.js";
import { useDispatch } from 'react-redux';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { ManageFederatedPipeline } from './components/ManageFederatedPipeline/ManageFederatedPipeline.js';
import NotFound from './components/NotFound/NotFound.js';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import useAuth from "./hooks/useAuth";



function App() {
 
    const generatedBlockCode = useSelector((state)=> state.generatedBlockCode);
    const storedBlockType = useSelector((state)=> state.generatedBlockType);
    const generatedBlockData = useSelector((state)=> state.generatedBlockData);
    const generatedBlockName = useSelector((state)=> state.generatedBlockName);
    const blockPrompt = useSelector((state)=> state.blockPrompt);
    const dispatch = useDispatch();
    const [ws, setWs] = useState(null);
    // const [checkWS, setCheckWs] = useState(null);
    const [blockName, setBlockName] = useState("");
    const [blockResult, setBlockResult] = useState("");
    const [blockType, setBlockType] = useState("");
    const [wsIsOpen, setWsIsOpen]= useState(false);
    const [checkWsIsOpen, setCheckWsIsOpen] = useState(false);
    const reconnectIntervalRef = useRef(null); // Reconnect timer reference
    const wsRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);


    // ** WEBSOCKET THAT GENERATES A BLOCK ** //


    const saveToRag = async()=>{

      try{
          const resp = await axios.post(ADD_TO_RAG,{
            "block_type":storedBlockType,
            "name":generatedBlockName,
            "description":blockPrompt,
            "file":generatedBlockCode
          });
     
      } catch(err){
        console.log("There was an error while adding to the RAG!");
      }
    }


    //** WEBSOCKET THAT CHECKS THE BLOCK **/



    const blockAlert = (msg) => {
      toast.success(msg, {
          duration: 2000,
          position: 'top-right',
      })
    }; 
     
  return (
   
      <div className="App">
        <Router>
            <Routes>
                 <Route element = {<DataProcessing />} path="/"></Route>
                 <Route element = {<PipelineCreatorCanvas/>} path="/pipeline-studio"></Route>
                 <Route element={<ManageFederatedPipeline/>} path="/federated-learning"></Route>
                 <Route element={<NotFound/>} path="*"></Route>
            </Routes>
        </Router>
        <Toaster/>
      </div> 
   
    
  );
}

export default App;

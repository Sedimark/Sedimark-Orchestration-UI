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
import { Shamrock } from './components/Shamrock/Shamrock.js';
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
    const checkWS = useRef(null); // WebSocket reference
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

    const connectWebSocket = ()=>{
      checkWS.current = new WebSocket(CHECK_BLOCK_WS);

      checkWS.current.onopen = () => {      
  
      setCheckWsIsOpen(true);

      };

      checkWS.current.onclose = (event) => {
        setCheckWsIsOpen(false);
       console.log("The websocket checkWS was closed") 
      }

      checkWS.current.onerror = (error)=>{
        setCheckWsIsOpen(false);  
        console.log("There was an error during the connection for checkWS");
      }


      checkWS.current.onmessage = (event) => {
        try{
          const decoded_msg = JSON.parse(event.data);
          
          if(decoded_msg.detail){
            return;
          }  else if(decoded_msg.success == "succes"){
            saveToRag();
          }
        } catch(err){
            console.log(err);
        }
      
      };

    }

    useEffect(() => {
      connectWebSocket();
  
      return () => {
        // Clear the reconnect timeout if it exists
        if (reconnectIntervalRef.current) {
          clearTimeout(reconnectIntervalRef.current);
        }
        // Clean up WebSocket connection
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }, []);


    const blockAlert = (msg) => {
      toast.success(msg, {
          duration: 2000,
          position: 'top-right',
      })
    }; 


    useEffect(()=>{
 

      if(checkWS.current && generatedBlockData){   
        if(checkWS.current.readyState == WebSocket.OPEN ){
          
          if(generatedBlockData && generatedBlockData.block_type && generatedBlockData.block_type.length!=0){
             checkWS.current.send(JSON.stringify({
              "block_type": storedBlockType,
              "content": generatedBlockData.content
            }));
          }
           
        }    
      }
    },[generatedBlockData, checkWS, checkWsIsOpen])
     
  return (
   
      <div className="App">
        <Router>
            <Routes>
                 <Route element = {<DataProcessing />} path="/"></Route>
                 <Route element = {<PipelineCreatorCanvas/>} path="/pipeline-studio"></Route>
                 <Route element={<Shamrock/>} path="/shamrock"></Route>
            </Routes>
        </Router>
        <Toaster/>
      </div> 
   
    
  );
}

export default App;

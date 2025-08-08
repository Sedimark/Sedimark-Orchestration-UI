import './App.css';
import { useEffect, useState, useRef } from 'react';
import DataProcessing from './components/DataProcessing/DataProcessing.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PipelineCreatorCanvas } from './components/PipelineCreator/PipelineCreatorCanvas/PipelineCreatorCanvas.js';
import { ADD_TO_RAG } from './utils/apiEndpoints.js';
import { useSelector } from 'react-redux';
import { ManageFederatedPipeline } from './components/ManageFederatedPipeline/ManageFederatedPipeline.js';
import NotFound from './components/NotFound/NotFound.js';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';


function App() {
 
    const generatedBlockCode = useSelector((state)=> state.generatedBlockCode);
    const storedBlockType = useSelector((state)=> state.generatedBlockType);
    const generatedBlockName = useSelector((state)=> state.generatedBlockName);
    const blockPrompt = useSelector((state)=> state.blockPrompt);

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

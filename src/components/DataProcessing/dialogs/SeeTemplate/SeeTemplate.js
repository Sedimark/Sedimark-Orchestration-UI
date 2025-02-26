import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import ControlledEditor from '@monaco-editor/react';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import toast  from 'react-hot-toast';
import style from "./SeeTemplate.css";



export const SeeTemplate = (props)=>{

    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });

    const [editorValue, setEditorValue] = useState(`
        node:
          port: 8182
          node_id: server
        dataset:
          builtin_dataset: 'mnist'
          n_splits: 1
          split_index: 0
          node_id: server
          n_workers_torch: 0
        topology:
          topology_name: FederatedServer
          local_epochs: 1
          max_iter: 5
          log_file: 'metrics.txt'
        model:
          optimizer: Adam
          lr: 0.0001
          batch_size: 512
          loss: BinaryCrossentropy
          metrics: 
            - accuracy_score
        seed: 12645
        framework: keras
        log_file: results/server.txt
        stop_condition:
          condition: fed_server
          max_aggr: 1000
          max_time: 3000
          metric_name: accuracy_score
          metric_min: 0.7
        `);
        


    const [defaultEditorValue, setDefaultEditorValue] = useState(`
        node:
          port: 8182
          node_id: server
        dataset:
          builtin_dataset: 'mnist'
          n_splits: 1
          split_index: 0
          node_id: server
          n_workers_torch: 0
        topology:
          topology_name: FederatedServer
          local_epochs: 1
          max_iter: 5
          log_file: 'metrics.txt'
        model:
          optimizer: Adam
          lr: 0.0001
          batch_size: 512
          loss: BinaryCrossentropy
          metrics: 
            - accuracy_score
        seed: 12645
        framework: keras
        log_file: results/server.txt
        stop_condition:
          condition: fed_server
          max_aggr: 1000
          max_time: 3000
          metric_name: accuracy_score
          metric_min: 0.7
        `);

    const blockSuccess = (msg) => {
        toast.success(msg, {
            duration: 2000,
            position: 'top-right',
        })
    }; 

    const blockAlert = (msg) => {
        toast.error(msg, {
            duration: 4000,
            position: 'top-right',
        })
    };

    const handleCopy = () => {

        const textToCopy = `
        node:
          port: 8182
          node_id: server
        dataset:
          builtin_dataset: 'mnist'
          n_splits: 1
          split_index: 0
          node_id: server
          n_workers_torch: 0
        topology:
          topology_name: FederatedServer
          local_epochs: 1
          max_iter: 5
          log_file: 'metrics.txt'
        model:
          model_uri:"http://some-url"
          optimizer: Adam
          lr: 0.0001
          batch_size: 512
          loss: BinaryCrossentropy
          metrics: 
            - accuracy_score
        seed: 12645
        framework: keras
        log_file: results/server.txt
        stop_condition:
          condition: fed_server
          max_aggr: 1000
          max_time: 3000
          metric_name: accuracy_score
          metric_min: 0.7
        `;

        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            blockSuccess("Copied to clipboard!");
          })
          .catch((err) => {
            blockAlert("Failed to copy");
            console.err(err);
          });
      };

  
    return(
        <ThemeProvider theme={darkTheme}>
        <Dialog
        open={props.open}
        fullWidth={true}
        maxWidth="lg"
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
       
    >
        <DialogTitle id="alert-dialog-title">
        {"Template"}
        </DialogTitle>
         <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <div className='code-editor-container'> 
                <div className="code-editor-dialog-controls">
                    <Button variant='contained' style={{fontWeight:"bold"}} color='error' onClick={()=>{props.closeDialog()}}>Close Template</Button>
                    <Button variant='contained' style={{backgroundColor:"#0602f2", color:"#fff", fontWeight:"bold"}} onClick={()=>{handleCopy()}}>Copy template code</Button>
                </div>
               
                    <ControlledEditor options={{
                    readOnly: true, // Set the editor to read-only mode
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    contextmenu: false
                }} height="60vh" className='code-editor' defaultLanguage="yaml" editable={false}  theme="vs-dark" value={editorValue} onChange={()=>{setEditorValue(defaultEditorValue)}} />

                </div>      
          </DialogContentText>
        </DialogContent>
       </Dialog>
    </ThemeProvider>
        
    );
}
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

        let textToCopy = `
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

        if(props.framework == "fleviden"){
          textToCopy = `
          # Common properties
    DEBUG: true
    VERBOSITY: 2
    ROUNDS: 10

    # Client specific configuration
    client:
      ID: "client1"
      SERVER: "localhost:8080"
      EPOCHS: 5
      BATCH_SIZE: 32
      MODEL_PATH: "/path/to/client/model.h5"
      DATA_PATH: "/path/to/client/data.csv"
      FEATURES:
        - client_feature1
        - client_feature2
      TARGETS:
        - client_target1
      PD_ARGS:
        sep: ','
        header: 0
        index_col: 0

    # Server specific configuration
    server:
      ID: "server1"
      CLIENTS:
        - "client1"
        - "client2"
      MIN_CLIENTS: 2
      MODEL_PATH: "/path/to/server/global_model.h5"
      DATA_PATH: "/path/to/server/test_data.csv"
      FEATURES:
        - server_feature1
        - server_feature2
      TARGETS:
        - server_target1
      PD_ARGS:
        sep: ','
        header: 0
        index_col: 0
          `;
        }

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

      useEffect(()=>{
        if(props.framework == "shamrock"){

          setDefaultEditorValue(`
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
          setEditorValue(`
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


        } else if(props.framework == "fleviden"){
          setDefaultEditorValue(`
            # Common properties
DEBUG: true
VERBOSITY: 2
ROUNDS: 10

# Client specific configuration
client:
  ID: "client1"
  SERVER: "localhost:8080"
  EPOCHS: 5
  BATCH_SIZE: 32
  MODEL_PATH: "/path/to/client/model.h5"
  DATA_PATH: "/path/to/client/data.csv"
  FEATURES:
    - client_feature1
    - client_feature2
  TARGETS:
    - client_target1
  PD_ARGS:
    sep: ','
    header: 0
    index_col: 0

# Server specific configuration
server:
  ID: "server1"
  CLIENTS:
    - "client1"
    - "client2"
  MIN_CLIENTS: 2
  MODEL_PATH: "/path/to/server/global_model.h5"
  DATA_PATH: "/path/to/server/test_data.csv"
  FEATURES:
    - server_feature1
    - server_feature2
  TARGETS:
    - server_target1
  PD_ARGS:
    sep: ','
    header: 0
    index_col: 0
            `);
          setEditorValue(`# Common properties
DEBUG: true
VERBOSITY: 2
ROUNDS: 10

# Client specific configuration
client:
  ID: "client1"
  SERVER: "localhost:8080"
  EPOCHS: 5
  BATCH_SIZE: 32
  MODEL_PATH: "/path/to/client/model.h5"
  DATA_PATH: "/path/to/client/data.csv"
  FEATURES:
    - client_feature1
    - client_feature2
  TARGETS:
    - client_target1
  PD_ARGS:
    sep: ','
    header: 0
    index_col: 0

# Server specific configuration
server:
  ID: "server1"
  CLIENTS:
    - "client1"
    - "client2"
  MIN_CLIENTS: 2
  MODEL_PATH: "/path/to/server/global_model.h5"
  DATA_PATH: "/path/to/server/test_data.csv"
  FEATURES:
    - server_feature1
    - server_feature2
  TARGETS:
    - server_target1
  PD_ARGS:
    sep: ','
    header: 0
    index_col: 0`);


        }
      },[props.framework])

  
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
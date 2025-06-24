import React from "react";
import { 
  FormControl, 
  FormHelperText, 
  TextField, 
  InputLabel, 
  Select, 
  IconButton,
  OutlinedInput, 
  MenuItem,
  Grid
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCircleInfo, 
} from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button';
import style from "./FederatedPipelineDialog.css"
import { server } from "websocket";

export const FlevidenInput = ({

    dropdownValues,
    selectedDropdownValues,
    setDropdownValue,
    inputtedValues,
    handleSetValues,
    modelList,
    saveData,
    features,
    setFeatures,
    clientTargets,
    setClientTargets,
    serverTargets,
    setServerTargets,
    pdArgs,
    setPdArgs,
    clients,
    setClients,
    pdArgsServer,
    setPdArgsServer,
    setValueChanged,
    serverFeatures,
    setServerFeatures,
    isFullFormValid,
    valueChanged

    })=>{

      const ITEM_HEIGHT = 48;
      const ITEM_PADDING_TOP = 8;
      const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    /*

    This function is used to update generically the list of items that you may have in your application

    */

    const handleListChange = (listStoreVar , listUpdateFunc, index, value) => {
        const updatedList = [...listStoreVar];
        updatedList[index] = value;
        listUpdateFunc(updatedList);
    };

    const handleFeatureChange = (index, value) => {
        const updatedFeatures = [...features];
        updatedFeatures[index] = value;
        setFeatures(updatedFeatures);
    };

    const addToStoreVar = (listStoreVar, listUpdateFunc) => {
        setValueChanged(true);
        listUpdateFunc([...listStoreVar, '']);
    };

    const removeStoreVar = (index, listStoreVar, listUpdateFunc) => {
        const updatedFeatures = listStoreVar.filter((_, i) => i !== index);
        listUpdateFunc(updatedFeatures);
    };


     const handleKeyChange = (listStoreVar, listUpdateFunc, index, newKey) => {
        const updated = [...listStoreVar];
        updated[index].key = newKey;
        listUpdateFunc(updated);
    };

    const handleValueChange = (listStoreVar, listUpdateFunc, index, newValue) => {
        const updated = [...listStoreVar];
        updated[index].value = newValue;
        listUpdateFunc(updated);
    };

    const addPair = (listStoreVar, listUpdateFunc) => {
        listUpdateFunc([...listStoreVar, { key: '', value: '' }]);
    };

    const removePair = (listStoreVar, listUpdateFunc, index ) => {
        const updated = listStoreVar.filter((_, i) => i !== index);
        listUpdateFunc(updated);
    };


    return(
             <div className="shamrock-dialog-options-content">
                    <div className="federated-framework-title"> FLEVIDEN </div>
                  <div className="shamrock-dialog-options-section">
                        <div className="shamrock-dialog-options-section-title"> General params </div>
                         <div>
                                    {/* 
                                        This is an input for multiple choice
                                        - topology_name: CentralTopology, GossipClientTopology, FederatedServerTopology, FederatedClientTopology,
                                    */}
                        
                        
                              <FormControl sx={{  width: "90%", mb:"20px" }}>
                              <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> DEBUG </div>  
                                  <InputLabel id="demo-multiple-name-label"></InputLabel>
                                  <Select
                                      labelId="demo-multiple-name-label"
                                      id="demo-multiple-name"
                                      value={selectedDropdownValues ? selectedDropdownValues["DEBUG"] : ""}
                                      onChange={(event)=>{setDropdownValue(event.target.value, "DEBUG","fleviden")}}
                                      input={<OutlinedInput label="Name" />}
                                      MenuProps={MenuProps}
                                      className="shamrock-control-input"
                                  >
                                      {dropdownValues && dropdownValues["DEBUG"].map((variableName) => (
                                      <MenuItem 
                                          key={variableName}
                                          value={variableName}
                                          
                                      >
                                          {variableName}
                                      </MenuItem>
                                      ))} 
                                  </Select>
                                  
                              </FormControl>

                          </div>

                          <div>
                                <FormControl sx={{  width: "90%", mb:"10px" }}>
                                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> Model </div>  
                                            <InputLabel id="demo-multiple-name-label"></InputLabel>
                                            <Select
                                            labelId="demo-multiple-name-label"
                                            id="demo-multiple-name"
                                            value={selectedDropdownValues ? selectedDropdownValues["model"] : ""}
                                            onChange={(event)=>{  setDropdownValue(event.target.value, "model","fleviden") }}
                                            input={<OutlinedInput label="Name" />}
                                            MenuProps={MenuProps}
                                            className="shamrock-control-input"
                                            >

                                            {   
                                                modelList.map((variableName) => (
                                                    <MenuItem
                                                    key={variableName}
                                                    value={variableName}
                                                    
                                                    >
                                                    {variableName}
                                                    </MenuItem>
                                                        )) 
                                            }

                                            </Select>                                          
                                    </FormControl>
                                    
                                </div>
                          <div>
                            {/* 
                                This is an input for numbers

                                - local_epochs: 1

                            */}
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> VERBOSITY </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`VERBOSITY`}
                                    placeholder="Type a number…"
                                    value={inputtedValues ? inputtedValues["VERBOSITY"]: ""}
                                    onChange={(event)=>{
                                         const isValidIntInput = /^\d+$/.test(event.target.value);

                                         if (isValidIntInput || event.target.value.length == 0){
                                            handleSetValues(event.target.value, "VERBOSITY", "fleviden")
                                         }
                                        
                                    }}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                            </FormControl>
                            
     

                        </div>

                        <div>
                        
                            <FormControl key={'11'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> ROUNDS </div> 
                                <TextField
                                    error={false}
                                    aria-label={`ROUNDS`}
                                    placeholder="Type a number…"
                                    value={inputtedValues?.["ROUNDS"] || ""} // Use optional chaining
                                    onChange={(event) => { 
                                        const value = event.target.value;
                                        const isValidIntInput = /^\d+$/.test(value);

                                        if (isValidIntInput || value === "") {
                                            handleSetValues(value, "ROUNDS", "fleviden");
                                        }
                                    }}
                                    className="shamrock-control-input"
                                />
                                <div className='variable-description centered-variable-description'>
                                    Values should be positive integers
                                </div>
                            </FormControl>
                        </div>

                  </div>

                   <div className="shamrock-dialog-options-section">
                        <div className="shamrock-dialog-options-section-title"> Client </div>
                        <div>
                            {/* 
                                This is an input for numbers

                                - rounds: 1
                                //mapeaza corect
                            */}
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> ID </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`ID`}
                                    placeholder="Type the client's id…"
                                    value={inputtedValues ? inputtedValues["client_id"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "client_id","fleviden")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  The id of the client </div>
                            </FormControl>
                        </div>
                        
                        <div>
                            {/* 
                                This is an input for numbers

                                - rounds: 1
                                //mapeaza corect
                            */}
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> SERVER </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`SERVER`}
                                    placeholder="Input client server…"
                                    value={inputtedValues ? inputtedValues["client_server"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "client_server","fleviden")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'> Value for the server where the central server is hosted </div>
                            </FormControl>
                        </div>
                        
                        <div>
                            {/* 
                                This is an input for numbers

                                - rounds: 1
                                //mapeaza corect
                            */}
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> EPOCHS </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`epocjs`}
                                    placeholder="Type a number…"
                                    value={inputtedValues?.["epochs"] || ""}
                                    onChange={(event)=>{ 

                                        const value = event.target.value;
                                        const isValidIntInput = /^\d+$/.test(value);

                                        if (isValidIntInput || value === "") {
                                            handleSetValues(event.target.value, "epochs", "fleviden")
                                        }

                                        
                                    
                                    }}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                            </FormControl>
                        </div>


                        <div>
                            {/* 
                                This is an input for numbers

                                - rounds: 1
                                //mapeaza corect
                            */}
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> BATCH_SIZE </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`VERBOSITY`}
                                    placeholder="Type a number…"
                                    value={inputtedValues?.["batch_size"] || ""}
                                    onChange={(event)=>{
                                        const value = event.target.value;
                                        const isValidIntInput = /^\d+$/.test(value);
                                        if (isValidIntInput || value === "") {
                                            handleSetValues(event.target.value, "batch_size", "fleviden")
                                        } 
                                    }}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Batch size for the model should be positive integer </div>
                            </FormControl>
                        </div>


                        
                        {/* <div>
                          
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> MODEL_PATH </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`Model Path`}
                                    placeholder="Input client model path…"
                                    value={inputtedValues ? inputtedValues["client_model_path"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "client_model_path","fleviden")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Path where the client model is hosted </div>
                            </FormControl>
                        </div> */}

                        <div>
                            {/* 
                                This is an input for numbers

                                - rounds: 1
                                //mapeaza corect
                            */}
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> DATA_PATH </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`Data Path`}
                                    placeholder="Inputdata path…"
                                    value={inputtedValues ? inputtedValues["client_data_path"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "client_data_path", "fleviden")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Where the dataset for client is located </div>
                            </FormControl>
                        </div>
                        

                        <div>
                            <FormControl sx={{ marginBottom: "30px", width: "90%" }}>
                                    <FormHelperText sx={{ fontSize: "1.1rem" }}>
                                        FEATURES
                                    </FormHelperText>

                                    {features.map((feature, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <TextField
                                            fullWidth
                                            placeholder={`feature name`}
                                            value={feature}
                                            onChange={(e) => handleListChange(features, setFeatures, index, e.target.value)}
                                            className="shamrock-control-input"
                                        />
                                        <IconButton onClick={() => removeStoreVar(index, features, setFeatures)} aria-label="delete">
                                            <Delete />
                                        </IconButton>
                                        </div>
                                    ))}

                                <div className="add-feature-btn-container">
                                    <IconButton onClick={()=>{ addToStoreVar(features, setFeatures)}} className="add-item-btn-federated" aria-label="add">
                                        <Add />
                                    </IconButton>
                                </div>                                    

                                    <div className='variable-description centered-variable-description'>
                                        Add features
                                    </div>
                                </FormControl>

                        </div>

                        <div>
                              
                            <FormControl sx={{ marginBottom: "30px", width: "90%" }}>
                                    <FormHelperText sx={{ fontSize: "1.1rem" }}>
                                        Targets
                                    </FormHelperText>

                                    {serverTargets.map((target, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <TextField
                                            fullWidth
                                            placeholder={`target name`}
                                            value={target}
                                            onChange={(e) => handleListChange(serverTargets, setServerTargets, index, e.target.value)}
                                            className="shamrock-control-input"
                                        />
                                        <IconButton onClick={() => removeStoreVar(index, serverTargets, setServerTargets)} aria-label="delete">
                                            <Delete />
                                        </IconButton>
                                        </div>
                                    ))}
                                    <div className="add-feature-btn-container">
                                        <IconButton className="add-item-btn-federated" onClick={()=>{ addToStoreVar(serverTargets, setServerTargets)}} aria-label="add">
                                            <Add />
                                        </IconButton>
                                    </div>
                                    
                                    <div className='variable-description centered-variable-description'>
                                        Add targets
                                    </div>
                                </FormControl>

                        </div>

                        <div>
                                 <FormControl sx={{ marginBottom: "30px", width: "90%" }}>
                                            <FormHelperText sx={{ fontSize: "1.1rem" }}>PD_ARGS</FormHelperText>

                                            {pdArgs.map((pair, index) => (
                                                <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
                                                <Grid item xs={5}>
                                                    <TextField
                                                    placeholder="Key"
                                                    value={pair.key}
                                                    onChange={(e) => handleKeyChange(pdArgs, setPdArgs,index, e.target.value)}
                                                    fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField
                                                    placeholder="Value"
                                                    value={pair.value}
                                                    onChange={(e) => handleValueChange(pdArgs, setPdArgs,index, e.target.value)}
                                                    fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton onClick={() => removePair(pdArgs, setPdArgs, index)} aria-label="delete">
                                                    <Delete />
                                                    </IconButton>
                                                </Grid>
                                                </Grid>
                                            ))}

                                        <div className="add-feature-btn-container">
                                            <IconButton className="add-item-btn-federated" onClick={()=>{ addPair(pdArgs, setPdArgs)}} aria-label="add">
                                                <Add />
                                            </IconButton>
                                        </div>
                                       

                                            <div className='variable-description centered-variable-description'>
                                                Add key-value pairs for PD_ARGS
                                            </div>
                                    </FormControl>
                        </div>


                       
                    </div>

                 
                  <div className="shamrock-dialog-options-section">
                        <div className="shamrock-dialog-options-section-title"> Server </div>

                         <div>
                            {/* 
                                This is an input for numbers

                                - rounds: 1
                                //mapeaza corect
                            */}
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> ID </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`ID`}
                                    placeholder="Type the server's id…"
                                    value={inputtedValues ? inputtedValues["server_id"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "server_id","fleviden")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  The id of the server </div>
                            </FormControl>
                        </div>
                        <div>
                              
                            <FormControl sx={{ marginBottom: "30px", width: "90%" }}>
                                    <FormHelperText sx={{ fontSize: "1.1rem" }}>
                                        Clients
                                    </FormHelperText>

                                    {clients.map((client, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <TextField
                                            fullWidth
                                            placeholder={`client id`}
                                            value={client}
                                            onChange={(e) => handleListChange(clients, setClients, index, e.target.value)}
                                            className="shamrock-control-input"
                                        />
                                        <IconButton onClick={() => removeStoreVar(index, clients, setClients)} aria-label="delete">
                                            <Delete />
                                        </IconButton>
                                        </div>
                                    ))}
                                    <div className="add-feature-btn-container">
                                        <IconButton className="add-item-btn-federated" onClick={()=>{ addToStoreVar(clients, setClients)}} aria-label="add">
                                            <Add />
                                        </IconButton>
                                    </div>
                                    
                                    <div className='variable-description centered-variable-description'>
                                        Add clients
                                    </div>
                                </FormControl>

                        </div>
                          
                        <div>
                            {/* 
                                This is an input for numbers

                                - rounds: 1
                                //mapeaza corect
                            */}
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> MIN_CLIENTS </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`MIN_CLIENTS`}
                                    placeholder="Number of min clients"
                                    value={inputtedValues?.["min_clients"] || ""} 
                                    onChange={(event)=>{ 
                                        const value = event.target.value;
                                        const isValidIntInput = /^\d+$/.test(value);
                                        if (isValidIntInput || value === "") {
                                          handleSetValues(event.target.value, "min_clients", "fleviden");
                                        }
                                    }}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Values should be positive integers , represents the number of minimum clients</div>
                            </FormControl>
                        </div>

                         {/* <div>
                            
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> MODEL_PATH </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`Model Path`}
                                    placeholder="Path for the server…"
                                    value={inputtedValues ? inputtedValues["server_model_path"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "server_model_path","fleviden")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Where the model that the server is training is located </div>
                            </FormControl>
                        </div> */}

                        <div>
                            {/* 
                                This is an input for numbers

                                - rounds: 1
                                //mapeaza corect
                            */}
                            <FormControl key={'10'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> DATA_PATH </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`Data Path`}
                                    placeholder="Type a number…"
                                    value={inputtedValues ? inputtedValues["server_data_path"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "server_data_path","fleviden")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Location of the data for training for the server </div>
                            </FormControl>
                        </div>

                       <div>
                              
                            <FormControl sx={{ marginBottom: "30px", width: "90%" }}>
                                    <FormHelperText sx={{ fontSize: "1.1rem" }}>
                                        Targets
                                    </FormHelperText>

                                    {clientTargets.map((target, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <TextField
                                            fullWidth
                                            placeholder={`target name`}
                                            value={target}
                                            onChange={(e) => handleListChange(clientTargets, setClientTargets, index, e.target.value)}
                                            className="shamrock-control-input"
                                        />
                                        <IconButton onClick={() => removeStoreVar(index, clientTargets, setClientTargets)} aria-label="delete">
                                            <Delete />
                                        </IconButton>
                                        </div>
                                    ))}
                                    <div className="add-feature-btn-container">
                                        <IconButton className="add-item-btn-federated" onClick={()=>{  addToStoreVar(clientTargets, setClientTargets)}} aria-label="add">
                                            <Add />
                                        </IconButton>
                                    </div>
                                    
                                    <div className='variable-description centered-variable-description'>
                                        Add one target per line
                                    </div>
                                </FormControl>

                        </div>

                         <div>
                            <FormControl sx={{ marginBottom: "30px", width: "90%" }}>
                                    <FormHelperText sx={{ fontSize: "1.1rem" }}>
                                        FEATURES
                                    </FormHelperText>

                                    {serverFeatures.map((feature, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <TextField
                                            fullWidth
                                            placeholder={`feature name`}
                                            value={feature}
                                            onChange={(e) => handleListChange(serverFeatures, setServerFeatures, index, e.target.value)}
                                            className="shamrock-control-input"
                                        />
                                        <IconButton onClick={() => removeStoreVar(index, serverFeatures, setServerFeatures)} aria-label="delete">
                                            <Delete />
                                        </IconButton>
                                        </div>
                                    ))}

                                <div className="add-feature-btn-container">
                                    <IconButton onClick={()=>{ addToStoreVar(serverFeatures, setServerFeatures)}} className="add-item-btn-federated" aria-label="add">
                                        <Add />
                                    </IconButton>
                                </div>                                    

                                    <div className='variable-description centered-variable-description'>
                                        Add features
                                    </div>
                                </FormControl>

                        </div>
                        
                         <div> 
                                 <FormControl sx={{ marginBottom: "30px", width: "90%" }}>
                                            <FormHelperText sx={{ fontSize: "1.1rem" }}>PD_ARGS</FormHelperText>

                                            {pdArgsServer.map((pair, index) => (
                                                <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
                                                <Grid item xs={5}>
                                                    <TextField
                                                    placeholder="Key"
                                                    value={pair.key}
                                                    onChange={(e) => handleKeyChange(pdArgsServer, setPdArgsServer,index, e.target.value)}
                                                    fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField
                                                    placeholder="Value"
                                                    value={pair.value}
                                                    onChange={(e) => handleValueChange(pdArgsServer, setPdArgsServer,index, e.target.value)}
                                                    fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton onClick={() => removePair(pdArgsServer, setPdArgsServer, index)} aria-label="delete">
                                                    <Delete />
                                                    </IconButton>
                                                </Grid>
                                                </Grid>
                                            ))}

                                        <div className="add-feature-btn-container">
                                            <IconButton className="add-item-btn-federated" onClick={()=>{  addPair(pdArgsServer, setPdArgsServer)}} aria-label="add">
                                                <Add />
                                            </IconButton>
                                        </div>
                                       

                                            <div className='variable-description centered-variable-description'>
                                                Add key-value pairs for PD_ARGS
                                            </div>
                                    </FormControl>
                        </div>


                  </div>
                <div className="shamrock-options-dialog-save-btn">
                        <Button variant="contained" sx={{marginTop:"5px", width:"90px" }} disabled={!valueChanged || !isFullFormValid} onClick={()=>{saveData("fleviden")}}>Save</Button>
                </div>

          
            </div>      
    
        );
} 
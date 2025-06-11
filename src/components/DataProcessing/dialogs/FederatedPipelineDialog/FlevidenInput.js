import React from "react";
import { 
  FormControl, 
  FormHelperText, 
  TextField, 
  InputLabel, 
  Select, 
  OutlinedInput, 
  MenuItem,
  IconButton,
  Grid 
} from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCircleInfo, 
} from '@fortawesome/free-solid-svg-icons';
import { Add, Delete } from '@mui/icons-material';


export const FlevidenInput = ({dropdownValues, selectedDropdownValues, setDropdownValue, inputtedValues, handleSetValues})=>{

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

    return(
             <div className="shamrock-dialog-options-content">
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
                                    onChange={(event)=>{ handleSetValues(event.target.value, "VERBOSITY", "fleviden")}}
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
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> ROUNDS </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`ROUNDS`}
                                    placeholder="Type a number…"
                                    value={inputtedValues ? inputtedValues["ROUNDS"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "ROUNDS")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
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
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> SERVER </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`SERVER`}
                                    placeholder="Type a number…"
                                    value={inputtedValues ? inputtedValues["server"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "server","fleviden")}}
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
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> EPOCHS </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`epocjs`}
                                    placeholder="Type a number…"
                                    value={inputtedValues ? inputtedValues["epochs"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "epochs", "fleviden")}}
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
                                    value={inputtedValues ? inputtedValues["batch_size"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "batch_size", "fleviden")}}
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
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> MODEL_PATH </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`Model Path`}
                                    placeholder="Type a number…"
                                    value={inputtedValues ? inputtedValues["client_model_path"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "client_model_path")}}
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
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> DATA_PATH </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`Data Path`}
                                    placeholder="Type a number…"
                                    value={inputtedValues ? inputtedValues["client_data_path"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "client_data_path")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
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
                                            placeholder={`client_feature${index + 1}`}
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            className="shamrock-control-input"
                                        />
                                        <IconButton onClick={() => removeFeature(index)} aria-label="delete">
                                            <Delete />
                                        </IconButton>
                                        </div>
                                    ))}

                                    <IconButton onClick={addFeature} aria-label="add">
                                        <Add />
                                    </IconButton>

                                    <div className='variable-description centered-variable-description'>
                                        Add one feature per line
                                    </div>
                                </FormControl>

                        </div>

                        <div>
                                
                            <FormControl sx={{ marginBottom: "30px", width: "90%" }}>
                                    <FormHelperText sx={{ fontSize: "1.1rem" }}>
                                        Targets
                                    </FormHelperText>

                                    {features.map((feature, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <TextField
                                            fullWidth
                                            placeholder={`client_feature${index + 1}`}
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            className="shamrock-control-input"
                                        />
                                        <IconButton onClick={() => removeFeature(index)} aria-label="delete">
                                            <Delete />
                                        </IconButton>
                                        </div>
                                    ))}

                                    <IconButton onClick={addFeature} aria-label="add">
                                        <Add />
                                    </IconButton>

                                    <div className='variable-description centered-variable-description'>
                                        Add one feature per line
                                    </div>
                                </FormControl>

                        </div>

                        <div>
                                 <FormControl sx={{ marginBottom: "30px", width: "90%" }}>
                                            <FormHelperText sx={{ fontSize: "1.1rem" }}>PD_ARGS</FormHelperText>

                                            {kvPairs.map((pair, index) => (
                                                <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
                                                <Grid item xs={5}>
                                                    <TextField
                                                    placeholder="Key"
                                                    value={pair.key}
                                                    onChange={(e) => handleKeyChange(index, e.target.value)}
                                                    fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField
                                                    placeholder="Value"
                                                    value={pair.value}
                                                    onChange={(e) => handleValueChange(index, e.target.value)}
                                                    fullWidth
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton onClick={() => removePair(index)} aria-label="delete">
                                                    <Delete />
                                                    </IconButton>
                                                </Grid>
                                                </Grid>
                                            ))}

                                            <IconButton onClick={addPair} aria-label="add">
                                                <Add />
                                            </IconButton>

                                            <div className='variable-description centered-variable-description'>
                                                Add key-value pairs for PD_ARGS
                                            </div>
                                    </FormControl>
                        </div>


                       
                    </div>

                {/* come to comment till here  */}
            </div>      
    
        );
} 
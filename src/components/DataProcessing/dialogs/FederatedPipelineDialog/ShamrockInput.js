import React from "react";
import { 
  FormControl, 
  FormHelperText, 
  TextField, 
  InputLabel, 
  Select, 
  OutlinedInput, 
  MenuItem,
  Button
} from '@mui/material';

// Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCircleInfo, 
  faTriangleExclamation 
} from '@fortawesome/free-solid-svg-icons';



export const ShamrockInput = ({
        inputtedValues,
        handleSetValues,
        selectedDropdownValues,
        setDropdownValue,
        dropdownValues,
        modelList,
        modelUploadError,
        modelWasSet,
        optimizersLoadedError,
        lossesLoadedError,
        valueChanged,
        optimizers,
        isFullFormValid,
        losses,
        saveData

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

    return(
         <div className="shamrock-dialog-options-content">
        
                <div className="shamrock-dialog-options-section">

                        <div className="shamrock-dialog-options-section-title"> Dataset </div>

                            <div>
                                        {/* 
                                                This is an input for numbers

                                                - n_splits : 1

                                        */}
                                        <FormControl key={'1'} sx={{ marginBottom: "30px", width: "90%", marginLeft:"15px" }}>
                                            <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                            <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> n_splits </div> 
                                            <TextField
                                                error = {false}
                                                aria-label={`My value`}
                                                placeholder="Type a number…"
                                                value={inputtedValues ? inputtedValues["n_splits"]: ""}
                                                onChange={(event)=>{ handleSetValues(event.target.value, "n_splits", "shamrock")}}
                                                className="shamrock-control-input"
                                            />
                                            <div className='variable-description centered-variable-description'>  Values should be positive integers </div> 
                                        </FormControl>
                            </div>
                                        

                            <div>
                                    {/* 
                                        This is an input for numbers

                                        - split_index: 0

                                    */}
                                    <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%", marginLeft:"15px"  }}>
                                    
                                    <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                    <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> split_index  </div> 
                                        <TextField
                                        error = {false}
                                        aria-label={`My value`}
                                        placeholder="Type a number…"
                                        value={inputtedValues ? inputtedValues["split_index"]: ""}
                                        onChange={(event)=>{ handleSetValues(event.target.value, "split_index", "shamrock")}}
                                        className="shamrock-control-input"
                                        />
                                    <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                                    </FormControl>
                                </div>
                    </div>
                    <div className="shamrock-dialog-options-section">  
                        <div className="shamrock-dialog-options-section-title"> Topology </div>
                            <div>
                                    {/* 
                                        This is an input for multiple choice
                                        - topology_name: CentralTopology, GossipClientTopology, FederatedServerTopology, FederatedClientTopology,
                                    */}


                                        <FormControl sx={{  width: "90%", mb:"20px" }}>
                                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> topology name </div>  
                                            <InputLabel id="demo-multiple-name-label"></InputLabel>
                                            <Select
                                                labelId="demo-multiple-name-label"
                                                id="demo-multiple-name"
                                                value={selectedDropdownValues ? selectedDropdownValues["topology"] : ""}
                                                onChange={(event)=>{setDropdownValue(event.target.value, "topology","shamrock")}}
                                                input={<OutlinedInput label="Name" />}
                                                MenuProps={MenuProps}
                                                className="shamrock-control-input"
                                            >
                                                {dropdownValues && dropdownValues["topology_name"].map((variableName) => (
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

                                            - max_iter: 5

                                        */}
                                        <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                        <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>  max_iter </div> 
                                            <TextField
                                            error = {false}
                                            aria-label={`My value`}
                                            placeholder="Type a number…"
                                            value={inputtedValues ? inputtedValues["max_iter"] : ""}
                                            onChange={(event)=>{ handleSetValues(event.target.value, "max_iter", "shamrock")}}
                                            className="shamrock-control-input"
                                            />
                                        <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                                        </FormControl>
                                    </div>
                                    <div>
                                        {/* 
                                            This is an input for numbers

                                            - local_epochs: 1

                                        */}
                                        <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                        <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> local_epochs </div> 
                                            <TextField
                                            error = {false}
                                            aria-label={`My value`}
                                            placeholder="Type a number…"
                                            value={inputtedValues ? inputtedValues["local_epochs"]: ""}
                                            onChange={(event)=>{ handleSetValues(event.target.value, "local_epochs","shamrock")}}
                                            className="shamrock-control-input"
                                            />
                                        <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                                        </FormControl>
                                    </div>

                    </div>

                    <div className="shamrock-dialog-options-section">
                                        {/* Here */}
                        <div className="shamrock-dialog-options-section-title"> Model </div>
                            
                        <div>
                                {/* 
                                        This is an input for multiple choice
                                        - optimizer: CentralTopology, GossipClientTopology, FederatedServerTopology, FederatedClientTopology,
                                */}

                                <FormControl sx={{  width: "90%", mb:"10px" }}>
                                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> model </div>  
                                            <InputLabel id="demo-multiple-name-label"></InputLabel>
                                            <Select
                                            labelId="demo-multiple-name-label"
                                            id="demo-multiple-name"
                                            value={selectedDropdownValues ? selectedDropdownValues["model"] : ""}
                                            onChange={(event)=>{  setDropdownValue(event.target.value, "model","shamrock") }}
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
                                { modelUploadError &&  <div className='variable-description error-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon exclamation-icon-error"/> Error while loading the models! </div>   }


                            <div>
                                {/* 
                                        This is an input for multiple choice
                                        - optimizer: CentralTopology, GossipClientTopology, FederatedServerTopology, FederatedClientTopology,
                                */}


                                <FormControl sx={{  width: "90%", mb:"20px" }}>
                                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> optimizer </div>  
                                            <InputLabel id="demo-multiple-name-label"></InputLabel>
                                            <Select
                                            labelId="demo-multiple-name-label"
                                            id="demo-multiple-name"
                                            value={selectedDropdownValues ? selectedDropdownValues["optimizer"] : ""}
                                            onChange={(event)=>{setDropdownValue(event.target.value, "optimizer", "shamrock")}}
                                            input={<OutlinedInput label="Name" />}
                                            MenuProps={MenuProps}
                                            className="shamrock-control-input"
                                            disabled = { !modelWasSet || optimizersLoadedError }
                                            >
                                            
                                            {   

                                                optimizers.map((variableName) => (
                                                    <MenuItem
                                                    key={variableName}
                                                    value={variableName}
                                                    
                                                    >
                                                    {variableName}
                                                    </MenuItem>
                                                        )) 

                                            }

                                            
                                            </Select>
                                            { optimizersLoadedError &&  <div className='variable-description error-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon exclamation-icon-error"/> Error while loading the optimizers! </div>   }
                                            { !modelWasSet &&
                                            <div className='variable-description warning-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon"/> Please first select a model! </div>  
                                            } 
                                            
                                        </FormControl>
                                </div>
                                <div>
                                {/* 
                                    This is an input for numbers

                                    - lr: 0.0001

                                */}
                                <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>  lr </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`My value`}
                                    placeholder="Type a number…"
                                    value={inputtedValues ? inputtedValues["lr"] : ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "lr", "shamrock")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Values should be between [0 , 1] </div>
                                </FormControl> 
                            </div>

                            
                            <div>

                                {/* 
                                    This is an input for numbers

                                    - batch_size: 512

                                */}

                                <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>  batch_size </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`My value`}
                                    placeholder="Type a number…"
                                    value={ inputtedValues ? inputtedValues["batch_size"] : ""}
                                    className="shamrock-control-input"
                                    onChange={(event)=>{ handleSetValues(event.target.value, "batch_size", "shamrock")}}
                                    />
                                <div className='variable-description centered-variable-description'>  Values should be between [0 , 1] </div>
                                </FormControl>
                            </div>
                            <div>
                                {/* 
                                        This is an input for multiple choice
                                        - loss: CentralTopology, GossipClientTopology, FederatedServerTopology, FederatedClientTopology,
                                */}


                                <FormControl sx={{  width: "90%", mb:"20px" }}>
                                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> loss </div>  
                                            <InputLabel id="demo-multiple-name-label"></InputLabel>
                                            <Select
                                            labelId="demo-multiple-name-label"
                                            id="demo-multiple-name"
                                            value={selectedDropdownValues ? selectedDropdownValues["loss"] : ""}
                                            onChange={(event)=>{setDropdownValue(event.target.value, "loss", "shamrock")}}
                                            input={<OutlinedInput label="Name" />}
                                            MenuProps={MenuProps}
                                            className="shamrock-control-input"
                                            disabled = { !modelWasSet || lossesLoadedError}
                                            >
                                        
                                        {   
                                                losses.map((variableName) => (
                                                <MenuItem
                                                    key={variableName}
                                                    value={variableName}
                                                    
                                                >
                                                    {variableName}
                                                </MenuItem>
                                                    )) 

                                            }                      
                                            </Select>
                                            { lossesLoadedError &&  <div className='variable-description error-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon exclamation-icon-error"/> Error while loading losses! </div> }
                                            { !modelWasSet  &&
                                            <div className='variable-description warning-text' > <FontAwesomeIcon icon={faTriangleExclamation} className="exclamation-icon"/> Please first select a model! </div>  
                                            } 
                                    </FormControl>
                            </div>

                    </div>
                    

                <div className="shamrock-dialog-options-section">

                    <div className="shamrock-dialog-options-section-title"> Stop  Condition </div>
                    <div>

                        {/* 
                        This is an input for numbers
                        - max_aggr: 1000

                        */}

                            <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                            <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                            <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>   max_aggr </div> 
                                <TextField
                                error = {false}
                                aria-label={`My value`}
                                placeholder="Type a number…"
                                value={inputtedValues ? inputtedValues["max_aggr"] : ""}
                                onChange={(event)=>{ handleSetValues(event.target.value, "max_aggr", "shamrock")}}
                                className="shamrock-control-input"
                                />
                            <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                            </FormControl>
                            </div>

                            <div>

                                {/* 
                                    This is an input for numbers
                                    - max_time: 3000

                                */}

                                <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>  max_time </div> 
                                    <TextField
                                    error = {false}
                                    aria-label={`My value`}
                                    placeholder="Type a number…"
                                    value={inputtedValues ? inputtedValues["max_time"]: ""}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "max_time", "shamrock")}}
                                    className="shamrock-control-input"
                                    />
                                <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                                </FormControl>
                                </div>

                                <div>

                            {/* 
                                    This is an input for numbers
                                    - metric_min: 0.7

                            */}

                            <FormControl key={'111'} sx={{ marginBottom: "30px", width: "90%" }}>
                                <FormHelperText sx={{ fontSize:"1.1rem" }}></FormHelperText>
                                <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/>  metric_min </div> 
                                <TextField
                                    error = {false}
                                    aria-label={`My value`}
                                    placeholder="Type a number…"
                                    value={inputtedValues && inputtedValues["metric_min"]}
                                    onChange={(event)=>{ handleSetValues(event.target.value, "metric_min", "shamrock")}}
                                    className="shamrock-control-input"
                                />
                                <div className='variable-description centered-variable-description'>  Values should be positive integers </div>
                            </FormControl>
                            </div>  
                    </div>
                        
                    <div className="shamrock-options-dialog-save-btn">
                            <Button variant="contained" sx={{marginTop:"5px", width:"90px" }} disabled={!valueChanged || !isFullFormValid} onClick={()=>{saveData()}}>Save</Button>
                    </div>

                </div>      

    );
}
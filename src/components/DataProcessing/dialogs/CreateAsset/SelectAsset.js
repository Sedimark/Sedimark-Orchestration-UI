import React, { useEffect, useState } from "react";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import { FETCH_PIPELINES, BROKER_GET_ENTITY_TYPES, GET_MODELS } from "../../../../utils/apiEndpoints";
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@mui/material/Button';
import toast from 'react-hot-toast';
import axios from "axios";
import style from "./CreateAsset.css";
import { Description } from "@mui/icons-material";

export const  SelectAsset = (props)=>{

    const fetchDescriptionAndName = ()=>{
        switch(props.assetType){
            case "workflow":
                return {
                    "description":"Select a pipeline for workflow",
                    "name":"Select Pipeline"
                }
            
            case "data":
                return {
                    "description":"Select a dataset from the Broker",
                    "name":"Select Dataset"
                }
            
            case "AIModel":
                return {
                    "description":"Select a model from MLFlow",
                    "name":"Select Model"
                }
            
        }
    }

    const [ dropdownValueSelected, setDropDownValueSelected ] = useState("");
    const [ isLoading, setIsLoading] = useState(false);
    const [dropdownValues, setDropdownValues] = useState([]);
    
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

    const blockAlert = (msg) => {
        toast.error(msg, {
            duration: 4000,
            position: 'top-right',
        })
    };

    const fetchAllAssetsOfType = async()=> {
        setIsLoading(true);
        if(props.assetType === "workflow"){

            try{
                const resp = await axios.get(FETCH_PIPELINES(""));
                console.log(resp.data);
                setDropdownValues(resp.data);
                setIsLoading(false);     
            } catch(err){
                blockAlert("There was an error while fetching workflows!");
                setIsLoading(false);
                console.log(err);
            }

        } else if (props.assetType === "data"){
             try{
                const resp = await axios.get(BROKER_GET_ENTITY_TYPES);
                setDropdownValues(resp.data.typeList.map(item => ({ name: item })));

                setIsLoading(false);     
            } catch(err){
                blockAlert("There was an error while fetching workflows!");
                setIsLoading(false);
                console.log(err);
            }

        } else if (props.assetType === "AIModel"){  

              try{
                const resp = await axios.get(GET_MODELS);
                setDropdownValues(resp.data);
                setIsLoading(false);     
            } catch(err){
                blockAlert("There was an error while fetching workflows!");
                setIsLoading(false);
                console.log(err);
            }
        }
    }

    useEffect(()=>{
        
        fetchAllAssetsOfType();


    },[props.assetType])

    return(
        <div className="select-asset-dropdown-container">
            {isLoading  ?

                <div className="loading-circle-container" style={{marginTop:"20px"}}>
                    <div className="loading-circle"></div>
                    <p className="loading-text" style={{marginLeft:"45%", marginTop:"10px"}}>Loading...</p>
                </div>

                :
                  <FormControl sx={{ m: 1, width: "60%", left:"20%" }}>
                        <InputLabel id="demo-multiple-name-label">{fetchDescriptionAndName()["name"]}</InputLabel>
                        <Select
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        
                        value={dropdownValueSelected}
                        onChange={(event)=>{setDropDownValueSelected(event.target.value) }}
                        input={<OutlinedInput label="Name" />}
                        MenuProps={MenuProps}
                        >
                        {dropdownValues.map((assetName) => (
                            <MenuItem
                            key={assetName}
                            value={assetName}

                            >
                            {assetName["name"]}
                            </MenuItem>
                        ))}
                        </Select>
                        <div className='variable-description'> <FontAwesomeIcon icon={faCircleInfo}/> {fetchDescriptionAndName()["description"]} </div>  
                    </FormControl>

            }
            
              {
                !isLoading &&  
                <Button variant='contained' color='primary' disabled={ dropdownValueSelected.length === 0}   sx={{ 
                        marginTop: '50px',
                        marginLeft: '45%',
                        width:"150px"
                    }}  onClick={()=>{props.generateAndDisplayForm(props.assetType)}}>
                    Next
                </Button>
              } 
            </div>
    );

}
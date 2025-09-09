import React from "react";
import Button from '@mui/material/Button';
import { truncateString } from "../../../../../utils/truncateString";

export default function TypesList ({allTypes, fetchEntitiesRequest, setCurrentView }) {
     
    return(
        <div className="simple-models-list-wrapper">
               <>
                    {allTypes.map((type)=>{
                        return(<div className='menu-pipelines-item' title={type}> {truncateString(type,31)} <div> <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{  fetchEntitiesRequest(type); setCurrentView("entities");  }}> View Entities </Button></div></div>)
                    })}
                </>
        </div>
    );

}
import React from "react";


export const Loading = ()=>{

        return(
            <div style={{marginTop:"40px"}}>
            <div className="loading-circle-container" style={{paddingTop:"30px"}}>
                <div className="loading-circle"></div>
                <p className="loading-text-graphs">Loading models data...</p>
            </div>
        </div> 
        );                     
}
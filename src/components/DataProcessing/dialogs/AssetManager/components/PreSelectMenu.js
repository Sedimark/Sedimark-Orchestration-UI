import React from "react";
import Button from '@mui/material/Button';

export default function PreSelectMenu ({selectView, fetchModels, fetchAllTypes, fetchEntitiesRequest, setMenuName}) {

    return(
            <div className='menu-pipelines simple-models-list-wrapper'style={{marginTop:"40px"}}>
                <div className="type-of-asset-btns" style={{paddingTop:"20px" , paddingBottom:"20px"}}>
                    <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px", width:"150px", marginLeft: '40%'}} onClick={()=>{ selectView("models"); fetchModels(); }}> Models </Button>
                    <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px", width:"150px", marginLeft: '40%', marginTop: '20px'}} onClick={()=>{ selectView("types"); fetchAllTypes(); setMenuName("Data Assets"); }}>  Data </Button>
                    <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px", width:"150px", marginLeft: '40%', marginTop: '20px'}} onClick={()=>{ selectView("entities"); fetchEntitiesRequest("WorkflowAsset"); setMenuName("Workflow Assets"); }}>  Workflows </Button>
                </div>
             </div>
    );

}
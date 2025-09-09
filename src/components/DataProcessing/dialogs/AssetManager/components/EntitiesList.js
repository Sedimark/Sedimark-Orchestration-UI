import React, { useState } from "react";
import Button from '@mui/material/Button';
import { truncateString } from "../../../../../utils/truncateString";
import EntityView from "./EntityView/EntityView";


export default function EntitiesList ({entitiesList}) {

    const [entityViewOpen, setEntityViewOpen] = useState(false);
    const [entityDetails, setEntityDetails] = useState("");

    return(
        <div className='my-assets-list simple-models-list-wrapper simple-models-list-wrapper'>
                { entitiesList && entitiesList.map((entity)=>{
                     return(<div className='entity-item'> <div className='entity-item-text' title={entity}>{truncateString(entity,60)}</div> <div> <Button  variant="contained" className='menu-pipelines-item-btn' style={{marginRight:"20px"}} onClick={()=>{setEntityDetails(entity); setEntityViewOpen(true)}}> Details </Button>
                    </div>
                </div>
                )
            })}

            { entityViewOpen && <EntityView entityDetails={entityDetails} open={entityViewOpen} onClose={()=>{setEntityViewOpen(false)}}></EntityView> }
        </div>
    );

}
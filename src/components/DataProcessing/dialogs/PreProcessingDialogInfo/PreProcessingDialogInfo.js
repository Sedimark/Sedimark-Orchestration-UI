import * as React from 'react';
import style from "./PreProcessingDialogInfo.css";
import Button from '@mui/material/Button';
import { getAlgDescription } from '../../../../utils/algDescription';

export default function PreProcessingDialogInfo(props) {
 
  const [algDetails, setAlgDetails] = React.useState("");

  const selectAlgorithmDetails = (alg) =>{
    const description = getAlgDescription(alg);
    setAlgDetails(description);
  }
  

  React.useEffect(()=>{
    selectAlgorithmDetails(props.selectedAlgorithm);
  },[])
  
    return (
      <div>

        <h1>Algorithm</h1> 
        <hr></hr>
        <div className='pre-processing-dialog-info-description-section'>
          <p className='description-title'>Description</p>
          <p>
          {algDetails}
          </p>
        </div>
        <Button variant="contained" onClick={props.handleClose}>Go back</Button>
      </div>
    );
  }
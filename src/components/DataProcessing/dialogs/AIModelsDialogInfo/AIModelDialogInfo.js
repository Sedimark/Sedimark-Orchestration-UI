import * as React from 'react';
import style from "./AIModelDialogInfo.css";
import Button from '@mui/material/Button';
import { getMLAlgDescription } from '../../../../utils/mlAlgDescription';

export default function AIModelDialogInfo(props) {
 
  const [algDetails, setAlgDetails] = React.useState("");

  const selectAlgorithmDetails = (alg) =>{
   const description = getMLAlgDescription(alg);
   setAlgDetails(description);
  }
  
  React.useEffect(()=>{
    selectAlgorithmDetails(props.selectedMLAlgorithm);
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
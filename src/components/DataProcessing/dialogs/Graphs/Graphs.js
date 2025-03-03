import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { LineChart } from '@mui/x-charts/LineChart';
import style from "./Graphs.css";


export default function Graphs(props) {
 
    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });

    const [loading, setLoading] = useState(true);

    useEffect(()=>{
 
      if(props.graphData.length !== 0 ){
        setLoading(false);
      }
    },[props.graphData])

  
  return (
    
    <ThemeProvider theme={darkTheme}>
            <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="md"
            fullWidth={true}  
        >
            <DialogTitle id="alert-dialog-title">
            {"Graphs"}
            <div className="close-button-save-pipeline" onClick={()=>{props.handleClose()}}> x </div>
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <div className='line-chart-dialog-title'>Model Accuracy</div>
              {loading ?
              
                   <div className="loading-circle-container" style={{paddingTop:"30px"}}>
                      <div className="loading-circle"></div>
                      <p className="loading-text-graphs">Loading graph data...</p>
                  </div>

                :

                <div className='line-chart-container'>
                      <LineChart
                        xAxis={[{ data:props.graphData.map((i,index)=> index), label:"Iteration"  }]}
                        series={[
                          {
                            data: props.graphData,
                            label:"accuracy"
                          },
                        ]}
                        width={500}
                        height={300}
                      />
                </div>
            }

            {
              !loading &&
              <div className='peers-container'>
               <b className='peer-box'>Peers:</b>{" "}
                {props.peers.map((peer, index) => (
                  <span key={index} className="peer-box">
                    {peer}
                    {index < props.peers.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            }
             
            </DialogContentText>
            </DialogContent>
            <DialogActions>
          
            </DialogActions>
        </Dialog>
        </ThemeProvider>
    );

}

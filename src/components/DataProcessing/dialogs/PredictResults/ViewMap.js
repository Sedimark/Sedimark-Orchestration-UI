import * as React from 'react';
import { useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector } from "react-redux/es/hooks/useSelector";

export default function ViewMap(props) {

    const mapData = useSelector((state)=>state.mapData);
    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
        },
      });


  return (
    
    <div>
      <ThemeProvider theme={darkTheme}>
        <Dialog open={props.open} onClose={props.handleClose} sx={{textAlign:"center", backgroundColor:""}} maxWidth="600" fullWidth={true} >
  
             <DialogTitle> ViewMap </DialogTitle>
              <DialogContent>   
                {mapData.length!=0 && 
                    <iframe srcDoc={mapData}
                            width="100%"
                            height="900px"
                    >

                    </iframe>
                }
                
              </DialogContent>
              <DialogActions>
                <Button onClick={props.handleClose}>Close</Button>

              </DialogActions>
            
        </Dialog>
        </ThemeProvider>
      </div> 
    );

}

import * as React from 'react';
import { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import WidgetsIcon from '@mui/icons-material/Widgets';
import BarChartIcon from '@mui/icons-material/BarChart';
import PipelineSelectDialog from '../DataProcessing/dialogs/PipelineSelect/PipelineSelectDialog';
import HubIcon from '@mui/icons-material/Hub';
import Divider from '@mui/material/Divider';
import SettingsIcon from '@mui/icons-material/Settings';
import TrainModelDialog from '../DataProcessing/dialogs/TrainModel/TrainModelDialog';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import PaletteIcon from '@mui/icons-material/Palette';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClover } from '@fortawesome/free-solid-svg-icons';
import PipelineManager from '../DataProcessing/dialogs/PipelineManager/PipelineManager';
import Settings from '../DataProcessing/dialogs/Settings/Settings';


const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme)=> ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));



const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const BigDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function MiniDrawer() {
  const [open, setOpen] = useState(true);
  const [pipelineManagerOpen, setIsPipelineManagerOpen] = useState(false);
  const [selectDataDialog, setSelectDataDialog] = useState(false);
  const [pipelineType, setPipelineType] = useState("");
  const [trainModelsDialogOpen, setTrainModelsDialogOpen] = React.useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  const openPipelineSelectMenu = (dialogType) => {
    if(dialogType === "train"){
      setPipelineType("train");
    } else if(dialogType === "data_preprocessing"){
      setPipelineType("data_preprocessing");
    } else if (dialogType === "streaming"){
      setPipelineType("streaming");
    }

    setSelectDataDialog(true);
  }

  const handleDataSelectDialogClose = ()=>{
    setSelectDataDialog(false);
  }

  const openTrainModelsMenu = ()=>{
    setTrainModelsDialogOpen(true);
  }

  const handleTrainModelsMenuClose = ()=>{
    setTrainModelsDialogOpen(false);
  }

  const handleLogout = () => {
      
  };

  return (
    <Box sx={{ display: 'flex' , width:"20px !important"}}>
      <BigDrawer variant="permanent" open={open} PaperProps={{
        sx: {
          backgroundColor: '#1f263e',
          color: "red",
        }
        }}>
        <DrawerHeader>
         <img src="./sedimark-logo.svg" width={100} style={{margin:"auto", padding:"20px"}}/>
        </DrawerHeader>

        
        <h2 style={{color:"#fff"}}>Operations</h2>
        <List>
             <ListItem key={"Data pre-processing"} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    color:"white"
                  }}
                  key={0}
                  onClick={()=>{ openPipelineSelectMenu("data_preprocessing");}}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color:"white"
                    }}
                  >
                <BarChartIcon></BarChartIcon>
                  </ListItemIcon>
                  <ListItemText primary={"Data pre-processing"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
             
            </ListItem>

            <ListItem key={"Training pipeline"} disablePadding sx={{ display: 'block' }} onClick={()=>{openPipelineSelectMenu("train")}}>
              <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    color:"white"
                  }}
                  key={1}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color:"white"
                    }}
                  >
                   <HubIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Training pipeline"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
            <ListItem key={"Predict"} disablePadding sx={{ display: 'block' }} onClick={()=>{openTrainModelsMenu()}}>
              <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    color:"white"
                  }}
                  key={2}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color:"white"
                    }}
                  >
                    <WidgetsIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Predict"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
            <ListItem key={"Streaming"} disablePadding sx={{ display: 'block' }} onClick={()=>{openPipelineSelectMenu("streaming")}}>
              <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    color:"white"
                  }}
                  key={2}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color:"white"
                    }}
                  >
                    <SettingsInputAntennaIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Streaming"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
              <Divider component="li"/>
            <ListItem key={"Pipeline Creator"} disablePadding sx={{ display: 'block' }} onClick={()=>{ navigate("/pipeline-studio") }}>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        color:"white"
                    }}
                    key={2}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color:"white"
                        }}
                    >
                        <PaletteIcon/>
                    </ListItemIcon>
                    <ListItemText primary={"Pipeline Creator"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>

            <ListItem key={"Pipeline Manager"} disablePadding sx={{ display: 'block' }} onClick={()=>{setIsPipelineManagerOpen(true)}}>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        color:"white"
                    }}
                    key={2}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color:"white"
                        }}
                    >
                        <EngineeringIcon/>
                    </ListItemIcon>
                    <ListItemText primary={"Pipeline Manager"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
        
       </List>

       <ListItem key={"Shamrock"} disablePadding sx={{ display: 'block' }} onClick={()=>{ navigate("/shamrock") }}>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        color:"white"
                    }}
                    key={2}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                            color:"white",
                            fontSize: "1.5rem"
                        }}
                    >
                      <FontAwesomeIcon icon={faClover} sx={{ fontSize: "2rem"}} />
                    </ListItemIcon>
                    <ListItemText primary={"Shamrock"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
          </ListItem>

      <List style={{position:"absolute",bottom:"10px"}}>
       <h2 style={{color:"#fff"}}>Account</h2>
        <ListItem key={"Notifications"} disablePadding sx={{ display: 'block' }} onClick={handleLogout}>
              <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    color:"white"
                  }}
                  key={2}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color:"white"
                    }}
                  >
                    <LogoutIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Logout"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>

            <ListItem key={"Settings"} disablePadding sx={{ display: 'block' }} onClick={()=>{setSettingsDialogOpen(true)}}>
              <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    color:"white"
                  }}
                  key={2}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color:"white"
                    }}
                  >
                    <SettingsIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Settings"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>

         
        </List>
      </BigDrawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      </Box>
     {selectDataDialog && <PipelineSelectDialog pipelineType={pipelineType} open={selectDataDialog} handleClose={handleDataSelectDialogClose} />}
     {trainModelsDialogOpen && <TrainModelDialog handleClose={handleTrainModelsMenuClose} open={trainModelsDialogOpen} close={handleTrainModelsMenuClose} /> }
     {pipelineManagerOpen && <PipelineManager open={pipelineManagerOpen} handleClose={()=>{setIsPipelineManagerOpen(false)}}/>}
     {settingsDialogOpen && <Settings open={settingsDialogOpen} handleClose={()=>{setSettingsDialogOpen(false)}}/>}
    </Box>
  );
}
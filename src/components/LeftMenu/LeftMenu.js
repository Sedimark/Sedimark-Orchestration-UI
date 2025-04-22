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
import PipelineSelectDialog from '../DataProcessing/dialogs/PipelineSelect/PipelineSelectDialog';
import Divider from '@mui/material/Divider';
import SettingsIcon from '@mui/icons-material/Settings';
import TrainModelDialog from '../DataProcessing/dialogs/TrainModel/TrainModelDialog';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PipelineManager from '../DataProcessing/dialogs/PipelineManager/PipelineManager';
import PipelineNameSet from '../DataProcessing/dialogs/PipelineNameSet/PipelineNameSet';
import HandymanIcon from '@mui/icons-material/Handyman';
import TimelineIcon from '@mui/icons-material/Timeline';
import Settings from '../DataProcessing/dialogs/Settings/Settings';
import TemplatesDialog from '../DataProcessing/dialogs/TemplatesDialog/TemplatesDialog';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Broker from '../DataProcessing/dialogs/Broker/Broker';


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
  const [brokerDialogOpen, setBrokerDialogOpen] = React.useState(false);
  const [openPipelineSelectDialog, setOpenPipelineSelectDialog] = React.useState(false);
  const [pipelineNameSetOpen, setPipelineNameSetOpen] = React.useState(false);
  const [templatesDialog, setTemplatesDialog] = React.useState(false);
  const navigate = useNavigate();

  const openPipelineSelectMenu = (dialogType) => {
    if(dialogType === "train"){
      setPipelineType("train");
    } else if(dialogType === "data_preprocessing"){
      setPipelineType("data_preprocessing");
    } else if (dialogType === "streaming"){
      setPipelineType("streaming");
    } else if(dialogType === "all"){
      setPipelineType("all");
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
             <ListItem key={"Templates"} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    color:"white"
                  }}
                  key={0}
                  onClick={()=>{ setTemplatesDialog(true);}}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color:"white"
                    }}
                  >
                <AssignmentIcon></AssignmentIcon>
                  </ListItemIcon>
                  <ListItemText primary={"Templates"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
             
            </ListItem>

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
                        <HandymanIcon/>
                    </ListItemIcon>
                    <ListItemText primary={"Pipeline Creator"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>


            <ListItem key={"Pipelines"} disablePadding sx={{ display: 'block' }} onClick={()=>{openPipelineSelectMenu("all")}}>
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
                    <TimelineIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Pipelines"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
            <ListItem key={"My Assets"} disablePadding sx={{ display: 'block' }} onClick={()=>{}}>
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
                  <ListItemText primary={"My Assets"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
              <Divider component="li"/>

        
       </List>

      
      <List style={{position:"absolute",bottom:"10px"}}>
       <h2 style={{color:"#fff"}}>Account</h2>
      
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
     {brokerDialogOpen && <Broker  open={brokerDialogOpen} newPipelineGeneration = {()=>{setPipelineNameSetOpen(true)}} handleClose={()=>{setBrokerDialogOpen(false)}} openPipelineDialog={()=>{setOpenPipelineSelectDialog(true)}} />}
     {openPipelineSelectDialog && <PipelineSelectDialog pipelineType={"data_preprocessing"} open={openPipelineSelectDialog} handleClose={()=>{setOpenPipelineSelectDialog(false)}} />}
     {pipelineNameSetOpen && <PipelineNameSet open={pipelineNameSetOpen} handleClose={()=>{setPipelineNameSetOpen(false)}} />}
     {templatesDialog && <TemplatesDialog openTrainModelsMenu={openTrainModelsMenu} openPipelineSelectMenu={openPipelineSelectMenu} open={templatesDialog} handleClose={()=>{setTemplatesDialog(false)}} />}
    </Box>
  );
}
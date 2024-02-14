import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import List from '@mui/material/List';
import Drawer from '@mui/joy/Drawer';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import WidgetsIcon from '@mui/icons-material/Widgets';
import BarChartIcon from '@mui/icons-material/BarChart';
import PipelineSelectDialog from './dialogs/PipelineSelect/PipelineSelectDialog';
import HubIcon from '@mui/icons-material/Hub';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrainModelDialog from './dialogs/TrainModel/TrainModelDialog';

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
  const theme = useTheme();
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  const [selectDataDialog, setSelectDataDialog] = React.useState(false);
  const [displayMLModels, setDisplayMLModels] = React.useState(false);
  const [pipelineType, setPipelineType] = React.useState("");
  const [trainModelsDialogOpen, setTrainModelsDialogOpen] = React.useState(false);

  const openPipelineSelectMenu = (dialogType) => {
    if(dialogType == "train"){
      setPipelineType("train");
    } else if(dialogType == "data_preprocessing"){
      setPipelineType("data_preprocessing");
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
            <ListItem key={"Trained Models"} disablePadding sx={{ display: 'block' }} onClick={()=>{openTrainModelsMenu()}}>
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
                  <ListItemText primary={"Train Models"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
        </List>

    

      <List style={{position:"absolute",bottom:"10px"}}>
      <h2 style={{color:"#fff"}}>Account</h2>
        <ListItem key={"Notifications"} disablePadding sx={{ display: 'block' }} onClick={()=>{}}>
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
                    <NotificationsNoneIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Notifications"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>

            <ListItem key={"Settings"} disablePadding sx={{ display: 'block' }} onClick={()=>{}}>
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

            <ListItem key={"FAQ"} disablePadding sx={{ display: 'block' }} onClick={()=>{}}>
           
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
                    <HelpOutlineIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"FAQ"} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem>
        </List>
      </BigDrawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      </Box>
     {selectDataDialog && <PipelineSelectDialog pipelineType={pipelineType} open={selectDataDialog} handleClose={handleDataSelectDialogClose} />}
     {trainModelsDialogOpen && <TrainModelDialog handleClose={handleTrainModelsMenuClose} open={trainModelsDialogOpen} close={handleTrainModelsMenuClose} /> }
    </Box>
  );
}
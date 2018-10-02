import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createMuiTheme, withStyles, MuiThemeProvider } from '@material-ui/core/styles';
import {
  Divider, 
  Drawer, 
  IconButton, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grow,
  Typography
} from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RefreshIcon from '@material-ui/icons/Refresh';
import HistoryIcon from '@material-ui/icons/History';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {SHOW_PREFS} from './../../shared/actions/preferences';
import * as AppActions from './../../shared/actions/app';
import * as FileDialogHelpers from "./../helpers/input";

const drawerWidth = 240;

const sidebarTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
  overrides: {
    MuiDivider: {
      root: {
        'margin-left': '20px',
        'margin-right': '20px',
      },
    },
  },
});

const styles = theme => ({
  
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    position: 'relative',
    display: 'flex',
    'justify-content': 'flex-end',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    // background: theme.palette.primary.main,
    // color: 'white',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  primaryActions: {
    'flex-grow': 1,
  },
});

class Sidebar extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    openFile: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
  };

  state = {
    open: true,
    fileHover: false,
  };
  
  browseFile = () => {
    FileDialogHelpers.showEpubFileOrFolderBrowseDialog(this.props.openFile);
    return false;
  };
  
  onDragOver = e => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({fileHover: true});
    return false;
  };

  onDragLeave = e => {
    this.setState({fileHover: false});
    return false;
  };

  onDrop = e => {
    e.preventDefault();
    let filepath = e.dataTransfer.files[0].path;
    this.setState({fileHover: false});
    this.props.openFile(filepath);
    return false;
  };

  toggleDrawer = () => {
    this.setState({ open: !this.state.open });
  };


  render() {
    const { classes, ready, theme } = this.props;
    return (
      <MuiThemeProvider
      theme={sidebarTheme}>
      <Drawer
          variant="permanent"
          classes={{
            paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
          }}
          open={this.state.open}
        >
          <div className={classes.toggle}>
            <IconButton onClick={this.toggleDrawer}>
              {(theme.direction === 'rtl' && this.state.open || !this.state.open)
                ?<ChevronRightIcon />
                : <ChevronLeftIcon />}
            </IconButton>
          </div>
          <Divider />
          <List className={classes.primaryActions}>
            <ListItem button
              className={`${this.state.fileHover ? 'hover' : ''}
                          ${ready ? '' : 'processing'}`}
              onClick={this.browseFile}
              onDrop={this.onDrop}
              onDragOver={this.onDragOver}
              onDragLeave={this.onDragLeave}
              selected={this.state.fileHover}>
              <ListItemIcon>
                <AddCircleOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Check EPUB" />
            </ListItem>
            <ListItem button disabled>
              <ListItemIcon>
                <RefreshIcon />
              </ListItemIcon>
              <ListItemText primary="Rerun" />
            </ListItem>
            <ListItem button disabled>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary="History" />
            </ListItem>
            <ListItem button disabled>
              <ListItemIcon>
                <SaveAltIcon />
              </ListItemIcon>
              <ListItemText primary="Export" />
            </ListItem>
          </List>
          <Divider/>
          <List className={classes.otherActions}>
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" primaryTypographyProps={{color: 'textSecondary'}}/>
            </ListItem>
          </List>
        </Drawer>
        </MuiThemeProvider>
    );
  }
}
function mapStateToProps(state) {
  let { app: {ready}, preferences } = state;
  return {
    ready,
    preferences
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({SHOW_PREFS, ...AppActions}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles,{ withTheme: true })(Sidebar));


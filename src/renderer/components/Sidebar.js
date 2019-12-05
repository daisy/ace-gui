import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createMuiTheme, withStyles, MuiThemeProvider } from '@material-ui/core/styles';
import {
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RefreshIcon from '@material-ui/icons/Refresh';
import HistoryIcon from '@material-ui/icons/History';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {showPreferences} from './../../shared/actions/preferences';
import * as AppActions from './../../shared/actions/app';
import * as FileDialogHelpers from "../../shared/helpers/fileDialogs";

import { localizer } from './../../shared/l10n/localize';
const { localize } = localizer;

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
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
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
  buttonProcessing: {
    position: 'absolute',
    top: 4,
    left: 16,
    zIndex: 1,
    color: theme.palette.primary.contrastText,
  }
});

class Sidebar extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    openFile: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
  };

  state = {
    open: true,
  };

  showOpenEPUBDialog = () => {
    setTimeout(async () => {
      if (process.platform == 'darwin') {
        await FileDialogHelpers.showEpubFileOrFolderBrowseDialog(this.props.openFile);
      } else {
        await FileDialogHelpers.showEpubFileBrowseDialog(this.props.openFile);
      }
    }, 0);
    return false;
  };

  showExportReportDialog = () => {
    setTimeout(async () => {
      await FileDialogHelpers.showExportReportDialog((filepath) => {
        this.props.exportReport(filepath);
      });
    }, 0);
    return false;
  }

  toggleDrawer = () => {
    this.setState({ open: !this.state.open });
  };


  render() {
    const { classes, processing, theme, openFile, inputPath, reportPath } = this.props;

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
            <IconButton onClick={this.toggleDrawer}
              aria-label={`${this.state.open? localize("sidebar.minimize") : localize("sidebar.maximize")}`}>
              {(theme.direction === 'rtl' && this.state.open || !this.state.open)
                ?<ChevronRightIcon />
                : <ChevronLeftIcon />}
            </IconButton>
          </div>
          <Divider />
          <List className={classes.primaryActions}>
            <ListItem button
              disabled={processing.ace ? true : false}
              onClick={this.showOpenEPUBDialog}>
              <ListItemIcon>
                <AddCircleOutlineIcon/>
              </ListItemIcon>
              <ListItemText primary={localize("sidebar.checkEPUB")} />
              {processing.ace && reportPath &&
                <CircularProgress size={40} className={classes.buttonProcessing} />}
            </ListItem>
            <ListItem button
              onClick={() => openFile(inputPath)}
              disabled={!inputPath ? true : false}>
              <ListItemIcon>
                <RefreshIcon />
              </ListItemIcon>
              <ListItemText primary={localize("sidebar.reRun")} />
            </ListItem>
            <ListItem button disabled>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary={localize("sidebar.history")} />
            </ListItem>
            <ListItem button
              disabled={!reportPath ? true : false}
              onClick={this.showExportReportDialog}>
              <ListItemIcon>
                <SaveAltIcon />
              </ListItemIcon>
              <ListItemText primary={localize("sidebar.export")} />
              {processing.export && <CircularProgress size={40} className={classes.buttonProcessing} />}
            </ListItem>
          </List>
          <Divider/>
          <List className={classes.otherActions}>
            <ListItem button
              onClick={this.props.showPreferences}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={localize("sidebar.settings")}/>
            </ListItem>
          </List>
        </Drawer>
        </MuiThemeProvider>
    );
  }
}
function mapStateToProps(state) {
  let { app: {processing, inputPath, reportPath}, preferences: {language} } = state;
  return {
    language,
    inputPath,
    reportPath,
    processing,
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({showPreferences, ...AppActions}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles,{ withTheme: true })(Sidebar));

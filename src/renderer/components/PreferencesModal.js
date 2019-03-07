import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Typography from '@material-ui/core/Typography';
import {showFolderBrowseDialog} from "../../shared/helpers/fileDialogs";
import { hideModal } from './../../shared/actions/modal';
import { savePreferences } from './../../shared/actions/preferences';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {LANGUAGES, getCurrentLanguage} from './../../shared/l10n/localize';

const styles = theme => ({
  paper: {
    'width': '50vw',
  },
  browseControl: {
    display: 'grid',
    'grid-template-columns': '1fr auto',
    'grid-column-gap': '10px',
  },
  browseControlInputGroup: {
    color: theme.palette.text.primary,
    'grid-column': '1 / 2',
  },
  browseControlInput: {
    width: '100%',
  },
  browseControlHelperText: {
    'grid-column': '1 / 3',
  },
  browseControlInputDisabled: {
    color: 'rgba(0, 0, 0, 0.54)',
    cursor: 'not-allowed',
  },
  browseControlInputLabel: {
    color: theme.palette.text.primary,
  },
  browseControlInputOutline: {
    'border-color': theme.palette.text.primary,
    'background-color': 'rgba(0,0,0,0.04)',
  },
  browseControlButton: {
    margin: '0',
    padding: '14px',
    'grid-column': '2 / 3',
  },
  checkboxControlHelperText: {
    margin: '0 12px',
  },
  prefsGroup: {
    '&& > h3': {
      'margin-bottom': `${theme.spacing.unit*2}px`,
    },
    '&& > * + *': {
      'margin-left': `${theme.spacing.unit*2}px`,
    },
  },
  dialogActions: {
    margin: '8px 24px 24px'
  }
});


class PreferencesModal extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    modalType: PropTypes.string.isRequired,
    preferences: PropTypes.object.isRequired,
  };

  state = this.props.preferences;

  handleChange = prefkey => (event, checked) => {
    let value = (checked===undefined) ? event.target.value : checked;
    let newState = {
      [prefkey.group]: {
        ...this.state[prefkey.group],
        [prefkey.key]: value
      }
    }
    this.setState(newState);
  };

  handleChangeLanguage = arg => (event) => {
    const msg = `##### RENDERER PROCESS - handleChangeLanguage: ${event.target.value}`;
    console.log(msg);
    process.stdout.write(msg + '\n');
    const newState = {
      "language": event.target.value
    };
    this.setState(newState);
  };

  selectReportDir = () => {
    showFolderBrowseDialog(dir => {
      this.setState({
        reports: {
          ...this.state.reports,
          dir
        }
      })
    });
    return false;
  };

  savePrefs = () => {
    const { dispatch } = this.props;
    dispatch(savePreferences(this.state));
    dispatch(hideModal());
  }

  render() {

    let currentLanguage = this.state.language || getCurrentLanguage();

    // const msg = `##### RENDERER PROCESS - this.props/state: \n${JSON.stringify(this.props, null, "   ")}\n\n${JSON.stringify(this.state, null, "   ")}\n`;
    // console.log(msg);
    // process.stdout.write(msg + '\n');

    const {classes, dispatch, modalType} = this.props;

    return (
      <Dialog
        aria-labelledby="preferences-dialog-title"
        open={modalType != null}
        onClose={() => dispatch(hideModal())}
        onRendered={() => { this.forceUpdate() }}
        classes={{ paper: classes.paper }}>
        <DialogTitle id="preferences-dialog-title">Ace Preferences</DialogTitle>
        <DialogContent>
          <FormControl variant="outlined" margin="dense" fullWidth
          classes={{ root: classes.prefsGroup }}
          >
            <Typography variant="subheading">Internal Report Storage</Typography>
            <FormControl 
              aria-describedby="preferences-dialog-reports-dir-helper-text"
              variant="outlined"
              margin="dense"
              className={classes.browseControl}>
              <div className={classes.browseControlInputGroup}>
              <InputLabel htmlFor="preferences-dialog-reports-input"
                ref={ref => { this.labelRef = ReactDOM.findDOMNode(ref) }}
                classes={{ root: classes.browseControlInputLabel }}
                >Reports Data Directory</InputLabel>
              <OutlinedInput 
                id="preferences-dialog-reports-input"
                value={this.state.reports.dir}
                onChange={this.handleChange({group: 'reports', key: 'dir'})}
                disabled
                labelWidth={this.labelRef ? this.labelRef.offsetWidth : 0}
                classes={{ 
                  root: classes.browseControlInput,
                  notchedOutline: classes.browseControlInputOutline,
                  disabled: classes.browseControlInputDisabled,
                }}
                />
              </div>
              <Button variant="outlined" 
                classes={{ root: classes.browseControlButton}}
                onClick={this.selectReportDir}
                >Browse</Button>
              <FormHelperText id="preferences-dialog-reports-dir-helper-text"
                classes={{ root: classes.browseControlHelperText }}
                >(where Ace stores reports internally)</FormHelperText>
            </FormControl>
            {/* <FormControl aria-describedby='preferences-dialog-reports-organize-helper-text'
              margin="dense">
              <FormControlLabel
                label='Keep reports organize'
                labelPlacement='end'
                checked={this.state.reports.organize}
                value="reports.organize"
                onChange={this.handleChange({group: 'reports', key: 'organize'})}
                control={<Checkbox/>}
              />
              <FormHelperText 
                id="preferences-dialog-reports-organize-helper-text"
                variant='outlined'
                classes={{ contained: classes.checkboxControlHelperText }}
                >(stored each report in its own directory?)</FormHelperText>
            </FormControl> */}
            <FormControl aria-describedby='preferences-dialog-reports-overwrite-helper-text'
              margin="dense">
              <FormControlLabel
                label='Overwrite existing reports'
                labelPlacement='end'
                checked={this.state.reports.overwrite}
                value="reports.overwrite"
                onChange={this.handleChange({group: 'reports', key: 'overwrite'})}
                control={<Checkbox/>}
              />
              <FormHelperText 
                id="preferences-dialog-reports-overwrite-helper-text"
                variant='outlined'
                classes={{ contained: classes.checkboxControlHelperText }}
                >(allow writing new reports over previous ones?)</FormHelperText>
            </FormControl>
          </FormControl>

          <FormControl variant="outlined" margin="dense" fullWidth
          classes={{ root: classes.prefsGroup }}
          >
            <Typography variant="subheading">User Interface Language</Typography>
            <FormControl aria-describedby='preferences-dialog-user-interface-language-helper-text'
              margin="dense">
              <Select
                value={currentLanguage}
                onChange={this.handleChangeLanguage()}
                displayEmpty
                name="language"
              >
                <MenuItem value={"en"}>English</MenuItem>
                <MenuItem value={"fr"}>Francais</MenuItem>
              </Select>
              <FormHelperText 
                id="preferences-dialog-user-interface-language-helper-text"
                variant='outlined'
                classes={{ contained: classes.checkboxControlHelperText }}
                >(select the language for UI labels and messages)</FormHelperText>
            </FormControl>
          </FormControl>
        </DialogContent>
        <DialogActions classes={{ root: classes.dialogActions }}>
          <Button onClick={() => dispatch(hideModal())}>
            Cancel
          </Button>
          <Button onClick={this.savePrefs} variant="contained" color="secondary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
}

function mapStateToProps(state) {
  let { modal: {modalType}, preferences } = state;
  return {
    modalType,
    preferences
  };
}

export default connect(mapStateToProps)(withStyles(styles)(PreferencesModal));
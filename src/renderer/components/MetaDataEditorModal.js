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
import { hideModal } from './../../shared/actions/modal';
import { bindActionCreators } from 'redux';
import {openFile} from './../../shared/actions/app';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { localizer } from './../../shared/l10n/localize';
const { localize } = localizer;

// const a11yMeta = [
//   "schema:accessMode",
//   "schema:accessibilityFeature",
//   "schema:accessibilityHazard",
//   "schema:accessibilitySummary",
//   "schema:accessModeSufficient",
//   "schema:accessibilityAPI",
//   "schema:accessibilityControl",
//   "a11y:certifiedBy",
//   "dcterms:conformsTo"
//   ];

// const A11Y_META = {
//   'schema:accessMode': {
//     required: true,
//     allowedValues: [
//       'auditory',
//       'chartOnVisual',
//       'chemOnVisual',
//       'colorDependent',
//       'diagramOnVisual',
//       'mathOnVisual',
//       'musicOnVisual',
//       'tactile',
//       'textOnVisual',
//       'textual',
//       'visual',
//     ]
//   },
//   'schema:accessModeSufficient': {
//     recommended: true,
//     allowedValues: [
//       'auditory',
//       'tactile',
//       'textual',
//       'visual',
//     ]
//   },
//   'schema:accessibilityAPI': {
//     allowedValues: [
//       'ARIA'
//     ]
//   },
//   'schema:accessibilityControl': {
//     allowedValues: [
//       'fullKeyboardControl',
//       'fullMouseControl',
//       'fullSwitchControl',
//       'fullTouchControl',
//       'fullVideoControl',
//       'fullVoiceControl',
//     ]
//   },
//   'schema:accessibilityFeature': {
//     required: true,
//     allowedValues: [
//       'alternativeText',
//       'annotations',
//       'audioDescription',
//       'bookmarks',
//       'braille',
//       'captions',
//       'ChemML',
//       'describedMath',
//       'displayTransformability',
//       'highContrastAudio',
//       'highContrastDisplay',
//       'index',
//       'largePrint',
//       'latex',
//       'longDescription',
//       'MathML',
//       'none',
//       'printPageNumbers',
//       'readingOrder',
//       'rubyAnnotations',
//       'signLanguage',
//       'structuralNavigation',
//       'synchronizedAudioText',
//       'tableOfContents',
//       'taggedPDF',
//       'tactileGraphic',
//       'tactileObject',
//       'timingControl',
//       'transcript',
//       'ttsMarkup',
//       'unlocked',
//     ],
//   },
//   'schema:accessibilityHazard': {
//     allowedValues: [
//       'flashing',
//       'noFlashingHazard',
//       'motionSimulation',
//       'noMotionSimulationHazard',
//       'sound',
//       'noSoundHazard',
//       'unknown',
//       'none',
//     ]
//   },
//   'schema:accessibilitySummary': {
//     required: true,
//   }
// };

const styles = theme => ({
  paper: {
    'width': '50vw',
  },
  dialogActions: {
    margin: '8px 24px 24px'
  }
});


class MetaDataEditorModal extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
    modalType: PropTypes.string.isRequired,
  };

  state = {};

  saveMetadata = () => {
    // TODO: serialize edited Metadata into EPUB package OPF

    this.props.hideModal();

    if (!this.props.processing && this.props.inputPath && this.props.reportPath) {
      const openFile = this.props.openFile;
      const inputPath = this.props.inputPath;
      const epubBaseDir = this.props.epubBaseDir;
      
      setTimeout(() => {
        openFile(epubBaseDir || inputPath);
      }, 500);
    }
  }

  render() {

    const {classes, modalType} = this.props;

    return (
      <Dialog
        aria-labelledby="metadata-dialog-title"
        open={modalType != null}
        onClose={() => this.props.hideModal()}
        onRendered={() => { this.forceUpdate() }}
        classes={{ paper: classes.paper }}>
        <DialogTitle id="metadata-dialog-title">{`${localize("metadata.metadata")} (${localize("metadata.edit")})`}</DialogTitle>
        <DialogContent>
          <hr/>
          TODO
          <hr/>
        </DialogContent>
        <DialogActions classes={{ root: classes.dialogActions }}>
          <Button onClick={() => this.props.hideModal()}>
            {localize("metadata.cancel")}
          </Button>
          <Button onClick={this.saveMetadata} variant="contained" color="secondary">
            {localize("metadata.save")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
}

function mapStateToProps(state) {
  let { app: {inputPath, reportPath, epubBaseDir, processing: {ace}}, modal: {modalType} } = state;
  return {
    processing: ace,
    inputPath,
    reportPath,
    epubBaseDir,
    modalType,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({openFile, hideModal}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MetaDataEditorModal));
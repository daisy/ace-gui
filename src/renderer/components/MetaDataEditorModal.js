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
const { setCurrentLanguage, getCurrentLanguage, localize } = localizer;
import classNames from 'classnames';
import { ipcRenderer } from 'electron';
import {
  addMessage,
} from '../../shared/actions/app';
import epubUtils from '@daisy/epub-utils';
import logger from '@daisy/ace-logger';

// <meta property="schema:accessibilitySummary">
// This publication conforms to WCAG 2.0 Level AA.
// </meta>
// <meta property="schema:accessMode">textual</meta>
// <meta property="schema:accessMode">visual</meta>
// <meta property="schema:accessModeSufficient">textual,visual</meta>
// <meta property="schema:accessModeSufficient">textual</meta>
// <meta property="schema:accessibilityFeature">structuralNavigation</meta>
// <meta property="schema:accessibilityFeature">MathML</meta>
// <meta property="schema:accessibilityFeature">alternativeText</meta>
// <meta property="schema:accessibilityFeature">longDescriptions</meta>
// <meta property="schema:accessibilityAPI">ARIA</meta>
// <meta property="schema:accessibilityControl">fullKeyboardControl</meta>
// <meta property="schema:accessibilityControl">fullMouseControl</meta>
// <meta property="schema:accessibilityControl">fullTouchControl</meta>
// <meta property="schema:accessibilityHazard">noFlashingHazard</meta>
// <meta property="schema:accessibilityHazard">noSoundHazard</meta>
// <meta property="schema:accessibilityHazard">noMotionSimulationHazard</meta>

const a11yMeta = [
  "schema:accessMode",
  "schema:accessibilityFeature",
  "schema:accessibilityHazard",
  "schema:accessibilitySummary",
  "schema:accessModeSufficient",
  "schema:accessibilityAPI",
  "schema:accessibilityControl",
  "a11y:certifiedBy",
  "dcterms:conformsTo"
  ];

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
  },
  kbLink: {
    'text-align': 'right',
    'display': 'block',
  },
  rootGroup: {
    '&& > h3': {
      'margin-bottom': `${theme.spacing(2)}px`,
    },
    '&& > * + *': {
      'margin-left': `${theme.spacing(2)}px`,
    },
  },
  browseControl: {
    display: 'grid',
    'grid-template-columns': '1fr auto',
    'grid-column-gap': '10px',
  },
  browseControlInputGroup: {
    color: theme.palette.text.primary,
    'grid-column': '1 / 2',
    'margin-bottom': '1em',
  },
  browseControlInput: {
    width: '100%',
  },
  browseControlInputLabel: {
    color: theme.palette.text.primary,
  },
  browseControlInputOutline: {
    'border-color': theme.palette.text.primary,
    'background-color': 'rgba(0,0,0,0.04)',
  },
});

const KB_BASE = 'http://kb.daisy.org/publishing/';

class MetaDataEditorModal extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
    modalType: PropTypes.string.isRequired,
  };

  state = {
    metadata: {},
  };

  onKB = () => {
    const url = `${KB_BASE}docs/metadata/schema-org.html`;
    ipcRenderer.send('KB_URL', url);
    // shell.openExternal(url);
  }

  componentDidMount() {
    const inputPath = this.props.inputPath;
    const epubBaseDir = this.props.epubBaseDir;

    // const language = getCurrentLanguage();
    // if (language) {
    //   setCurrentLanguage(language);
    // }
    // logger.initLogger({ verbose: true, silent: false, fileName: "ace-gui.log" });

    const epub = new epubUtils.EPUB(epubBaseDir || inputPath);
    epub.extract(epubBaseDir)
    .then((epb) => {
      console.log(JSON.stringify(epb, null, 4));
      return epb.parse();
    })
    .then((epb) => {
      console.log(JSON.stringify(epb.metadata, null, 4));
      this.setState({
        metadata: epb.metadata,
      });
      
      // this.props.addMessage("test");
    })
    .catch((err) => {
      console.log(`Unexpected error: ${(err.message !== undefined) ? err.message : err}`);
      if (err.stack !== undefined) console.log(err.stack);
      this.props.hideModal();
      this.props.addMessage(err);
    });
  }

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

  renderMds() {
    const {classes} = this.props;

    // console.log(JSON.stringify(this.state, null, 4));
    const mdKeys = this.state.metadata ? Object.keys(this.state.metadata) : [];
    // console.log(JSON.stringify(mdKeys, null, 4));

    const flattened = [];

    let idx1 = -1;
    for (const mdname of mdKeys) {
      idx1++;

      let vals = this.state.metadata[mdname];
      if (!(vals instanceof Array)) {
        vals = [vals];
      }
      let idx2 = -1;
      for (const mdvalue of vals) {
        idx2++;

        const jsx = (
          <div key={`metadata_key2_${idx1}_${idx2}`} className={classes.browseControlInputGroup}>
          <FormControl
            variant="outlined"
            margin="dense"
            className={classes.browseControl}>
            <InputLabel htmlFor={`metadata2_${idx1}_${idx2}`}
              data-idx1={idx1}
              data-idx2={idx2}
              ref={(ref) => {
                  if (ref) {
                    const k = `labelRef2_${ref.getAttribute("data-idx1")}_${ref.getAttribute("data-idx2")}`;
                    this[k] = ReactDOM.findDOMNode(ref);
                  }
                }
              }
              classes={{ root: classes.browseControlInputLabel }}
            >{mdname}</InputLabel>
            <OutlinedInput 
              id={`metadata2_${idx1}_${idx2}`}
              value={mdvalue}
              onChange={() => {}}
              labelWidth={this[`labelRef2_${idx1}_${idx2}`] ? this[`labelRef2_${idx1}_${idx2}`].offsetWidth : 0}
              classes={{ 
                root: classes.browseControlInput,
                notchedOutline: classes.browseControlInputOutline,
              }}
              />
          </FormControl>
          </div>
          );
        flattened.push(jsx);
      }
    }
    return flattened;
  }

  render() {
    const {classes, modalType} = this.props;

    return (
      <Dialog
        onRendered={() => { setTimeout(() => { this.forceUpdate(); }, 500) }}
        aria-labelledby="metadata-dialog-title"
        open={modalType != null}
        onClose={() => this.props.hideModal()}
        classes={{ paper: classes.paper }}>
        <DialogTitle id="metadata-dialog-title">{`${localize("metadata.metadata")} (${localize("metadata.a11y")})`}</DialogTitle>
        <DialogContent>
            {
            // <FormControl variant="outlined" margin="dense" fullWidth
            // classes={{ root: classes.rootGroup }}
            // >
            // <Typography variant="h6">{localize("metadata.a11y")}</Typography>
            }
            {
              this.renderMds()
            }
            {
            // a11yMeta.map((amd, idx) => {
            //   return (
            //     <div key={`metadata_key_${idx}`} className={classes.browseControlInputGroup}>
            //     <FormControl
            //       variant="outlined"
            //       margin="dense"
            //       className={classes.browseControl}>
            //       <InputLabel htmlFor={`metadata_${idx}`}
            //         ref={ref => { this[`labelRef_${idx}`] = ReactDOM.findDOMNode(ref) }}
            //         classes={{ root: classes.browseControlInputLabel }}
            //       >{amd}</InputLabel>
            //       <OutlinedInput 
            //         id={`metadata_${idx}`}
            //         value={localize("metadata.value")}
            //         onChange={() => {}}
            //         labelWidth={this[`labelRef_${idx}`] ? this[`labelRef_${idx}`].offsetWidth : 0}
            //         classes={{ 
            //           root: classes.browseControlInput,
            //           notchedOutline: classes.browseControlInputOutline,
            //         }}
            //         />
            //     </FormControl>
            //     </div>
            //     );
            // })
            }
            {
            // </FormControl>
            }

          <hr/>
          <a
            tabIndex={0}
            className={classNames(classes.kbLink, 'external-link')}
            onKeyPress={(e) => { if (e.key === "Enter") { this.onKB(); }}}
            onClick={() => this.onKB()}
            >{localize("menu.knowledgeBase")}</a>
          
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
  return bindActionCreators({openFile, hideModal, addMessage}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MetaDataEditorModal));
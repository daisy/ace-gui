import path from 'path';
import fs from 'fs-extra';

const DOMParser = require('xmldom-alpha').DOMParser;
const XMLSerializer = require('xmldom-alpha').XMLSerializer;
const xpath = require('xpath');

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

// http://kb.daisy.org/publishing/docs/metadata/schema-org.html
// http://kb.daisy.org/publishing/docs/metadata/evaluation.html
//
// <meta property="schema:accessibilitySummary">
//     This publication conforms to WCAG 2.0 Level AA.
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
// <link property="dcterms:conformsTo" href="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aa"/>
// <meta property="a11y:certifiedBy">Dewey, Checkett and Howe</meta>
// <meta property="a11y:certifierCredential">Certifiably Accessible</meta>
// <link property="a11y:certifierReport" href="https://example.com/reports/a11y/pub.html"/>
//
// <meta name="schema:accessMode" content="textual"/>
// ...
// <meta name="dcterms:conformsTo" content="http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aa"/>
// <meta name="a11y:certifiedBy" content="Dewey, Checkett and Howe"/>
// <meta name="a11y:certifierCredential" content="Certifiably Accessible"/>
// <meta name="a11y:certifierReport" content="https://example.com/reports/a11y/pub.html"/>

const a11yMeta_links = [
  "a11y:certifierReport", //(link in EPUB3)
  "dcterms:conformsTo", //(link in EPUB3)
];
const a11yMeta = [
  "schema:accessMode",
  "schema:accessibilityFeature",
  "schema:accessibilityHazard",
  "schema:accessibilitySummary",
  "schema:accessModeSufficient",
  "schema:accessibilityAPI",
  "schema:accessibilityControl",
  "a11y:certifiedBy",
  "a11y:certifierCredential", //(MAY BE link in EPUB3)
].concat(a11yMeta_links);

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
    'margin-right': '1em',
    'margin-bottom': '2em',
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

const errorHandler = {
  warning: w => console.log(w),
  error: e => console.log(e),
  fatalError: fe => console.log(fe),
}

class MetaDataEditorModal extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
    modalType: PropTypes.string.isRequired,
  };

  state = {
    metadata: [],
  };
  isEPUB3 = false;
  packageOpfFilePath = undefined;
  packageOpfXmlDoc = undefined;
  packageOpfXPathSelect = undefined;

  onKBSchemaOrg = () => {
    const url = `${KB_BASE}docs/metadata/schema-org.html`;
    ipcRenderer.send('KB_URL', url);
    // shell.openExternal(url);
  }
  onKBEvaluation = () => {
    const url = `${KB_BASE}docs/metadata/evaluation.html`;
    ipcRenderer.send('KB_URL', url);
    // shell.openExternal(url);
  }
  onKB = () => {
    this.onKBSchemaOrg();
    this.onKBEvaluation();
  }

  componentDidMount() {
    const inputPath = this.props.inputPath;
    const epubBaseDir = this.props.epubBaseDir;

    this.isEPUB3 = false;
    this.packageOpfFilePath = undefined;
    this.packageOpfXmlDoc = undefined;
    this.packageOpfXPathSelect = undefined;

    // const language = getCurrentLanguage();
    // if (language) {
    //   setCurrentLanguage(language);
    // }
    // logger.initLogger({ verbose: true, silent: false, fileName: "ace-gui.log" });

    const p = epubBaseDir || inputPath;
    const epub = new epubUtils.EPUB(p);
    epub.extract(epubBaseDir)
    .then((epb) => {
      // console.log("before parse", JSON.stringify(epb, null, 4));
      return epb.parse();
    })
    .then((epb) => {
      // console.log("after parse", JSON.stringify(epb, null, 4));
      // console.log("metadata", JSON.stringify(epb.metadata, null, 4));

      this.packageOpfFilePath = path.join(epb.basedir, epb.packageDoc.src);
      // console.log("OPF filepath", this.packageOpfFilePath);

      const content = fs.readFileSync(this.packageOpfFilePath).toString();
      // console.log(content);
      this.packageOpfXmlDoc = new DOMParser({errorHandler}).parseFromString(content);
      this.packageOpfXPathSelect = xpath.useNamespaces(
        { opf: 'http://www.idpf.org/2007/opf',
          dc: 'http://purl.org/dc/elements/1.1/'});

      this.isEPUB3 = false;
      this.packageOpfXPathSelect('/opf:package/@version', this.packageOpfXmlDoc).forEach((version) => {
        this.isEPUB3 = version.nodeValue.trim().startsWith("3.");
      });
      // console.log(`isEPUB3: ${this.isEPUB3}`);

      const toRemove = [];

      let metadata = epb.metadata; // squished into unique key map with array values ... but we want to linearize for a 1-to-1 mapping with the editor UI list
      metadata = [];

      // this.packageOpfXPathSelect('/opf:package/opf:metadata/dc:*[not(@refines)]', this.packageOpfXmlDoc).forEach((dcElem) => {
      //   let name = `dc:${dcElem.localName}`;
      //   let content = dcElem.textContent;
      //   if (content) {
      //     content = content.trim();
      //   }
      //   if (name && content) {
      //     if (a11yMeta.includes(name)) {
      //       console.log(`${name} = ${content}`);
      //       const md = {
      //         name,
      //         content,
      //       };
      //       metadata.push(md);
      //       toRemove.push(dcElem);
      //     }
      //   }
      // });

      this.packageOpfXPathSelect('/opf:package/opf:metadata/opf:meta[not(@refines)]', this.packageOpfXmlDoc).forEach((meta) => {
        const prop = meta.getAttribute('property');
        if (prop) {
          if (meta.textContent) {
            let name = prop;
            if (name) {
              name = name.trim();
            }
            let content = meta.textContent;
            if (content) {
              content = content.trim();
            }
            if (name && content) {
              if (a11yMeta.includes(name)) {
                // console.log(`${name} = ${content}`);
                const md = {
                  name,
                  content,
                };
                metadata.push(md);
                toRemove.push(meta);
              }
            }
          }
        } else {
          let name = meta.getAttribute('name');
          if (name) {
            name = name.trim();
          }
          let content = meta.getAttribute('content');
          if (content) {
            content = content.trim();
          }
          if (name && content) {
            if (a11yMeta.includes(name)) {
              // console.log(`${name} = ${content}`);
              const md = {
                name,
                content,
              };
              metadata.push(md);
              toRemove.push(meta);
            }
          }
        }
      });

      this.packageOpfXPathSelect('/opf:package/opf:metadata/opf:link[not(@refines)]', this.packageOpfXmlDoc).forEach((link) => {
        const prop = link.getAttribute('property');
        const rel = link.getAttribute('rel');
        const href = link.getAttribute('href');
        let name = prop || rel;
        if (name) {
          name = name.trim();
        }
        let content = href;
        if (content) {
          content = content.trim();
          if (content) {
            content = decodeURI(content);
          }
        }
        if (name && content) {
          if (a11yMeta.includes(name)) { // not just a11yMeta_links because a11y:certifierCredential may be a link too
            // console.log(`${name} = ${content}`);
            const md = {
              name,
              content,
            };
            metadata.push(md);
            toRemove.push(link);
          }
        }
      });

      metadata = metadata.sort((a, b) => {
        if (a.name > b.name) {
            return 1;
        }
        if (b.name > a.name) {
            return -1;
        }
        return 0;
      });
      // console.log(JSON.stringify(metadata, null, 4));

      for (const elem of toRemove) {
        elem.parentNode.removeChild(elem);
        // elem.remove();
      }

      this.setState({
        metadata,
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

    this.props.hideModal();

    // console.log(JSON.stringify(this.state.metadata, null, 4));
    
    const metaDataElement = this.packageOpfXPathSelect('/opf:package/opf:metadata', this.packageOpfXmlDoc)[0];
    metaDataElement.appendChild(this.packageOpfXmlDoc.createTextNode("\n"));

    for (const md of this.state.metadata) {
      if (md.deleted) {
        continue;
      }
      if (!md.name || !md.content) {
        continue;
      }

      let childElement;

      const isDublinCore = md.name.startsWith("dc:");
      const useDublinCore = isDublinCore && this.isEPUB3;

      const isLink = a11yMeta_links.includes(md.name) ||
        md.name === "a11y:certifierCredential" && /https?:\/\//.test(md.content.trim());
      const useLink = isLink && this.isEPUB3;

      if (useDublinCore) {
        childElement = this.packageOpfXmlDoc.createElementNS(
          'http://purl.org/dc/elements/1.1/',
          md.name);
        childElement.appendChild(this.packageOpfXmlDoc.createTextNode(md.content.trim()));
      } else {
        childElement = this.packageOpfXmlDoc.createElementNS(
          'http://www.idpf.org/2007/opf',
          useLink ? "link" : "meta");
        if (useLink) {
          childElement.setAttribute("property", md.name);
          childElement.setAttribute("href", md.content.trim());
        } else if (this.isEPUB3) {
          childElement.setAttribute("property", md.name);
          childElement.appendChild(this.packageOpfXmlDoc.createTextNode(md.content.trim()));
        } else {
          childElement.setAttribute("name", md.name);
          childElement.setAttribute("content", md.content.trim());
        }
      }

      metaDataElement.appendChild(this.packageOpfXmlDoc.createTextNode("\n"));
      metaDataElement.appendChild(childElement);
    }
    metaDataElement.appendChild(this.packageOpfXmlDoc.createTextNode("\n\n"));
    
    let opfContent = new XMLSerializer().serializeToString(this.packageOpfXmlDoc);
    // console.log(opfContent);
    opfContent = opfContent.replace(/^\s+$/gm, "\n");
    // console.log(opfContent);

    fs.writeFileSync(this.packageOpfFilePath, opfContent);

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
    const metadatas = this.state.metadata || [];

    const flattened = [];

    let idx = -1;
    for (const metadata of metadatas) {
      idx++;

      if (metadata.deleted) {
        continue;
      }

      const mdname = metadata.name;
      const mdvalue = metadata.content;

      const jsx = (
        <div key={`metadata_key_${idx}`} className={classes.browseControlInputGroup}>
        <FormControl
          variant="outlined"
          margin="dense"
          className={classes.browseControl}>
          <InputLabel htmlFor={`metadata_${idx}`}
            data-idx={idx}
            ref={(ref) => {
                if (ref) {
                  const k = `labelRef_${ref.getAttribute("data-idx")}`;
                  this[k] = ReactDOM.findDOMNode(ref);
                }
              }
            }
            classes={{ root: classes.browseControlInputLabel }}
          >{mdname}</InputLabel>
          <OutlinedInput 
            id={`metadata_${idx}`}
            value={mdvalue}
            onChange={() => {}}
            labelWidth={this[`labelRef_${idx}`] ? this[`labelRef_${idx}`].offsetWidth : 0}
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

          <hr/>
          <a
            tabIndex={0}
            className={classNames(classes.kbLink, 'external-link')}
            onKeyPress={(e) => { if (e.key === "Enter") { this.onKB(); }}}
            onClick={() => this.onKB()}
            >{`${localize("menu.knowledgeBase")} (${localize("menu.help")})`}</a>

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
            // </FormControl>
            }

          
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
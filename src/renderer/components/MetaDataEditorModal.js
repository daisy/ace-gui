import path from 'path';
import fs from 'fs-extra';

const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;
const xpath = require('xpath');

import ReactSelect from 'react-select';
import { components } from "react-select";
// import CreatableSelect from 'react-select/creatable';

import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CancelIcon from '@material-ui/icons/Cancel';
// import AddBoxIcon from '@material-ui/icons/AddBox';
// import AddIcon from '@material-ui/icons/Add';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles, withTheme } from '@material-ui/core/styles';
// import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
// import Typography from '@material-ui/core/Typography';
import { hideModal } from './../../shared/actions/modal';
import { bindActionCreators } from 'redux';
import {openFile} from './../../shared/actions/app';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { localizer } from './../../shared/l10n/localize';
const { localize, getCurrentLanguage } = localizer; // setCurrentLanguage
import classNames from 'classnames';
import { ipcRenderer } from 'electron';
import {
  addMessage,
} from '../../shared/actions/common';
// import epubUtils from '@daisy/epub-utils';
// import logger from '@daisy/ace-logger';

import a11yMetadata from '@daisy/ace-core/lib/core/a11y-metadata';

// http://kb.daisy.org/publishing/docs/metadata/schema.org/index.html
// http://kb.daisy.org/publishing/docs/metadata/evaluation.html

const conformsToURLs = a11yMetadata.conformsToStrings.concat(a11yMetadata.conformsToURLs);
const a11yMeta_links = a11yMetadata.a11yMeta_links;
const a11yMeta = a11yMetadata.a11yMeta;
const A11Y_META = a11yMetadata.A11Y_META;

// color: 'red',
// 'background-color': 'red',
// 'border-color': 'red',
// 'outline-color': 'red',
// 'outline-style': 'solid',
// 'outline-width': '2px',
// 'outline-offset': '1px',
// 'box-shadow': '0px 0px 0px 2px rgb(219,28,28)',
const styles = theme => ({
  paper: {
    minWidth: '70vw',
    maxWidth: '70vw',
    minHeight: '95vh',
    maxHeight: '95vh',
    'width': '50vw',
  },
  dialogActions: {
    margin: '8px 8px 8px 8px'
  },
  kbLinkContainer: {
    'text-align': 'right',
    'display': 'block',
    fontSize: '80%',
  },
  kbLink: {
    'margin-left': '1em',
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
    // color: theme.palette.text.primary,
    'grid-column': '1 / 2',
    'margin-bottom': '3em',
  },
  bottomMargin: {
    'margin-bottom': '2em',
  },
  notFlagged: {
    'border-left': "6px solid transparent",
  },
  notFlagged_: {
    'border-right': "6px solid transparent",
  },
  red: {
    'border-left': "6px solid rgb(219,28,28) !important",
  },
  red_: {
    'border-right': "6px solid rgb(219,28,28) !important",
  },
  orange: {
    'border-left': "6px solid orange !important",
  },
  orange_: {
    'border-right': "6px solid orange !important",
  },
  silver: {
    'border-left': "6px solid silver !important",
  },
  silver_: {
    'border-right': "6px solid silver !important",
  },
  browseControlInput: {
    width: '100%',
    "font-size": "90%",
  },
  browseControlInputLabelRaised: {
    // color: '#333333',
    'background-color': 'white',
    'padding-left': '4px',
    'padding-right': '4px',
    "font-size": "130%",
    'padding-top': '0px !important',
  },
  browseControlInputLabelRoot: {
    // color: '#333333',
    'padding-top': '5px',
  },
  browseControlInputOutline: {
    'border-color': theme.palette.text.primary,
    // 'background-color': 'rgba(0,0,0,0.04)',
  },
});

const KB_BASE = 'http://kb.daisy.org/publishing/';

const errorHandler = {
  warning: w => console.log(w),
  error: e => console.log(e),
  fatalError: fe => console.log(fe),
}

const CustomValueContainer = ({ children, ...props }) => {
  return (
    <components.ValueContainer {...props}>
      <components.Placeholder {...props} isFocused={props.isFocused}>
        {props.selectProps.placeholder}
      </components.Placeholder>
      {React.Children.map(children, child => {
        return child && child.type !== components.Placeholder ? child : null;
      })}
    </components.ValueContainer>
  );
};

class MetaDataEditorModal extends React.Component {

  static propTypes = {
    classes: PropTypes.object.isRequired,
    modalType: PropTypes.string.isRequired,
  };

  state = {
    metadata: [],
    metadataAdd: undefined,
  };
  isEPUB3 = false;
  packageOpfFilePath = undefined;
  packageOpfXmlDoc = undefined;
  packageOpfXPathSelect = undefined;

  onKBSchemaOrg = () => {
    const url = `${KB_BASE}${getCurrentLanguage() === "ja" ? "ja" : "docs"}/metadata/schema.org/index.html`;
    ipcRenderer.send('KB_URL', url);
    // shell.openExternal(url);
  }
  onKBEvaluation = () => {
    const url = `${KB_BASE}${getCurrentLanguage() === "ja" ? "ja" : "docs"}/metadata/evaluation.html`;
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

    // const l10nDoneCallback = () => {}; // no need to async/await on this
    // const language = getCurrentLanguage();
    // if (language) {
    //   setCurrentLanguage(language, l10nDoneCallback);
    // }
    // logger.initLogger({ verbose: true, silent: false, fileName: "ace-gui.log" });

    let perfTime = performance.now();

    const processOpf = () => {
      const fileStr = fs.readFileSync(this.packageOpfFilePath).toString();
      // console.log(fileStr);
      this.packageOpfXmlDoc = new DOMParser({errorHandler}).parseFromString(fileStr);
      this.packageOpfXPathSelect = xpath.useNamespaces(
        { opf: 'http://www.idpf.org/2007/opf',
          dc: 'http://purl.org/dc/elements/1.1/'});

      this.isEPUB3 = false;
      this.packageOpfXPathSelect('/opf:package/@version', this.packageOpfXmlDoc).forEach((version) => {
        this.isEPUB3 = version.nodeValue.trim().startsWith("3.");
      });
      // console.log(`isEPUB3: ${this.isEPUB3}`);

      const toRemove = [];

      // squished into unique key map with array values ...
      // but we want to linearize for a 1-to-1 mapping with the editor UI list
      // let metadata = epb.metadata;
      let metadata = [];

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
        const rel = link.getAttribute('rel');
        const href = link.getAttribute('href');
        let name = rel;
        if (name) {
          name = name.trim();
        }
        let content = href;
        if (content) {
          content = content.trim();
          if (content) {
            content = decodeURIComponent(content);
          }
        }
        if (name && content) {
          if (a11yMeta.includes(name)) { // not just a11yMeta_links because a11y:certifierCredential or dcterms:conformsTo may be a link too
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

      Object.keys(A11Y_META).forEach((name) => {
        if (A11Y_META[name].required || A11Y_META[name].recommended) {
          const found = metadata.find((md) => {
            return md.name === name;
          });
          if (!found) {
            metadata.push({
              name,
              content: "",
            });
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

      const timeNow = performance.now();
      const diffTime = timeNow - perfTime;
      perfTime = timeNow;
      console.log(`TIME: OPF METADATA ${diffTime}ms`);

      this.setState({
        metadata,
      });
    };
    const setOpfPath = () => {
      const containerXmlFilePath = path.join(epubBaseDir, "META-INF", "container.xml");
      const fileStr = fs.readFileSync(containerXmlFilePath).toString();
      const containerXmlDoc = new DOMParser({errorHandler}).parseFromString(fileStr);
      const containerXmlXPathSelect = xpath.useNamespaces(
        { ocf: 'urn:oasis:names:tc:opendocument:xmlns:container' });

      const rootfiles = containerXmlXPathSelect('/ocf:container/ocf:rootfiles/ocf:rootfile[@media-type="application/oebps-package+xml"]/@full-path', containerXmlDoc);
      if (rootfiles.length > 0) {
        this.packageOpfFilePath = path.join(epubBaseDir, decodeURIComponent(rootfiles[0].nodeValue));
        console.log("OPF filepath", this.packageOpfFilePath);
      }
      if (!this.packageOpfFilePath || !fs.existsSync(this.packageOpfFilePath)) {
        // fs.realpathSync(outdir)
        this.props.hideModal();
        this.props.addMessage(`PACKAGE OPF !! ${this.packageOpfFilePath}`);
      }
      this.props.addMessage(`EPUB OPF: ${this.packageOpfFilePath}`);

      const timeNow = performance.now();
      const diffTime = timeNow - perfTime;
      perfTime = timeNow;
      console.log(`TIME: META INF CONTAINER XML ${diffTime}ms`);
    };
    setOpfPath();
    processOpf();

    // lazy setOpfPath(), using Ace core APIs (but VERY computationally expensive):
    // const p = epubBaseDir || inputPath;
    // const epub = new epubUtils.EPUB(p);
    // epub.extract(epubBaseDir)
    // .then((epb) => {
    //   const timeNow = performance.now();
    //   const diffTime = timeNow - perfTime;
    //   perfTime = timeNow;
    //   console.log(`TIME: EXTRACT ${diffTime}ms`);

    //   // console.log("before parse", JSON.stringify(epb.metadata, null, 4));

    //   return epb.parse();
    // })
    // .then((epb) => {
    //   const timeNow = performance.now();
    //   const diffTime = timeNow - perfTime;
    //   perfTime = timeNow;
    //   console.log(`TIME: PARSE ${diffTime}ms`);

    //   // console.log("after parse", JSON.stringify(epb.metadata, null, 4));

    //   this.packageOpfFilePath = path.join(epb.basedir, epb.packageDoc.src);
    //   // console.log("OPF filepath", this.packageOpfFilePath);

    //   processOpf();
    // })
    // .catch((err) => {
    //   console.log(`Unexpected error: ${err.message ? err.message : err}`);
    //   if (err.stack !== undefined) console.log(err.stack);

    //   this.props.hideModal();
    //   this.props.addMessage(`${err.message ? err.message : err}`);
    // });
  }

  saveMetadata = () => {

    this.props.hideModal();

    let perfTime = performance.now();

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
        md.name === "a11y:certifierCredential" && /^https?:\/\//.test(md.content) ||
        md.name === "dcterms:conformsTo" && /^https?:\/\//.test(md.content)
        ;
      const useLink = isLink && this.isEPUB3;

      if (useDublinCore) {
        childElement = this.packageOpfXmlDoc.createElementNS(
          'http://purl.org/dc/elements/1.1/',
          md.name);
        childElement.appendChild(this.packageOpfXmlDoc.createTextNode(md.content));
      } else {
        childElement = this.packageOpfXmlDoc.createElementNS(
          'http://www.idpf.org/2007/opf',
          useLink ? "link" : "meta");
        if (useLink) {
          childElement.setAttribute("rel", md.name);
          childElement.setAttribute("href", md.content);
        } else if (this.isEPUB3) {
          childElement.setAttribute("property", md.name);
          childElement.appendChild(this.packageOpfXmlDoc.createTextNode(md.content));
        } else {
          childElement.setAttribute("name", md.name);
          childElement.setAttribute("content", md.content);
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

    const timeNow = performance.now();
    const diffTime = timeNow - perfTime;
    perfTime = timeNow;
    console.log(`TIME: PACKAGE OPF SAVE ${diffTime}ms`);

    if (!this.props.processingAce && this.props.inputPath && this.props.reportPath) {
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

    let flagged = {};

    // console.log(JSON.stringify(this.state, null, 4));
    const metadatas = this.state.metadata || [];

    const flattened = [];

    let mdIndex = -1;
    for (const metadata of metadatas) {
      mdIndex++;

      if (metadata.deleted) {
        continue;
      }

      const mdName = metadata.name;
      const isAccessibilitySummary = mdName === "schema:accessibilitySummary";
      const isAccessModeSufficient = mdName === "schema:accessModeSufficient";
      const isConformsTo = mdName === "dcterms:conformsTo";
      const allowedValues =
        ((mdName in A11Y_META) && A11Y_META[mdName].allowedValues) ?
        A11Y_META[mdName].allowedValues :
        (isConformsTo ? conformsToURLs : null);
      const mdContent = metadata.content; // can be empty string placeholder
      const mdObj = {
        name: mdName,
        content: mdContent,
        contentSplit: null,
        index: mdIndex,

        allowedValues,

        isMissingRequired:
          !mdContent &&
          (mdName in A11Y_META) &&
          A11Y_META[mdName].required,

        isMissingRecommended:
          !mdContent &&
          (mdName in A11Y_META) &&
          A11Y_META[mdName].recommended,

        isDiscouraged:
          (mdName in A11Y_META) && A11Y_META[mdName].discouraged,

        isNotSupported:
          !isAccessModeSufficient && // updated below
          !isConformsTo && // allow arbitrary value
          mdContent &&
          allowedValues && !allowedValues.includes(mdContent),
      };
      if (isAccessModeSufficient) {
        if (mdContent) {
          mdObj.contentSplit = mdContent.split(",")
            .map(s => s.trim())
            .filter(s => s.length)
            .map(s => {
              const isNotSupported = allowedValues && !allowedValues.includes(s);
              if (isNotSupported) {
                mdObj.isNotSupported = true;
              }
              return {
                content: s,
                isNotSupported,
              };
            });
          if (!mdObj.contentSplit.length) {
            mdObj.contentSplit = null;
          }
        } else {
          mdObj.contentSplit = [];
        }
      }

      if (mdObj.isMissingRequired) {
        flagged.isMissingRequired = true;
      }

      if (mdObj.isMissingRecommended) {
        flagged.isMissingRecommended = true;
      }

      if (mdObj.isNotSupported) {
        flagged.isNotSupported = true;
      }

      if (mdObj.isDiscouraged) {
        flagged.isDiscouraged = true;
      }

      // console.log(`RENDER METADATA: ${mdObj.index}`, JSON.stringify(mdObj, null, 4));

      const doMultipleSelect = (mdObj.allowedValues && isAccessModeSufficient) ? mdObj : null;
      const doSingleSelect = (mdObj.allowedValues && !isAccessModeSufficient) ? mdObj : null;

      // for doSingleSelect (mdObj.allowedValues && !isAccessModeSufficient)
      const renderSingleSelect = () => {
        const doSingleSelectCustom = isConformsTo;

        // data-name={mdObj.name}
        // data-content={mdObj.content}
        // data-mdindex={mdObj.index}
        return (<Autocomplete
            id={`metadata_${mdObj.index}`}

            value={mdObj}

            options={mdObj.allowedValues ? mdObj.allowedValues.map(allowedValue => {
              return {
                content: allowedValue,
                index: mdObj.index,
              };
            }) : undefined}

            getOptionSelected={
              (option, value) => {
                // console.log("getOptionSelected 1", JSON.stringify(option, null, 4));
                // console.log("getOptionSelected 2", JSON.stringify(value, null, 4));
                return value.content === option.content;
              }
            }
            getOptionLabel={option => option.content}

            filterOptions={(options, params) => {
              // console.log("Autocomplete filterOptions BEFORE", JSON.stringify(options, null, 4));
              const i = options[0].index;
              const mdContentCurrent = this.state.metadata[i].content;
              if (doSingleSelectCustom &&
                mdContentCurrent &&
                !options.find((option) => option.content === mdContentCurrent)) {

                options.push({
                  content: mdContentCurrent,
                  index: i,
                });
                // console.log("Autocomplete filterOptions OPTIONS ADD", JSON.stringify(options[options.length-1], null, 4));
              }
              const filtered = createFilterOptions()(options, params);
              // console.log("Autocomplete filterOptions INIT", JSON.stringify(filtered, null, 4));
              const inVal = params.inputValue ? params.inputValue.trim() : "";
              if (doSingleSelectCustom &&
                inVal &&
                !filtered.find((option) => option.content === inVal)) {

                filtered.push({
                  content: inVal,
                  index: i,
                });
                // console.log("Autocomplete filterOptions CUSTOM ADD", JSON.stringify(filtered[filtered.length-1], null, 4));
              }

              // console.log("Autocomplete filterOptions AFTER", JSON.stringify(filtered, null, 4));
              return filtered;
            }}

            onBlur={(event) => {
              const ipt = event.currentTarget.querySelector("input");
              if (!ipt) {
                return;
              }
              const inVal = ipt.value ? ipt.value.trim() : "";
              // console.log("Autocomplete onBlur", JSON.stringify(inVal, null, 4));
              // if (!inVal) {
              //   return;
              // }

              if (inVal && !doSingleSelectCustom) {
                if (mdObj.allowedValues && !mdObj.allowedValues.includes(inVal)) {
                  // console.log("Autocomplete onBlur !doSingleSelectCustom", JSON.stringify(mdObj, null, 4));
                  return;
                }
              }

              // const dataIndex = event.currentTarget.getAttribute("data-mdindex");
              const i = mdObj.index; // parseInt(dataIndex, 10);
              const newMd = this.state.metadata;
              newMd[i].content = inVal;
              // console.log("Autocomplete onBlur STATE-METADATA", JSON.stringify(this.state.metadata, null, 4));
              this.setState({
                metadata: newMd,
              });
            }}

            onChange={(event, obj) => {
              // console.log("Autocomplete onChange", JSON.stringify(obj, null, 4));

              // const dataIndex = event.currentTarget.getAttribute("data-mdindex");
              const i = mdObj.index; // parseInt(dataIndex, 10);

              if (typeof obj === "string") {
                obj = {
                  content: obj.trim(),
                  index: i,
                };
              } else if (!obj) {
                obj = {
                  content: "",
                  index: i,
                };
              }

              if (obj.content && !doSingleSelectCustom) {
                if (mdObj.allowedValues && !mdObj.allowedValues.includes(obj.content)) {
                  // console.log("Autocomplete onChange !doSingleSelectCustom", JSON.stringify(mdObj, null, 4));
                  return;
                }
              }
              const newMd = this.state.metadata;
              newMd[obj.index].content = obj.content;
              // console.log("Autocomplete onChange STATE-METADATA", JSON.stringify(this.state.metadata, null, 4));
              this.setState({
                metadata: newMd,
              });
            }}

            renderInput={params =>
              <TextField {...params}
              inputProps={{
                ...params.inputProps,
                // onBlur: (e) => {
                //   console.log(e.currentTarget);
                // },
              }}
              label={mdObj.name} variant="outlined" />
            }

            freeSolo={/* !mdObj.allowedValues || */ doSingleSelectCustom}
            disableClearable={false}
            includeInputInList={false}
            disableListWrap={true}
            autoSelect={false}
            autoHighlight={false}

            classes={
              //root,focused,tag,tagSizeSmall,hasPopupIcon,hasClearIcon,inputRoot,input,inputFocused,endAdornment,clearIndicator,clearIndicatorDirty,popupIndicator,popupIndicatorOpen,popper,popperDisablePortal,paper,listbox,loading,noOptions,option,groupLabel,groupUl
              {
            }}
        />);
      };

      // for doMultipleSelect (mdObj.allowedValues && isAccessModeSufficient)
      const renderMultipleSelect = () => {
        // return <></>;
        // data-name={mdObj.name}
        // data-content={mdObj.content}
        // data-mdindex={mdObj.index}
        return (<ReactSelect
          id={`metadata_${mdObj.index}`}
          options={
            A11Y_META[mdObj.name].allowedValues.map((allowedValue) => {
              return {
                label: allowedValue,
                value: allowedValue,
                index: mdObj.index,
              };
            })
          }
          value={
            mdObj.contentSplit.map(item => {
              return {
                label: item.content,
                value: item.content,
                isNotSupported: item.isNotSupported,
              };
            })
          }

          onChange={(values, obj) => {

            // const dataIndex = obj.name.split("_")[1];
            const index = mdObj.index; // parseInt(dataIndex, 10);

            if (obj.action === "clear") {
              const newMd = this.state.metadata;
              newMd[index].content = "";
              // console.log("ReactSelect onChange clear STATE-METADATA", JSON.stringify(this.state.metadata, null, 4));
              this.setState({
                metadata: newMd,
              });
            } else if (obj.action === "remove-value") {
              const newMd = this.state.metadata;
              // const arr = newMd[index].content.split(",").
              //   filter(s => s.trim().length).
              //   filter(s => s !== obj.removedValue.value);
              // newMd[index].content = arr.join(",");
              newMd[index].content = !values ? "" : values.map((v) => v.value).join(",");
              // console.log("ReactSelect onChange remove-value STATE-METADATA", JSON.stringify(this.state.metadata, null, 4));
              this.setState({
                metadata: newMd,
              });
            } else if (obj.action === "select-option") {
              const newMd = this.state.metadata;
              // const arr = newMd[index].content.split(",").
              //   filter(s => s.trim().length).
              //   concat([obj.option.value]);
              // newMd[index].content = arr.join(",");
              newMd[index].content = !values ? "" : values.map((v) => v.value).join(",");
              // console.log("ReactSelect onChange select-option STATE-METADATA", JSON.stringify(this.state.metadata, null, 4));
              this.setState({
                metadata: newMd,
              });
            }
          }}

          components={{
            ValueContainer: CustomValueContainer
          }}

          menuPortalTarget={document.querySelector('body')}
          maxMenuHeight={100}

          menuPosition={'fixed' /* 'absolute' */}
          menuPlacement={'bottom' /* 'auto' | 'top' */}

          className='react-select-container'
          classNamePrefix="react-select"

          styles={{
            container: (provided, state) => {
              // console.log(state);
              return {
              ...provided,
              marginTop: 0,
              paddingTop: 4,
              border: state.isFocused ? "2px solid black" : "1px solid #333333",
              borderRadius: 4,
            }},
            placeholder: (provided, state) => {
              // console.log("ReactSelect placeholder STATE-METADATA", JSON.stringify(state, null, 4));
              return {
              ...provided,
              background: "white",
              color: "black",
              paddingLeft: 4,
              paddingRight: 4,
              position: "absolute",
              top: state.hasValue || state.selectProps.inputValue ? -9 : "50%",
              transition: "top 0.1s, font-size 0.1s",
              fontSize: (state.hasValue || state.selectProps.inputValue) && 14
            }},
            control: base => ({
              ...base,
              border: "none",
              boxShadow: "0 !important"
            }),
            menu: base => ({
              ...base,
              zIndex: "9999 !important",
              // position: 'fixed',
            }),
            menuPortal: base => ({
              ...base,
              zIndex: "9999 !important",
              transform: 'translateZ(0)'
            }),
            multiValue: (styles, { data, isDisabled, isFocused, isSelected }) => {
              // console.log("ReactSelect multiValue STATE-METADATA", JSON.stringify(data, null, 4));
              return {
                ...styles,
                ...(data.isNotSupported ? { border: '1px solid rgb(219,28,28)' } : {})
              };
            },
          }}

          closeMenuOnSelect={true}
          isMulti={true}
          placeholder={mdObj.name}
          isSearchable={true}
          openMenuOnClick={true}
        />);
      };

      // for all but doSingleSelect and doMultipleSelect ((mdObj.allowedValues && isAccessModeSufficient) and (mdObj.allowedValues && !isAccessModeSufficient))
      const renderBasicInput = () => {
        // data-mdindex={mdObj.index}
        // inputProps={{"data-mdindex": `${mdObj.index}`}}
        return (<>
          <InputLabel htmlFor={`metadata_${mdObj.index}`}
            ref={(ref) => {
                if (ref) {
                  const attr = mdObj.index; // ref.getAttribute("data-mdindex");
                  const k = `labelRef_${attr}`;
                  this[k] = ReactDOM.findDOMNode(ref);
                }
              }
            }
            classes={{
              root: mdObj.content ? classes.browseControlInputLabelRaised : classes.browseControlInputLabelRoot,
              focused: classes.browseControlInputLabelRaised
            }}
          >{mdObj.name}</InputLabel>

          <OutlinedInput
            id={`metadata_${mdObj.index}`}
            value={mdObj.content}
            multiline={isAccessibilitySummary}
            onChange={(event) => {
              // const dataIndex = event.target.getAttribute("data-mdindex");
              const index = mdObj.index; // parseInt(dataIndex, 10);
              const val = event.target.value;

              const newMd = this.state.metadata;
              newMd[index].content = val;
              this.setState({
                metadata: newMd,
              });
            }}
            labelWidth={this[`labelRef_${mdObj.index}`] ? this[`labelRef_${mdObj.index}`].offsetWidth : 0}
            classes={{
              root: classes.browseControlInput,
              notchedOutline: classes.browseControlInputOutline,
            }}
            />
        </>);
      };

      const divLabel = (mdObj.isMissingRecommended || mdObj.isMissingRequired) ?
        localize("report.metadataSection.missing") :
        (mdObj.isNotSupported ? localize("report.violations") : (mdObj.isDiscouraged ? localize("report.summarySection.best-practice") : undefined));

      let allowDelete = true;
      if ((mdObj.name in A11Y_META) && A11Y_META[mdObj.name].required) {
        const thereIsAnotherOne = this.state.metadata.find((md, j) => {
          if (md.deleted) {
            return false; // skip already-deleted metadatas
          }
          if (j === mdObj.index) {
            return false; // self => continue iteration
          }
          if (md.name !== mdObj.name) {
            return false; // ignore different names
          }
          // if (!md.content) {
          //   return false; // ignore empties
          // }
          return (md.name in A11Y_META) && A11Y_META[md.name].required;
        });
        if (!thereIsAnotherOne) {
          allowDelete = false;
        }
      }

      // data-mdindex={mdObj.index}
      const jsx = (
        <div key={`metadata_key_${mdObj.index}`}
          title={divLabel}
          aria-label={divLabel}
          className={classNames(classes.browseControlInputGroup, classes.notFlagged,
            (mdObj.isMissingRequired || mdObj.isNotSupported) ? classes.red :
              (mdObj.isMissingRecommended || mdObj.isDiscouraged ? classes.orange : (!mdObj.content ? classes.silver : undefined)))}
          >
        <FormControl
          variant="outlined"
          margin="dense"
          className={classes.browseControl}>

          {
          doSingleSelect ? renderSingleSelect() : (doMultipleSelect ? renderMultipleSelect() : renderBasicInput())
          }
          {
          <IconButton
            disabled={!allowDelete}
            onClick={(event) => {
              // const dataIndex = event.currentTarget.getAttribute("data-mdindex");
              const index = mdObj.index; // parseInt(dataIndex, 10);

              const newMd = this.state.metadata;
              newMd[index].deleted = true;
              this.setState({
                metadata: newMd,
              });
            }}
            aria-label={localize("metadata.delete")}>
            <CancelIcon />
          </IconButton>
          }
        </FormControl>
        </div>
      );
      flattened.push(jsx);
    }

    // <InputLabel id="label_add">{localize("metadata.metadata")}</InputLabel>
    // labelId="label_add"

    return [flattened, flagged];
  }

  render() {
    const {classes, modalType} = this.props;
    // className={classNames(classes.browseControlInputGroup)}

    const [metadataJsx, flagged] = this.renderMds();
    return (
      <Dialog
        disableEscapeKeyDown={true}
        onRendered={() => { setTimeout(() => { this.forceUpdate(); }, 500) }}
        aria-labelledby="metadata-dialog-title"
        open={modalType != null}
        onClose={() => this.props.hideModal()}
        classes={{ paper: classes.paper }}>
        <DialogTitle id="metadata-dialog-title">
          {`${localize("metadata.metadata")} - ${localize("metadata.a11y")}`}

          <div className={classNames(classes.kbLinkContainer)}>
            <span>{`${localize("menu.knowledgeBase")} (${localize("menu.help")}):`}</span>

            <a
                href="#"
                tabIndex={0}
                className={classNames('external-link', classes.kbLink)}
                onKeyPress={(e) => { if (e.key === "Enter") { this.onKBSchemaOrg(); }}}
                onClick={() => this.onKBSchemaOrg()}
                >{`#1`}</a>

            <a
                href="#"
                tabIndex={0}
                className={classNames('external-link', classes.kbLink)}
                onKeyPress={(e) => { if (e.key === "Enter") { this.onKBEvaluation(); }}}
                onClick={() => this.onKBEvaluation()}
                >{`#2`}</a>
          </div>

        </DialogTitle>
        <DialogContent
        style={{
          borderBottom: "1px solid #333333",
          borderTop: "1px solid #333333",
          boxSizing: "border-box",
          paddingTop: "8px",
          paddingBottom: "8px",
          paddingLeft: "28px",
          paddingRight: "28px",
        }}
          ref={ref => { this.domRef = ReactDOM.findDOMNode(ref) }}
        >

        <div
        >
            {
          // className={classNames(classes.notFlagged_,
          //   (flagged.isMissingRequired || flagged.isNotSupported) ? classes.red_ : (flagged.isMissingRecommended ? classes.orange_ : undefined)
          //   )}

            // <FormControl variant="outlined" margin="dense" fullWidth
            // classes={{ root: classes.rootGroup }}
            // >
            // <Typography variant="h6">{localize("metadata.a11y")}</Typography>
            }
            {
              metadataJsx
            }
            {
            // </FormControl>
            }
        </div>

        </DialogContent>
        <DialogActions classes={{ root: classes.dialogActions }}>

          <div style={{
              width: "100%",
              paddingRight: "10px",
              paddingLeft: "10px",
              paddingBottom: "4px",
              // border: "1px solid silver",
              // borderRadius: "4px",
              marginRight: "100px",
            }}
            key={`addKey`}>

            <FormControl
              variant="outlined"
              margin="dense"
              className={classes.browseControl}>
                <Select defaultValue={a11yMeta[0]}
                  onChange={(event) => {
                    this.setState({
                      metadataAdd: event.target.value,
                    });
                  }}>
                  {
                    a11yMeta.filter((name) => !(name in A11Y_META) || !A11Y_META[name].discouraged).map((a, i) => {
                      return <MenuItem key={`select_option_${i}`} value={a}>{a}</MenuItem>;
                    })
                  }
                </Select>
                <IconButton
                  onClick={(event) => {
                    const name = this.state.metadataAdd || a11yMeta[0];
                    const newMd = this.state.metadata;
                    newMd.push({
                      name,
                      content: "",
                    });
                    this.setState({
                      metadata: newMd,
                    });

                    setTimeout(() => {
                      if (this.domRef) {
                        this.domRef.scrollTop = this.domRef.scrollHeight;
                        this.domRef.scrollLeft = 0;
                      }
                      let found = -1;
                      for (let j = this.state.metadata.length - 1; j >= 0; j--) {
                        const md = this.state.metadata[j];
                        if (md.deleted) {
                          continue;
                        }
                        found = j;
                        break;
                      }
                      if (found >= 0) {
                        const el = document.getElementById(`metadata_${found}`);
                        if (el) {
                          const elName = el.nodeName.toLowerCase();
                          if (elName === "input" || elName === "textarea") {
                            el.focus();
                          } else {
                            let input = el.querySelector("input");
                            if (!input) {
                              input = el.querySelector("textarea");
                            }
                            if (input) {
                              input.focus();
                            }
                          }
                        }
                      }
                    }, 200);

                    setTimeout(() => {
                      this.forceUpdate();
                    }, 500);
                  }}
                  aria-label={localize("metadata.add")}>
                  <AddCircleOutlineIcon />
                </IconButton>
            </FormControl>
          </div>
          <Button
            onClick={() => this.props.hideModal()}>
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
    processingAce: ace,
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

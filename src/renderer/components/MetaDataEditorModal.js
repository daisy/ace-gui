import path from 'path';
import fs from 'fs-extra';

const DOMParser = require('xmldom').DOMParser;
const XMLSerializer = require('xmldom').XMLSerializer;
const xpath = require('xpath');

import ReactSelect from 'react-select';
import { components } from "react-select";
import CreatableSelect from 'react-select/creatable';

import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CancelIcon from '@material-ui/icons/Cancel';
import AddBoxIcon from '@material-ui/icons/AddBox';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles, withTheme } from '@material-ui/core/styles';
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

import a11yMetadata from '@daisy/ace-core/lib/core/a11y-metadata';

// http://kb.daisy.org/publishing/docs/metadata/schema-org.html
// http://kb.daisy.org/publishing/docs/metadata/evaluation.html

const conformsToURLs = a11yMetadata.conformsToURLs;
const a11yMeta_links = a11yMetadata.a11yMeta_links;
const a11yMeta = a11yMetadata.a11yMeta;
const A11Y_META = a11yMetadata.A11Y_META;

const styles = theme => ({
  paper: {
    'width': '50vw',
  },
  dialogActions: {
    margin: '8px 24px 24px'
  },
  kbLinkContainer: {
    'text-align': 'right',
    'display': 'block',
    'margin-right': '1em',
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
    'border-left': "6px solid transparent",
  },
  red: {
    // color: 'red',
    // 'background-color': 'red',
    // 'border-color': 'red',
    // 'outline-color': 'red',
    // 'outline-style': 'solid',
    // 'outline-width': '2px',
    // 'outline-offset': '1px',
    // 'box-shadow': '0px 0px 0px 2px rgb(219,28,28)',
    'border-left': "6px solid rgb(219,28,28)",
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

    // const l10nDoneCallback = () => {}; // no need to async/await on this
    // const language = getCurrentLanguage();
    // if (language) {
    //   setCurrentLanguage(language, l10nDoneCallback);
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

      this.setState({
        metadata,
      });
      
      // this.props.addMessage("test");
    })
    .catch((err) => {
      console.log(`Unexpected error: ${err.message ? err.message : err}`);
      if (err.stack !== undefined) console.log(err.stack);

      this.props.hideModal();
      this.props.addMessage(`${err.message ? err.message : err}`);
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
        md.name === "a11y:certifierCredential" && /^https?:\/\//.test(md.content.trim());
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

    let mdIndex = -1;
    for (const metadata of metadatas) {
      mdIndex++;

      if (metadata.deleted) {
        continue;
      }

      const mdName = metadata.name;
      const mdContent = metadata.content;
      const mdObj = {
        name: mdName,
        content: mdContent,
        index: mdIndex,
      };
      
      let doSingleSelect = null;
      let doSingleSelectCustom = false;

      let doMultipleSelect = undefined; // not null!
      if (mdName === "schema:accessModeSufficient") {
        if (mdObj.content) {
          mdObj.content = mdObj.content.trim();
          if (mdObj.content) {
            doMultipleSelect = mdObj.content.split(",")
              .map(s => s.trim())
              .filter(s => s.length)
              .map(s => {
                return {
                  label: s,
                  value: s,
                  mdObj,
                };
              });
            if (!doMultipleSelect.length) {
              doMultipleSelect = null; // not undefined!
            }
          } else {
            doMultipleSelect = null; // not undefined!
          }
        } else {
          doMultipleSelect = null; // not undefined!
        }
      } else if ((mdName in A11Y_META) && A11Y_META[mdName].allowedValues) {
        doSingleSelectCustom = false;
        doSingleSelect = A11Y_META[mdName].allowedValues.map((mdContent) => {
          return {
            mdContent,
            mdIndex,
          };
        });
      } else if (mdName === "dcterms:conformsTo") {
        doSingleSelectCustom = true; // allow arbitrary user input
        doSingleSelect = conformsToURLs.map((mdContent) => {
          return {
            mdContent,
            mdIndex,
          };
        });
      }

      let hasVal = false;
      if (mdValue) {
        if (typeof mdValue === "object" && mdValue.value && mdValue.value.trim()) {
          hasVal = true;
        } else if (mdValue instanceof Array) {
          hasVal = true;
        } else if (mdValue.trim()) {
          hasVal = true;
        }
      }
      let flagged = !hasVal &&
        (mdName in A11Y_META) &&
        (A11Y_META[mdName].required || A11Y_META[mdName].recommended);
      if (!flagged && (mdName in A11Y_META) && A11Y_META[mdName].allowedValues && mdValue) {
        if (mdValue instanceof Array) {
          for (const obj of mdValue) {
            const notSupported = !A11Y_META[mdName].allowedValues.includes(obj.value); 
            if (notSupported) {
              flagged = true;
              obj.notSupported = true;
              // break;
            }
          }
        } else {
          const notSupported = !A11Y_META[mdName].allowedValues.includes(mdValue); 
            if (notSupported) {
              flagged = true;
            }
        }
      }

      const jsx = (
        <div key={`metadata_key_${mdIndex}`}
          className={classNames(classes.browseControlInputGroup, flagged ? classes.red : undefined)}
          >
        <FormControl
          variant="outlined"
          margin="dense"
          className={classes.browseControl}>
          {
          doSingleSelect ?
          (<>
          <Autocomplete
            data-name={mdName}
            data-content={mdContent}
            data-mdIndex={mdIndex}

            value={mdObj}
            options={doSingleSelect}

            filterOptions={(options, params) => {
              const i = options[0].mdIndex;
              const mdContentCurrent = this.state.metadata[i].content;
              if (!options.find((option) => option.mdContent === mdContentCurrent)) {
                options.push({
                  mdContent: mdContentCurrent,
                  mdIndex: i,
                });
              }
              const filtered = createFilterOptions()(options, params);
              if (doSingleSelectCustom &&
                params.inputValue &&
                !filtered.find((option) => option.mdContent === params.inputValue)) {

                filtered.push({
                  mdContent: params.inputValue,
                  mdIndex: i,
                });
              }
    
              return filtered;
            }}
            onBlur = {(event) => {
              const ipt = event.currentTarget.querySelector("input");
              if (!ipt) {
                return;
              }
              const mdContent = ipt.value ? ipt.value : "";

              const dataIndex = event.currentTarget.getAttribute("data-mdIndex");
              const mdIndex = parseInt(dataIndex, 10);
              const newMd = this.state.metadata;
              newMd[mdIndex].content = mdContent;
              console.log("Autocomplete onBlur", JSON.stringify(this.state.metadata));
              this.setState({
                metadata: newMd,
              });
            }}
            onChange={(event, obj) => {
              if (typeof obj === "string") {
                const dataIndex = event.currentTarget.getAttribute("data-mdIndex");
                const mdIndex = parseInt(dataIndex, 10);
                obj = {
                  mdContent: obj,
                  mdIndex,
                };
              }
              const newMd = this.state.metadata;
              newMd[obj.mdIndex].content = obj.mdContent;
              console.log("Autocomplete onChange", JSON.stringify(this.state.metadata));
              this.setState({
                metadata: newMd,
              });
            }}

            getOptionLabel={option => option.mdContent}
            renderInput={params =>
              <TextField {...params}
              inputProps={{
                ...params.inputProps,
                // onBlur: (e) => {
                //   console.log(e.currentTarget);
                // },
              }}
              label={mdName} variant="outlined" />
            }

            freeSolo={doSingleSelectCustom}
            disableClearable={false}
            includeInputInList={false}
            disableListWrap={true}
            autoSelect={false}
            autoHighlight={false}

            classes={
              //root,focused,tag,tagSizeSmall,hasPopupIcon,hasClearIcon,inputRoot,input,inputFocused,endAdornment,clearIndicator,clearIndicatorDirty,popupIndicator,popupIndicatorOpen,popper,popperDisablePortal,paper,listbox,loading,noOptions,option,groupLabel,groupUl
              {
            }}
            />
          </>) :
          (typeof doMultipleSelect !== "undefined" ?
          (<ReactSelect
            data-name={mdName}
            data-content={mdContent}
            data-mdIndex={mdIndex}

            options={
              A11Y_META[mdName].allowedValues.map((allowedValue) => {
                return {
                  label: allowedValue,
                  value: allowedValue,
                  mdObj,
                };
              })
            }
            value={doMultipleSelect}

            onChange={(values, obj) => {

              const dataIndex = obj.name.split("_")[1];
              const index = parseInt(dataIndex, 10);
              
              if (obj.action === "clear") {
                const newMd = this.state.metadata;
                newMd[index].content = "";
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
                console.log("ReactSelect onChange", JSON.stringify(this.state.metadata));
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
                // console.log(state);
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
                return {
                  ...styles,
                  ...(data.notSupported ? { border: '1px solid rgb(219,28,28)' } : {})
                };
              },
            }}

            closeMenuOnSelect={true}
            isMulti={true}
            placeholder={mdName}
            isSearchable={true}
            openMenuOnClick={true}
          />
          )
          :
          (<>
          <InputLabel htmlFor={`metadata_${mdIndex}`}
            data-mdIndex={mdIndex}
            ref={(ref) => {
                if (ref) {
                  const attr = ref.getAttribute("data-mdIndex");
                  const k = `labelRef_${attr}`;
                  this[k] = ReactDOM.findDOMNode(ref);
                }
              }
            }
            classes={{
              root: !mdValue ? classes.browseControlInputLabelRoot : classes.browseControlInputLabelRaised,
              focused: classes.browseControlInputLabelRaised
            }}
          >{mdName}</InputLabel>
          <OutlinedInput 
            id={`metadata_${mdIndex}`}
            inputProps={{"data-mdIndex": `${mdIndex}`}}
            value={mdValue}
            multiline={mdName === "schema:accessibilitySummary"}
            onChange={(event) => {
              const dataIndex = event.target.getAttribute("data-mdIndex");
              const index = parseInt(dataIndex, 10);
              const val = event.target.value;
              
              const newMd = this.state.metadata;
              newMd[index].content = val;
              this.setState({
                metadata: newMd,
              });
            }}
            labelWidth={this[`labelRef_${mdIndex}`] ? this[`labelRef_${mdIndex}`].offsetWidth : 0}
            classes={{ 
              root: classes.browseControlInput,
              notchedOutline: classes.browseControlInputOutline,
            }}
            />
            </>)
            )
            }
            <IconButton
              data-mdIndex={mdIndex}
              onClick={(event) => {
                const dataIndex = event.currentTarget.getAttribute("data-mdIndex");
                const index = parseInt(dataIndex, 10);
                const newMd = this.state.metadata;
                newMd[index].deleted = true;
                this.setState({
                  metadata: newMd,
                });
              }}
              aria-label={localize("metadata.delete")}>
              <CancelIcon />
            </IconButton>
        </FormControl>
        </div>
        );
      flattened.push(jsx);
    }
    
    // <InputLabel id="label_add">{localize("metadata.metadata")}</InputLabel>
    // labelId="label_add"

    const jsx = (
      <div key={`addKey`}
      className={classNames(classes.browseControlInputGroup)}
      >
      <hr/>

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
              a11yMeta.map((a, i) => {
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
              setTimeout(() => { this.forceUpdate(); }, 500);
            }}
            aria-label={localize("metadata.add")}>
            <AddBoxIcon />
          </IconButton>
      </FormControl>
      </div>
      );
    flattened.push(jsx);

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
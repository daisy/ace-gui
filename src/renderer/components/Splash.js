import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {openFile} from './../../shared/actions/app';
import * as FileDialogHelpers from "../../shared/helpers/fileDialogs";
import './../styles/Splash.scss';
import AceLogo from './../assets/logo.svg';
import CircularProgress from '@material-ui/core/CircularProgress'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { withStyles } from '@material-ui/core/styles';

import {localize} from './../../shared/l10n/localize';

const styles = theme => ({
  buttonProcessing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -91,
    marginLeft: -89,
    // height: 300,
    zIndex: 1,
    color: '#22C7F0',
  }
});

class Splash extends React.Component {

  state = {
    fileHover: false
  };

  onBrowseFileOrFolderClick = e => {
    FileDialogHelpers.showEpubFileOrFolderBrowseDialog(this.props.openFile);
    return false;
  };

  onBrowseFileClick = e => {
    FileDialogHelpers.showEpubFileBrowseDialog(this.props.openFile);
    return false;
  };

  onBrowseFolderClick = e => {
    FileDialogHelpers.showEpubFolderBrowseDialog(this.props.openFile);
    return false;
  };

  onDrop = e => {
    e.preventDefault();
    let filepath = e.dataTransfer.files[0].path;
    this.setState({fileHover: false});
    this.props.openFile(filepath);
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

  onDragEnd = e => {
    return false;
  };

  render() {
    let {classes, processing} = this.props;
    let disabled = processing ? 'disabled' : '';

    const orDropSidebar = localize("splash.orDropSidebar");
    const orDropSidebarArray = orDropSidebar.split("__");
    const orDropSidebar1 = orDropSidebarArray[0].trim();
    const orDropSidebar2 = orDropSidebarArray[1].trim();

    // "browseForFileOrFolder": "browse for a __file__ or a __folder__ ."
    const browseForFileOrFolder = localize("splash.browseForFileOrFolder");
    const browseForFileOrFolderArray = browseForFileOrFolder.split("__");
    const browseForFileOrFolder1 = browseForFileOrFolderArray[0].trim();
    const browseForFileOrFolder2 = browseForFileOrFolderArray[1].trim();
    const browseForFileOrFolder3 = browseForFileOrFolderArray[2].trim();
    const browseForFileOrFolder4 = browseForFileOrFolderArray[3].trim();
    const browseForFileOrFolder5 = browseForFileOrFolderArray[4].trim();
    return (
        <div className={`splash
            ${this.state.fileHover ? 'hover' : ''}
            ${processing ? 'processing' : ''}`}
          onDrop={this.onDrop}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd}>

          <h1>{localize("splash.title")}</h1>
          <div style={{position: 'relative'}}>
            <img src={`${AceLogo}`} alt="" width="150" height="150"/>
            {processing && <CircularProgress size={178} className={classes.buttonProcessing}/>}
          </div>
          {!processing &&
          <p>{localize("splash.dropHere")}<br/>
            {orDropSidebar1}&nbsp;
              <AddCircleOutlineIcon titleAccess="“New”" fontSize='inherit' style={{position: 'relative', bottom: '-0.15em'}}/>
              &nbsp;{orDropSidebar2}<br/>
              {localize("splash.or")}
              {process.platform == 'darwin'
                ? <span> <a href="#"onClick={this.onBrowseFileOrFolderClick}>{localize("splash.clickToBrowse")}</a></span>
                : <span> {browseForFileOrFolder1} <a href="#" onClick={this.onBrowseFileClick}>{browseForFileOrFolder2}</a> {browseForFileOrFolder3} <a href="#" onClick={this.onBrowseFolderClick}>{browseForFileOrFolder4}</a>{browseForFileOrFolder5}
                </span>
              }
          </p>
        }
        </div>
    );
  }
}

function mapStateToProps(state) {
  let { app: {processing: {ace}}, preferences: {language} } = state;
  return {
    language,
    processing: ace
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({openFile}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Splash));

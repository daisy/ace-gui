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
    this.setState({fileHover: false});
    if (!e.dataTransfer.files || !e.dataTransfer.files.length) {
      return false;
    }
    let filepath = e.dataTransfer.files[0].path;
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
    return (
        <div className={`splash
            ${this.state.fileHover ? 'hover' : ''}
            ${processing ? 'processing' : ''}`}
          onDrop={this.onDrop}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd}>

          <h1>Ace, by DAISY</h1>
          <div style={{position: 'relative'}}>
            <img src={`${AceLogo}`} alt="" width="150" height="150"/>
            {processing && <CircularProgress size={178} className={classes.buttonProcessing}/>}
          </div>
          {!processing &&
          <p>Drop an EPUB file or directory here,<br/>
            or on the&nbsp;
              <AddCircleOutlineIcon titleAccess="“New”" fontSize='inherit' style={{position: 'relative', bottom: '-0.15em'}}/>
              &nbsp;button in the sidebar, <br/>
              or
              {process.platform == 'darwin'
                ? <span> <a href="#"onClick={this.onBrowseFileOrFolderClick}>click to browse.</a></span>
                : <span> browse for
                a <a href="#" onClick={this.onBrowseFileClick}>file</a> or
                a <a href="#" onClick={this.onBrowseFolderClick}>folder</a>.
                </span>
              }
          </p>
        }
        </div>
    );
  }
}

function mapStateToProps(state) {
  let { app: {processing: {ace}} } = state;
  return {
    processing: ace
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({openFile}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Splash));

import React from 'react';
import PropTypes from 'prop-types';
const {ipcRenderer} = require('electron');
const path = require('path');
import LinearProgress from '@material-ui/core/LinearProgress';
import PreferencesContainer from './../containers/PreferencesContainer';
import './../styles/Sidebar.scss';
import {checkType} from "./../../shared/helpers";
const {dialog} = require('electron').remote;

// the sidebar
export default class Sidebar extends React.Component {

  static propTypes = {
    ready: PropTypes.bool.isRequired,
    recents: PropTypes.array.isRequired,
    openReport: PropTypes.func.isRequired,
    runAce: PropTypes.func.isRequired,
    addMessage: PropTypes.func.isRequired,
  };

  state = {
    fileHover: false
  };

  onDrop = e => {
    e.preventDefault();
    let filepath = e.dataTransfer.files[0].path;
    console.log(`File dropped ${filepath}`);
    this.setState({fileHover: false});
    this.processInputFile(filepath);
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

  onBrowseFileOrFolderClick = e => {
    Helpers.showEpubFileOrFolderBrowseDialog(this.processInputFile);
    return false;
  };

  onBrowseFileClick = e => {
    Helpers.showEpubFileBrowseDialog(this.processInputFile);
    return false;
  };

  onBrowseFolderClick = e => {
    Helpers.showEpubFolderBrowseDialog(this.processInputFile);
    return false;
  };

  processInputFile = filepath => {
    let type = Helpers.checkType(filepath);
    if (type == 1) {
      this.props.runAce(filepath);
    }
    else if (type == 2) {
      this.props.openReport(filepath);
    }
    else if (type == -1) {
      this.props.addMessage(`ERROR: File type of ${filepath} not supported`);
    }
  };

  render() {
    let {ready, recents, openReport} = this.props;

    return (
      <aside className="sidebar">
        <section className="drop-file">
          <h1>Run Ace</h1>
          <div className={`dropzone ${this.state.fileHover ? 'dropzone-hover' : ''} ${ready ? '' : 'processing'}`}
            onDrop={this.onDrop}
            onDragOver={this.onDragOver}
            onDragLeave={this.onDragLeave}
            onDragEnd={this.onDragEnd}>
              <p><span>Drag an EPUB file or folder here, <br/> or </span>
              {process.platform == 'darwin' ?
                <span><a href="#" onClick={this.onBrowseFileOrFolderClick}>click to browse.</a></span>
                :
                <span>browse for a <a href="#" onClick={this.onBrowseFileClick}>file</a> or a <a href="#" onClick={this.onBrowseFolderClick}>folder</a>.</span>
              }
              </p>
          </div>
          {ready ? '' :
            <div className='status'>
              <LinearProgress />
              <p>Processing...</p>
            </div>
          }

        </section>

        <section className="preferences">
          <PreferencesContainer/>
        </section>
        <section className="recents">
          <h1>Recent</h1>
          <ul>
          {recents.map((recent, idx) =>
            <li key={idx}>
              {ready ?
              <a onClick={() => openReport(recent.filepath)}>{recent.filepath}</a>
              :
              <span className="processing">{recent.filepath}</span> }
            </li>
          )}
          </ul>
        </section>
      </aside>
    );
  }
}
// <Preferences ready={this.props.ready} preferences={this.props.preferences} onPreferenceChange={this.props.onPreferenceChange}/>

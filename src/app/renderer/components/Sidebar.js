import React from 'react';
import PropTypes from 'prop-types';
const {ipcRenderer} = require('electron');
const path = require('path');
import LinearProgress from '@material-ui/core/LinearProgress';
import PreferencesContainer from './../containers/PreferencesContainer';
import './../styles/Sidebar.scss';
import {checkType} from "./../../shared/helpers";

// the sidebar
export default class Sidebar extends React.Component {

  static propTypes = {
    ready: PropTypes.bool.isRequired,
    recents: PropTypes.array.isRequired,
    preferences: PropTypes.object.isRequired,
    openReport: PropTypes.func.isRequired,
    openEpub: PropTypes.func.isRequired,
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

    let type = checkType(filepath);
    if (type == 1) {
      this.props.openEpub(filepath);
    }
    else if (type == 2) {
      this.props.openReport(filepath);
    }
    else if (type == -1) {
      addMessage(`ERROR: File type of ${filepath} not supported`);
    }
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

  onBrowseFileClick = e => {
    ipcRenderer.send('browseFileRequest');
    return false;
  };

  onBrowseFolderClick = e => {
    ipcRenderer.send('browseFolderRequest');
    return false;
  };

  render() {
    let {ready, recents, preferences, openReport} = this.props;

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
                <span><a href="#" onClick={this.onBrowseFileClick}>click to browse.</a></span>
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

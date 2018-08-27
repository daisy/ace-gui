import React from 'react';
const {ipcRenderer} = require('electron');
const path = require('path');
import './../styles/Sidebar.scss';
import Preferences from './Preferences';

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileHover: false
    };

    this.onDrop = this.onDrop.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onBrowseClick = this.onBrowseClick.bind(this);
  }

  onDrop(e) {
    e.preventDefault();
    let filepath = e.dataTransfer.files[0].path;
    console.log(`File dropped ${filepath}`);
    this.props.onDropFile(filepath);
    this.setState({fileHover: false});
    return false;
  }

  onDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({fileHover: true});
    return false;
  }

  onDragLeave(e) {
    this.setState({fileHover: false});
    return false;
  }

  onDragEnd(e) {
    return false;
  }

  onBrowseClick(e) {
    ipcRenderer.send('browseFileRequest');
    return false;
  }

  onRecentsClick(filepath) {
    this.props.onDropFile(filepath);
  }

  render() {
    let status = this.props.ready ? "Ready" : "Not ready";
    let recentFiles = [];
    for (let idx=0; idx < this.props.recents.length; idx++) {
      let filepath = this.props.recents[idx];
      recentFiles.push(<li key={idx}><a onClick={this.onRecentsClick.bind(this, filepath)}>{filepath}</a></li>);
    }

    let dropzoneClasses = `dropzone ${this.state.fileHover ? 'dropzone-hover' : ''}`;
    return (
      <aside id="sidebar">
        <section className="drop-file">
          <h1>Run Ace</h1>
          <div className={dropzoneClasses}
            onDrop={this.onDrop}
            onDragOver={this.onDragOver}
            onDragLeave={this.onDragLeave}
            onDragEnd={this.onDragEnd}>
                <p>Drag an EPUB file or folder here, or <a href="#" onClick={this.onBrowseClick}>click to browse.</a></p>
          </div>
        </section>

        <section className="preferences">
          <Preferences preferences={this.props.preferences} onPreferenceChange={this.props.onPreferenceChange}/>
        </section>
        <section className="recents">
          <h1>Recent</h1>
          <ul>
          {recentFiles}
          </ul>
        </section>

        <section className="status">
          <h1>Status</h1>
          <p>{status}</p>
        </section>
      </aside>
    );
  }
}

import React from 'react';
import PropTypes from 'prop-types';
const {ipcRenderer} = require('electron');
const path = require('path');
import LinearProgress from '@material-ui/core/LinearProgress';
import Preferences from './Preferences';
import './../styles/Sidebar.scss';


// the sidebar
export default class Sidebar extends React.Component {

  static propTypes = {
    onDropFile: PropTypes.func,
    ready: PropTypes.bool.isRequired,
    recents: PropTypes.array.isRequired,
    preferences: PropTypes.object.isRequired
  };

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
    if (this.props.onDropFile) this.props.onDropFile(filepath);
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
    let status = this.props.ready ? "Ready" : "Processing";
    let recentFiles = [];
    for (let idx=0; idx < this.props.recents.length; idx++) {
      let filepath = this.props.recents[idx];
      recentFiles.push(<li key={idx}>
        {this.props.ready ?
        <a onClick={this.onRecentsClick.bind(this, filepath)}>{filepath}</a>
        : <span className="processing">{filepath}</span> }
        </li>);
    }

    let dropzoneClasses = `dropzone ${this.state.fileHover ? 'dropzone-hover' : ''} ${this.props.ready ? '' : 'processing'}`;
    return (
      <aside className="sidebar">
        <section className="drop-file">
          <h1>Run Ace</h1>
          <div className={dropzoneClasses}
            onDrop={this.onDrop}
            onDragOver={this.onDragOver}
            onDragLeave={this.onDragLeave}
            onDragEnd={this.onDragEnd}>
                <p>Drag an EPUB file or folder here, or <a href="#" onClick={this.onBrowseClick}>click to browse.</a></p>
          </div>
          {this.props.ready ? '' :
            <div className='status'>
              <LinearProgress />
              <p>Processing...</p>
            </div>
          }

        </section>

        <section className="preferences">
          <Preferences ready={this.props.ready} preferences={this.props.preferences} onPreferenceChange={this.props.onPreferenceChange}/>
        </section>
        <section className="recents">
          <h1>Recent</h1>
          <ul>
          {recentFiles}
          </ul>
        </section>
      </aside>
    );
  }
}

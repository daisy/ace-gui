const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');
import tmp from 'tmp';
import React from 'react';
import SplitterLayout from 'react-splitter-layout';
import Report from './components/Report';
import Messages from './components/Messages';
import Sidebar from './components/Sidebar';
import Splash from './components/Splash';
import './styles/App.scss';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let queryStr = new URLSearchParams(window.location.search);

    this.state = {
      ready: true, // false == processing file
      messages: [],
      report: null,
      recents: [],
      preferences: {
        outdir: queryStr.get('outdir'),
        overwrite: queryStr.get('overwrite') == 'true',
        organize: queryStr.get('organize') == 'true'
      }
    };

    this.closeReport = this.closeReport.bind(this);
    this.processInputFile = this.processInputFile.bind(this);
    this.preferenceChanged = this.preferenceChanged.bind(this);
  }

  componentDidMount() {
    // main process handlers; e.g. menu item selections
    ipcRenderer.on('openReport', (event, arg) => {
      this.setState({ready: true});
      this.openReport(arg);
    });
    ipcRenderer.on('closeReport', (event, arg) => {
      this.closeReport();
      this.setState({ready: true});
    });
    ipcRenderer.on('message', (event, arg) => {
      this.addMessage(arg);
    });
    ipcRenderer.on('error', (event, arg) => {
      this.addMessage(`ERROR: ${arg}`);
      this.setState({ready: true});
    });
  }

  // pass input files onto the main process
  processInputFile(arg) {
    this.setState({ready: false});
    ipcRenderer.send('fileReceived', arg, this.state.preferences);
  }

  // add a message to the messages output
  addMessage(msg) {
    this.setState({messages: [...this.state.messages, msg]});
  }

  // add to the recent files list
  addRecent(filepath) {
    let recents = this.state.recents.slice();
    // don't add duplicates
    if (recents.indexOf(filepath) == -1) {
      recents.push(filepath);
      this.setState({recents: recents});
    }
  }

  // load an Ace report from file
  openReport(filepath) {
    if (this.state.report != null) {
      this.closeReport();
    }
    this.addMessage(`Loading report ${filepath}`);
    const data = fs.readFileSync(filepath);
    let report = {filepath: filepath, data: JSON.parse(data)};
    this.setState({report: report, ready: true});
    ipcRenderer.send("onOpenReport");
  }

  // close report, add its filepath to recents
  closeReport() {
    this.addMessage(`Closing report`);
    this.addRecent(this.state.report.filepath);
    this.setState({report: null});
    ipcRenderer.send("onCloseReport");
  }

  preferenceChanged(key, value) {
    let prefs = this.state.preferences;
    prefs[key] = value;
    this.setState({preferences: prefs});
    // i'd rather save the preferences to disk on quit than continuously
    // however, i'm not getting any unmount event to know that we're exiting
    ipcRenderer.send('savePreferences', this.state.preferences);
  }

  render() {
    return (
      <div>
        <SplitterLayout percentage vertical primaryMinSize={40} secondaryInitialSize={15}>
          <SplitterLayout percentage secondaryInitialSize={80} secondaryMinSize={40}>
            <Sidebar
              onDropFile={this.processInputFile}
              ready={this.state.ready}
              recents={this.state.recents}
              onPreferenceChange={this.preferenceChanged}
              preferences={this.state.preferences}/>
            {this.state.report === null ? <Splash/> : <Report report={this.state.report}/> }
          </SplitterLayout>
          <Messages messages={this.state.messages}/>
        </SplitterLayout>
      </div>
    );
  }
}

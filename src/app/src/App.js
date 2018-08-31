const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');

import React from 'react';
import SplitterLayout from 'react-splitter-layout';

import Report from './components/Report';
import Messages from './components/Messages';
import Sidebar from './components/Sidebar';
import Splash from './components/Splash';

import './styles/App.scss';

// TODO store prefs on disk

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: true, // false == processing file
      messages: [],
      report: null,
      recents: [],
      preferences: {
        save: this.props.save,
        outdir: this.props.outdir,
        overwrite: this.props.overwrite,
        organize: this.props.organize
      }
    };

    this.closeReport = this.closeReport.bind(this);
    this.processInputFile = this.processInputFile.bind(this);
    this.preferenceChanged = this.preferenceChanged.bind(this);
  }

  componentDidMount() {
    // main process handlers; e.g. menu item selections
    ipcRenderer.on('fileSelected', (event, arg) => {
      this.setState({ready: false});
      this.processInputFile(arg);
    });
    ipcRenderer.on('closeReport', (event, arg) => {
      this.closeReport();
    });
    ipcRenderer.on('newMessage', (event, arg) => {
      this.addMessage(arg);
    });
    ipcRenderer.on('aceCheckComplete', (event, arg) => {
      this.addMessage("Ace check complete");
      this.setState({ready: true});
      this.openReport(arg);
    });
  }

  // decide what to do with a file. it may have been dragged, opened via menu, opened via recents
  processInputFile(arg) {
    // crude way to check filetype
    if (path.extname(arg) == '.epub') {
      this.setState({ready: false});
      ipcRenderer.send('epubFileReceived', arg, this.state.preferences);
    }
    else if (path.extname(arg) == '.json') {
      this.setState({ready: false});
      this.openReport(arg);
    }
    else {
      this.addMessage(`Error: File type not supported ${arg}`);
      this.setState({ready: true});
    }
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
    // if the report is already open, don't re-open it. just switch to its tab.
    if (this.state.report != null) {
      if (this.state.report.filepath == filepath) {
        this.addMessage(`Report already loaded ${filepath}`);
        return;
      }
      else {
        this.closeReport();
      }
    }
    this.addMessage(`Loading report ${filepath}`);
    const data = fs.readFileSync(filepath);
    let report = {filepath: filepath, data: JSON.parse(data)};
    this.setState({report: report, ready: true});
    ipcRenderer.send("onOpenReport");
  }

  // close report, add its filepath to recents
  closeReport() {
    // TODO now would be the time to prompt to save it
    this.addMessage(`Closing report`);
    this.addRecent(this.state.report.filepath);
    this.setState({report: null});
    ipcRenderer.send("onCloseReport");
  }

  preferenceChanged(key, value) {
    let prefs = this.state.preferences;
    prefs[key] = value;
    this.setState({preferences: prefs});
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

const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');

import React from 'react';
import SplitterLayout from 'react-splitter-layout';

import ReportsView from './components/ReportsView';
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
      reports: [],
      recents: [],
      showPreferences: false,
      selectedReportIndex: 0, // use to force a report to display; not in sync with tabbed view
      preferences: {
        save: this.props.save,
        outdir: this.props.outdir,
        overwrite: this.props.overwrite,
        organize: this.props.organize
      }
    };

    console.log(`App constructor, ${this.state.selectedReportIndex}`);

    this.removeReport = this.removeReport.bind(this);
    this.processInputFile = this.processInputFile.bind(this);
    this.preferenceChanged = this.preferenceChanged.bind(this);
  }

  componentDidMount() {
    let thiz = this;

    // main process handlers; e.g. menu item selections
    ipcRenderer.on('fileSelected', (event, arg) => {
      this.setState({ready: false});
      thiz.processInputFile(arg);
    });
    ipcRenderer.on('closeReport', (event, arg) => {
      console.log(`App ipc closeReport, ${this.state.selectedReportIndex}`);
      thiz.removeReport(this.state.selectedReportIndex);
    });
    ipcRenderer.on('newMessage', (event, arg) => {
      thiz.addMessage(arg);
    });
    ipcRenderer.on('aceCheckComplete', (event, arg) => {
      thiz.setState({ready: true});
    });
  }

  // decide what to do with a file. it may have been dragged, opened via menu, opened via recents
  processInputFile(arg) {
    // crude way to check filetype
    if (path.extname(arg) == '.epub') {
      ipcRenderer.send('epubFileReceived', arg, this.state.preferences);
    }
    else if (path.extname(arg) == '.json') {
      // load a report from disk
      this.addReport(arg);
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

  // load an Ace report from file
  addReport(filepath) {
    // if the report is already open, don't re-open it. just switch to its tab.
    let idx = this.findInReports(filepath);
    if (idx != -1) {
      this.addMessage(`Report already loaded ${filepath}`);
      console.log(`App addReport:already loaded, ${idx}`);
      this.setState({selectedReportIndex: idx});
      return;
    }

    this.addMessage(`Loading report ${filepath}`);
    const data = fs.readFileSync(filepath);
    let newReport = {filepath: filepath, data: JSON.parse(data)};
    let nextIdx = this.state.reports.length; // the new report's index
    console.log(`App addReport:loading, ${nextIdx}`);
    this.setState({reports: [...this.state.reports, newReport], selectedReportIndex: nextIdx});
  }
  selectedReportChanged(idx) {
    console.log(`App selectedReportChanged, ${idx}`);
    this.setState({selectedReportIndex: idx});
  }
  addRecent(filepath) {
    let recents = this.state.recents.slice();
    // don't add duplicates to recents
    if (recents.indexOf(filepath) == -1) {
      recents.push(filepath);
      this.setState({recents: recents});
    }

  }

  // remove report, add its filepath to recents, reset tab index
  removeReport(idx) {
    // TODO now would be the time to prompt to save it

    this.addMessage(`Closing report`);
    this.addRecent(this.state.reports[idx].filepath);
    let reports = this.state.reports.slice();
    reports.splice(idx, 1);
    let selected = this.state.selectedReportIndex == 0 ? 0 : this.state.selectedReportIndex - 1;
    console.log(`App removeReport at ${idx}; new selection is ${selected}`);
    this.setState({reports: reports, selectedReportIndex: selected});
  }
  preferenceChanged(key, value) {
    let prefs = this.state.preferences;
    prefs[key] = value;
    this.setState({preferences: prefs});
  }
  render() {
    console.log(`App render, ${this.state.selectedReportIndex}`);
    ipcRenderer.send("onAppRender", this.state.reports.length);

    let body = this.state.reports.length > 0 ?
      <ReportsView
        reports={this.state.reports}
        initialTabIndex={this.state.reports.length - 1}
        onCloseTab={this.removeReport}
        onChangeTab={this.selectedReportChanged.bind(this)}/>
        :
      <Splash/> ;

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
            {body}
          </SplitterLayout>
          <Messages messages={this.state.messages}/>
        </SplitterLayout>
      </div>
    );
  }

  // return -1 or the index of the report with the given filepath
  findInReports(filepath) {
    let found = -1;
    for (let idx=0; idx < this.state.reports.length; idx++) {
      if (this.state.reports[idx].filepath == filepath) {
        found = idx;
        break;
      }
    }
    return found;
  }
}

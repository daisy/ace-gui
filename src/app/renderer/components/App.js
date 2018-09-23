const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');

import './../styles/App.scss';

import Messages from './Messages';
import React from 'react';
import Report from './Report';
import Sidebar from './Sidebar';
import Splash from './Splash';
import SplitterLayout from 'react-splitter-layout';
import tmp from 'tmp';

export default class App extends React.Component {

  propTypes = {
    report: PropTypes.obj,
    messages: PropTypes.array
  };

  render() {
    return (
      <div>
        <SplitterLayout percentage vertical primaryMinSize={40} secondaryInitialSize={15}>
          <SplitterLayout percentage secondaryInitialSize={80} secondaryMinSize={40}>
            <SidebarContainer/>
            {this.props.report === null ? <Splash/> : <ReportContainer/> }
          </SplitterLayout>
          <Messages messages={this.props.messages}/>
        </SplitterLayout>
      </div>
    );
  }
}

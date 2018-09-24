import './../styles/App.scss';

import MessagesContainer from './../containers/MessagesContainer';
import PropTypes from 'prop-types';
import React from 'react';
import ReportContainer from './../containers/ReportContainer';
import SidebarContainer from './../containers/SidebarContainer';
import Splash from './Splash';
import SplitterLayout from 'react-splitter-layout';

const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');

export default class App extends React.Component {

  static props = {
    report: PropTypes.obj
  };

  render() {
    return (
      <div>
        <SplitterLayout percentage vertical primaryMinSize={40} secondaryInitialSize={15}>
          <SplitterLayout percentage secondaryInitialSize={80} secondaryMinSize={40}>
            <SidebarContainer/>
            {this.props.report === null ? <Splash/> : <ReportContainer/> }
          </SplitterLayout>
          <MessagesContainer/>
        </SplitterLayout>
      </div>
    );
  }
}

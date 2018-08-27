const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');
import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Report from './Report';
import './../styles/ReportsView.scss';

// props are
// reports, initial, onCloseTab, onChangeTab fn
export default class ReportsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: this.props.initial
    };
  }
  componentDidMount() {
    let thiz = this;
  }

  onCloseTab(idx) {
    this.props.onCloseTab(parseInt(idx)); // the tab index should get updated because button.onClick propagates up
  }
  onSelectTab(idx) {
    this.setState({tabIndex: parseInt(idx)});
  }


  render() {
    let tabs = [];
    let tabPanes = [];
    for (let idx in this.props.reports) {
      let report = this.props.reports[idx];
      let name = path.basename(report.data['earl:testSubject']['url']);
      // rebinding every time on the close button isn't efficient but
      // it's way easier to pass the index this way
      tabs.push(
        <Tab className="pick-report-tab" key={idx}>
          <span>{name}</span>
          <button onClick={this.onCloseTab.bind(this, idx)}>x</button>
        </Tab>
      );
      tabPanes.push(
        <TabPanel key={idx}>
          <Report report={report}/>
        </TabPanel>
      );
    }
    return (
      <Tabs
        id="report-view-tabs" selectedTabClassName="selected-tab"
        selectedIndex={this.state.tabIndex}
        onSelect={this.onSelectTab.bind(this)}>
        <TabList>
          {tabs}
        </TabList>
        {tabPanes}
      </Tabs>

    );
  }
}

const fs = require('fs');
const path = require('path');
import React from 'react';
//import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {Tabs, Tab} from '@material-ui/core';
import TabContainer from './TabContainer';
import Report from './Report';
import './../styles/ReportsView.scss';

// props are
// reports, initialTabIndex, onCloseTab, onChangeTab fn
export default class ReportsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: this.props.initialTabIndex
    };
    console.log(`ReportView constructor, ${this.props.tabIndex}`);
  }

  onCloseTab(e, idx) {
    this.props.onCloseTab(parseInt(idx));
    e.stopPropagation();
  }
  onChange(e, idx) {
    this.props.onChangeTab(idx);
    this.setState({tabIndex: idx});
    e.stopPropagation();
  }

  render() {
    console.log(`ReportView render, ${this.props.initialTabIndex}`);
    let index = this.state.tabIndex;
    return (
      <div id="report-view-tabs">
        <Tabs
          value={index}
          onChange={this.onChange.bind(this)}>

          {this.props.reports.map((report, idx) => {
            let name = path.basename(report.data['earl:testSubject']['url']);
            return (
              <Tab
                className="pick-report-tab"
                key={idx}
                label={<div>
                  <span>{name}</span>
                  <a className='close-tab-button' onClick={(e) => this.onCloseTab(e, idx)}>x</a>
                </div>}/>
            );
          })}
        </Tabs>
        <TabContainer><Report report={this.props.reports[index]}/></TabContainer>
      </div>
    );
  }
}
/*
{this.props.reports.map((report, idx) => {
  return (
    <TabContainer key={idx}>
        <Report report={report}/>
    </TabContainer>
  );
})}*/
/*
<div className="pick-report-tab">
  <span>{name}</span>
  <button onClick={this.onCloseTab.bind(this, idx)}>x</button>
</div>

      <Report report={report}/>*/

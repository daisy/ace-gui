import React from 'react';
import PropTypes from 'prop-types';
import ViolationSummary from './ReportSections/ViolationSummary';
import Metadata from './ReportSections/Metadata';
import Outlines from './ReportSections/Outlines';
import ViolationTable from './ReportSections/ViolationTable';
import Images from './ReportSections/Images';
import {Tabs, Tab} from '@material-ui/core';
const helpers = require('./../helpers.js');
import './../styles/Report.scss';
const {ipcRenderer} = require('electron');

// the report view
export default class Report extends React.Component {

  static propTypes = {
    report: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0
    };
  }

  componentDidMount() {
    ipcRenderer.on('goto', (event, arg) => {
      this.setState({tabIndex: arg});
    });
  }

  componentWillUpdate(nextProps, nextState) {
    // otherwise, the new report's tab doesn't change and, more significantly, the data doesn't re-render until you click some tabs
    if (nextProps.report != this.props.report) {
      this.setState({tabIndex: 0});
    }
  }
  // tab change
  onChange = (e, idx) => {
    this.setState({tabIndex: idx});
  };

  render() {
    console.log("rendering report");
    let report = this.props.report.data;
    let violationSummary = "violationSummary" in report ?
      report.violationSummary : helpers.summarizeViolations(this.props.report.data.assertions);

    return (
      <section className="ace-report">
        <h1>Report</h1>
        <Tabs onChange={this.onChange} value={this.state.tabIndex}>
            <Tab className="pick-section-tab" label="Summary"/>
            <Tab className="pick-section-tab" label="Violations"/>
            <Tab className="pick-section-tab" label="Metadata"/>
            <Tab className="pick-section-tab" label="Outlines"/>
            <Tab className="pick-section-tab" label="Images"/>
        </Tabs>

        {this.state.tabIndex === 0 ?
          <ViolationSummary data={violationSummary}/> : ''}
        {this.state.tabIndex === 1  ?
          <ViolationTable data={report.assertions}/> : ''}
        {this.state.tabIndex === 2 ?
          <Metadata
              metadata={report['earl:testSubject'].metadata}
              links={report['earl:testSubject']['links']}
              a11ymetadata={report['a11y-metadata']}/>
            : ''}
        {this.state.tabIndex === 3 ?
          <Outlines data={report.outlines} /> : ''}
        {this.state.tabIndex === 4 ?
          <Images images={report.data.images} reportFilepath={this.props.report.filepath}/> : ''}
      </section>
    );
  }
}

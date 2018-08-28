import React from 'react';
import ViolationSummary from './ReportSections/ViolationSummary';
import Metadata from './ReportSections/Metadata';
import Outlines from './ReportSections/Outlines';
import ViolationTable from './ReportSections/ViolationTable';
import {Tabs, Tab} from '@material-ui/core';
import './../styles/Report.scss';

// the report view
export default class Report extends React.Component {
  // expects props: report{data, filepath},
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0
    };
  }

  // tab change
  onChange(e, idx) {
    this.setState({tabIndex: idx});
  }

  render() {
    console.log("rendering report");
    let report = this.props.report.data;
    // TODO images
    return (
      <section className="ace-report">
        <h1>Report</h1>
        <Tabs id="report-section-tabs" onChange={this.onChange.bind(this)} value={this.state.tabIndex}>
            <Tab className="pick-section-tab" label="Summary"/>
            <Tab className="pick-section-tab" label="Violations"/>
            <Tab className="pick-section-tab" label="Metadata"/>
            <Tab className="pick-section-tab" label="Outlines"/>
            <Tab className="pick-section-tab" label="Images"/>
        </Tabs>

        {this.state.tabIndex === 0 && "violationSummary" in report ?
          <ViolationSummary data={report.violationSummary}/> : ''}
        {this.state.tabIndex === 1 && 'assertions' in report ?
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
          <p>TODO</p> : ''}
      </section>
    );
  }
}

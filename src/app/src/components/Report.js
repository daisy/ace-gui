import React from 'react';
import ViolationSummary from './Report/ViolationSummary';
import Metadata from './Report/Metadata';
import Outlines from './Report/Outlines';
import ViolationTable from './Report/ViolationTable';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';


import './../styles/Report.scss';

export default class Report extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log("rendering report");
    let report = this.props.report.data;
    let reportStr = JSON.stringify(report, null, '  ');

    let metadataData = "metadata" in report['earl:testSubject'] ? report['earl:testSubject'].metadata : '';
    let conformsTo = '';
    if ('links' in report['earl:testSubject'] &&
      'dcterms:conformsTo' in report['earl:testSubject']['links']) {
        conformsTo = report['earl:testSubject']['links']['dcterms:conformsTo'];
    }

    let violationSummary = "violationSummary" in report ? <ViolationSummary data={report.violationSummary}/> : '';
    let outlines = "outlines" in report ? <Outlines data={report.outlines} /> : '';
    let metadata = "metadata" in report['earl:testSubject'] ?
      <Metadata data={metadataData} conformsTo={conformsTo} a11ymeta={report['a11y-metadata']} /> : '';
    let violationTable = 'assertions' in report ? <ViolationTable data={report.assertions}/> : '';

    // TODO images

    return (
      <section className="ace-report">
        <h1>Report</h1>
        <Tabs id="report-section-tabs" selectedTabClassName="selected-tab">
          <TabList>
            <Tab className="pick-section-tab">Summary</Tab>
            <Tab className="pick-section-tab">Violations</Tab>
            <Tab className="pick-section-tab">Metadata</Tab>
            <Tab className="pick-section-tab">Outlines</Tab>
            <Tab className="pick-section-tab">Images</Tab>
          </TabList>
          <TabPanel className="report-section">{violationSummary}</TabPanel>
          <TabPanel className="report-section">{violationTable}</TabPanel>
          <TabPanel className="report-section">{metadata}</TabPanel>
          <TabPanel className="report-section">{outlines}</TabPanel>
          <TabPanel className="report-section">TODO</TabPanel>
        </Tabs>
      </section>
    );
  }
}

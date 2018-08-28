import React from 'react';
import ViolationSummary from './Report/ViolationSummary';
import Metadata from './Report/Metadata';
import Outlines from './Report/Outlines';
import ViolationTable from './Report/ViolationTable';
//import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import {Tabs, Tab} from '@material-ui/core';
import TabContainer from './TabContainer';


import './../styles/Report.scss';

export default class Report extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0
    };
  }
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
        <Tabs id="report-section-tabs" onChange={this.onChange.bind(this)}>
            <Tab className="pick-section-tab" label="Summary"/>
            <Tab className="pick-section-tab" label="Violations"/>
            <Tab className="pick-section-tab" label="Metadata"/>
            <Tab className="pick-section-tab" label="Outlines"/>
            <Tab className="pick-section-tab" label="Images"/>
        </Tabs>

        {this.state.tabIndex === 0 && <TabContainer className="report-section">
          {"violationSummary" in report ? <ViolationSummary data={report.violationSummary}/> : ''}
        </TabContainer>}
        {this.state.tabIndex === 1 && <TabContainer className="report-section">
            {'assertions' in report ? <ViolationTable data={report.assertions}/> : ''}
          </TabContainer>}
          {this.state.tabIndex === 2 && <TabContainer className="report-section">
            <Metadata
              metadata={report['earl:testSubject'].metadata}
              links={report['earl:testSubject']['links']}
              a11ymetadata={report['a11y-metadata']}
            />
          </TabContainer>}
          {this.state.tabIndex === 3 && <TabContainer className="report-section">{"outlines" in report ? <Outlines data={report.outlines} /> : ''}</TabContainer>}
          {this.state.tabIndex === 4 && <TabContainer className="report-section">TODO</TabContainer>}

      </section>
    );
  }
}
/*
<TabPanel className="report-section">
  {"violationSummary" in report ? <ViolationSummary data={report.violationSummary}/> : ''}
</TabPanel>
<TabPanel className="report-section">
  {'assertions' in report ? <ViolationTable data={report.assertions}/> : ''}
</TabPanel>
<TabPanel className="report-section">
  <Metadata
    metadata={report['earl:testSubject'].metadata}
    links={report['earl:testSubject']['links']}
    a11ymetadata={report['a11y-metadata']}
  />
</TabPanel>
<TabPanel className="report-section">{"outlines" in report ? <Outlines data={report.outlines} /> : ''}</TabPanel>
<TabPanel className="report-section">TODO</TabPanel>
*/

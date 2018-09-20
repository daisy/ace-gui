import React from 'react';
import PropTypes from 'prop-types';
import Summary from './../components/ReportSections/Summary';
import Metadata from './../components/ReportSections/Metadata';
import Outlines from './../components/ReportSections/Outlines';
import Violations from './../components/ReportSections/Violations';
import Images from './../components/ReportSections/Images';
import {Tabs, Tab} from '@material-ui/core';
const helpers = require('./../helpers.js');
import './../styles/Report.scss';
const {ipcRenderer} = require('electron');

// the report view
export default class Report extends React.Component {

  static propTypes = {
    report: PropTypes.object.isRequired
  };

  state = {
    tabIndex: 0,
    tableOrder: {
      "violations": {order: "desc", orderBy: "impact"},
      "metadata": {order: "asc", orderBy: "name"},
      "images": {order: "asc", orderBy: "location"}
    }
  };

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

  onReorder = (id, order, orderBy) => {
    let tableOrder = this.state.tableOrder;
    tableOrder[id] = {order, orderBy};
    this.setState({tableOrder});
  };

  render() {
    console.log("rendering report");
    let {aceReport, filepath} = this.props.report;
    let {tabIndex, tableOrder} = this.state;
    let summary = "violationSummary" in aceReport ?
      aceReport.summary : helpers.summarizeViolations(aceReport.assertions);

    return (
      <section className="ace-report">
        <h1>Report</h1>
        <Tabs onChange={this.onChange} value={tabIndex}>
            <Tab className="pick-section-tab" label="Summary"/>
            <Tab className="pick-section-tab" label="Violations"/>
            <Tab className="pick-section-tab" label="Metadata"/>
            <Tab className="pick-section-tab" label="Outlines"/>
            <Tab className="pick-section-tab" label="Images"/>
        </Tabs>

        {tabIndex === 0 ?
          <Summary data={summary}/> : ''}

        {tabIndex === 1  ?
          <Violations
            data={aceReport.assertions}
            initialOrder={tableOrder['violations'].order}
            initialOrderBy={tableOrder['violations'].orderBy}
            onReorder={this.onReorder}/> : ''}

        {tabIndex === 2 ?
          <Metadata
              metadata={aceReport['earl:testSubject'].metadata}
              links={aceReport['earl:testSubject']['links']}
              a11ymetadata={aceReport['a11y-metadata']}
              initialOrder={tableOrder['metadata'].order}
              initialOrderBy={tableOrder['metadata'].orderBy}
              onReorder={this.onReorder}/>
            : ''}

        {tabIndex === 3 ?
          <Outlines data={aceReport.outlines}/> : ''}

        {tabIndex === 4 ?
          aceReport.data.images != undefined ?
            <Images
              images={aceReport.data.images}
              reportFilepath={filepath}
              initialOrder={tableOrder['images'].order}
              initialOrderBy={tableOrder['images'].orderBy}
              onReorder={this.onReorder}/>
              : <p>No images found in publication.</p>
          : ''}
      </section>
    );
  }
}

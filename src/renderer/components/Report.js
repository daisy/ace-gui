import React from 'react';
import PropTypes from 'prop-types';
import SummaryContainer from './../containers/ReportSections/SummaryContainer';
import MetadataContainer from './../containers/ReportSections/MetadataContainer';
import OutlinesContainer from './../containers/ReportSections/OutlinesContainer';
import ViolationsContainer from './../containers/ReportSections/ViolationsContainer';
import ImagesContainer from './../containers/ReportSections/ImagesContainer';
import {Tabs, Tab} from '@material-ui/core';
import './../styles/Report.scss';

import {localize} from './../../shared/l10n/localize';

// the report view
export default class Report extends React.Component {

  static propTypes = {
    selectedTab: PropTypes.number,
    selectTab: PropTypes.func.isRequired
  };


  render() {
    console.log("rendering report");
    let {selectedTab, selectTab} = this.props;

    return (
      <section className="ace-report">
        <h1>{localize("report.title")}</h1>
        <Tabs onChange={(e, idx) => selectTab(idx)} value={selectedTab}>
            <Tab className="pick-section-tab" label={localize("report.summary")}/>
            <Tab className="pick-section-tab" label={localize("report.violations")}/>
            <Tab className="pick-section-tab" label={localize("report.metadata")}/>
            <Tab className="pick-section-tab" label={localize("report.outlines")}/>
            <Tab className="pick-section-tab" label={localize("report.images")}/>
        </Tabs>

        {selectedTab === 0 ?
          <SummaryContainer/> : ''}

        {selectedTab === 1  ?
          <ViolationsContainer/> : ''}

        {selectedTab === 2 ?
          <MetadataContainer/> : ''}

        {selectedTab === 3 ?
          <OutlinesContainer/> : ''}

        {selectedTab === 4 ?
          <ImagesContainer/> : ''}
      </section>
    );
  }
}

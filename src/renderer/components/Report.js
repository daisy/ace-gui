import React from 'react';
import PropTypes from 'prop-types';
import SummaryContainer from './../containers/ReportSections/SummaryContainer';
import MetadataContainer from './../containers/ReportSections/MetadataContainer';
import OutlinesContainer from './../containers/ReportSections/OutlinesContainer';
import ViolationsContainer from './../containers/ReportSections/ViolationsContainer';
import ImagesContainer from './../containers/ReportSections/ImagesContainer';
import {Tabs, Tab} from '@material-ui/core';
import './../styles/Report.scss';
import ReactDOM from 'react-dom';
import { localizer } from './../../shared/l10n/localize';
const { localize } = localizer;

// the report view
export default class Report extends React.Component {

  static propTypes = {
    selectedTab: PropTypes.number,
    selectTab: PropTypes.func.isRequired
  };

  componentDidUpdate(oldProps, prevState) {
    if (oldProps.selectedTab !== this.props.selectedTab) {
      if (this.domRef) {
        this.domRef.scrollTop = 0; // this.domRef.scrollHeight
        this.domRef.scrollLeft = 0;
      }
    }
  }

  render() {
    let {selectedTab, selectTab} = this.props;

    return (
      <section className="ace-report" role="main"
        ref={ref => { this.domRef = ReactDOM.findDOMNode(ref) }}>

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

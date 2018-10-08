import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Summary from './../../components/ReportSections/Summary';
import {summarizeViolations} from "../../../shared/helpers/violations";

const mapStateToProps = state => {
  let {app: {report}} = state;
  let summary = report === null ? {} : ("violationSummary" in report ?
      report.violationSummary : summarizeViolations(report.assertions));

  return { summary };
};

export default connect(mapStateToProps)(Summary);

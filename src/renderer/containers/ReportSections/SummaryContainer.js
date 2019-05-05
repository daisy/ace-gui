import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Summary from './../../components/ReportSections/Summary';
import {summarizeViolations} from "../../../shared/helpers/violations";

const mapStateToProps = state => {
  let {app: {report}, preferences: {language}} = state;
  let summary = report === null ? {} : ("violationSummary" in report ?
      report.violationSummary : summarizeViolations(report.assertions));

  return {
    language,
    summary
  };
};

export default connect(mapStateToProps)(Summary);

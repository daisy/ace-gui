import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Violations from './../../components/ReportSections/Violations';
import * as ReportViewActions from './../../../shared/actions/reportView';
import {createFlatListOfViolations} from "./../../../shared/helpers";

const mapStateToProps = state => {
  let {app: {report}, reportView: {filters, sort, pagination}} = state;
  return {
    violations: createFlatListOfViolations(report.assertions),
    filters: filters['violations'],
    pagination: pagination['violations'],
    sort: sort['violations'],
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(ReportViewActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Violations);

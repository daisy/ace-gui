import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Violations from './../../components/ReportSections/Violations';
import * as ReportViewActions from './../../../shared/actions/reportView';
import {createFlatListOfViolations} from "../../../shared/helpers/violations";

const mapStateToProps = state => {
  let {app: {report}, reportView: {filters, sort, pagination, expandFilters}, preferences: {language}} = state;
  return {
    language,
    violations: createFlatListOfViolations(report.assertions),
    filters: filters['violations'],
    pagination: pagination['violations'],
    sort: sort['violations'],
    expandFilters: expandFilters['violations']
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(ReportViewActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Violations);

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Images from './../../components/ReportSections/Images';
import * as ReportViewActions from './../../../shared/actions/reportView';

const mapStateToProps = state => {
  let {app: {report, reportPath}, reportView: {filters, sort, pagination, expandFilters}, preferences: {language}} = state;

  return {
    language,
    images: !report.data.images ? [] : report.data.images,
    filters: filters['images'],
    pagination: pagination['images'],
    sort: sort['images'],
    reportPath,
    expandFilters: expandFilters['images']
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(ReportViewActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Images);

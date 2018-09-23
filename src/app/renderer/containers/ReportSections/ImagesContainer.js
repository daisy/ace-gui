import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Images from './../../components/ReportSections/Images';
import * as ReportViewActions from './../../../shared/actions/reportView';

const mapStateToProps = state => {
  let {app: {report}, reportView: {filters, sort, pagination}} = state;
  return {
    images: report.data.images == undefined ? [] : report.data.images,
    filters: filters.hasOwnProperty('images') ? filters['images'] : {},
    pagination: pagination.hasOwnProperty('images') ? pagination['images'] : {},
    sort: sort.hasOwnProperty('images') ? sort['images'] : {},
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(ReportViewActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Images);

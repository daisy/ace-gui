import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Report from './../components/Report';
import * as ReportViewActions from './../../shared/actions/reportView';

const mapStateToProps = {reportView} => {
  return {
    reportView.selectedTab
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(ReportViewActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Report);

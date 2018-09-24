import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Outlines from './../../components/ReportSections/Outlines';

const mapStateToProps = state => {
  let {app: {report}} = state;
  return {
    outlines: report.outlines
  };
};

export default connect(mapStateToProps)(Outlines);

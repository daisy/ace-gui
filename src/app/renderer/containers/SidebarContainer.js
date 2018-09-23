import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Sidebar from './../components/Sidebar';
import * as AppActions from './../../shared/actions/app';

const mapStateToProps = state => {
  let {app: {ready, recents}} = state;
  return {
    ready,
    recents
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(AppActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);

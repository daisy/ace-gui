import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Sidebar from './../components/Sidebar';
import * as AppActions from './../../shared/actions/app';

const mapStateToProps = {app: {ready, recents}, preferences} => {
  return {
    ready: PropTypes.bool.isRequired,
    recents: PropTypes.array.isRequired,
    preferences: PropTypes.object.isRequired
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(AppActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);

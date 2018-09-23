import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import App from './../components/App';
import * as AppActions from './../../shared/actions/app';

const mapStateToProps = {app: {report, messages}} => {
  return {
    report,
    messages
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(AppActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

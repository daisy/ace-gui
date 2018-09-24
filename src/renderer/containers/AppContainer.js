import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import App from './../components/App';
import * as AppActions from './../../shared/actions/app';

const mapStateToProps = state => {
  let {app: {report}} = state;
  return {
    report
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(AppActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

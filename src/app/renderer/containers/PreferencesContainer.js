import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Preferences from './../components/Preferences';
import * as PreferencesActions from './../../shared/actions/preferences';

const mapStateToProps = state => {
  let { app: {ready}, preferences } = state;
  return {
    ready,
    preferences
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(PreferencesActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Preferences);

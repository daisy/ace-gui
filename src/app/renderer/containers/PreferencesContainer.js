import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Preferences from './../components/Preferences';
import * as PreferencesActions from './../../shared/actions/preferences';

function mapStateToProps({app: {ready}, preferences }) {
  return { ready, preferences };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(PreferencesActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Preferences);

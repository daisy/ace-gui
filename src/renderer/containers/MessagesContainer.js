import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Messages from './../components/Messages';

const mapStateToProps = state => {
  let { app: {messages} } = state;
  return {
    messages
  };
}

export default connect(mapStateToProps)(Messages);

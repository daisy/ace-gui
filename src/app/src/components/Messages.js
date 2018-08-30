import React from 'react';
import PropTypes from 'prop-types';
import './../styles/Messages.scss';

// the messages list
export default class Messages extends React.Component {

  static propTypes = {
    messages: PropTypes.array.isRequired
  };
  render() {
    let messages = this.props.messages.join("\n");
    return(<div className="messages">
      <pre>
        <code>
          {messages}
        </code>
      </pre>
    </div>);
  }
}

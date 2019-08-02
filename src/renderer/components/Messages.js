import React from 'react';
import PropTypes from 'prop-types';
import './../styles/Messages.scss';

// the messages list
export default class Messages extends React.Component {

  static propTypes = {
    messages: PropTypes.array.isRequired
  };
  componentDidUpdate() {
  //  this.scrollToBottom();
  this.props.messages.length = 0;
  }

  render() {
    let messages = this.props.messages.join("\n");
    return(<div className="messages" aria-live="polite" role="complementary">
      <pre>
        <code>
          {messages}
        </code>
      </pre>
    </div>);
  }
}

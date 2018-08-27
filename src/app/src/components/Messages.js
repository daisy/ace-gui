import React from 'react';
import './../styles/Messages.scss';

export default class Messages extends React.Component {

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

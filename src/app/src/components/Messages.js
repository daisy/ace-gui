import React from 'react';
import './../styles/Messages.scss';

// the messages list
// expects props: messages[]
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

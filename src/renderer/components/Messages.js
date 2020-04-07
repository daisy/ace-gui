import React from 'react';
import PropTypes from 'prop-types';
import './../styles/Messages.scss';
import ReactDOM from 'react-dom';

// the messages list
export default class Messages extends React.Component {

  static propTypes = {
    messages: PropTypes.array.isRequired
  };
  componentDidUpdate() {
    if (this.textAreaRef && this.textAreaRef.parentNode) {
      this.textAreaRef.parentNode.scrollTop = this.textAreaRef.parentNode.scrollHeight;
      this.textAreaRef.parentNode.scrollLeft = 0;
    }
    // this.props.messages.length = 0;
  }

  render() {
    let messages = this.props.messages.join("\n");
    return(<div className="messages" aria-live="polite" role="complementary"
      ref={ref => { this.textAreaRef = ReactDOM.findDOMNode(ref) }}>
      <pre>
        <code>
          {messages}
        </code>
      </pre>
    </div>);
  }
}

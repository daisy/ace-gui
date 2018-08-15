import React from 'react';
import './../styles/Main.scss';
const {ipcRenderer} = require('electron');

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      report: null
    };
  }
  componentWillUnmount() {
    client.destroy();
  }

  componentDidMount() {
    // some advice on the internet says to wait for the component to mount
    // before catching events
    ipcRenderer.on('mainProcessEvent', (event, arg) => {
      console.log(`Received event in renderer process ${arg}`);
    });

  }

  onClick(e) {
    ipcRenderer.send('rendererProcessEvent', "Message from renderer");
  }

  render() {
    return (<div className="container"><a href="#" onClick={this.onClick.bind(this)}>Click me to send events!</a></div>);
  }
}

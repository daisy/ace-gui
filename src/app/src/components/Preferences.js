import React from 'react';
const {dialog} = require('electron').remote;

import "./../styles/Preferences.scss";
// this could grow into a preferences dialog
// for now, it's presented as an 'options' pane
export default class Preferences extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onChange(e) {
    let value = e.target.type == "checkbox" ?
      e.target.checked : e.target.value;

    this.props.onPreferenceChange([e.target.id], value);
  }

  // use electron folder dialog, not html input element dialog
  onClick() {
    let thiz = this;
    dialog.showOpenDialog(
      {title: "Select a folder", properties: ['openDirectory', 'createDirectory'], buttonLabel: "Save"},
      (filenames) => {
        if (filenames != undefined) {
          thiz.setState({outdir: filenames[0]});
        }
      }
    );
  }

  render() {

    return (
    <section className="options">
      <h1>Options</h1>
      <ul>
        <li>
          <label htmlFor="save">Save reports</label>
          <input type="checkbox" id="save" checked={this.props.preferences.save} onChange={this.onChange}/>
        </li>
        <li>
          <label htmlFor="outdir">Directory</label>
          <input type="text" id="outdir" value={this.props.preferences.outdir} onChange={this.onChange}/>
          <button onClick={this.onClick}>Browse</button>
        </li>
        <li>
          <label htmlFor="organize">Keep reports organized</label>
          <input type="checkbox" id="organize" checked={this.props.preferences.organize} onChange={this.onChange}/>
        </li>
        <li>
          <label htmlFor="overwrite">Overwrite files without prompting</label>
          <input type="checkbox" id="overwrite" checked={this.props.preferences.overwrite} onChange={this.onChange}/>
        </li>
      </ul>
    </section>
);
  }
}

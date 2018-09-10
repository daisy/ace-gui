import React from 'react';
import PropTypes from 'prop-types';
const {dialog} = require('electron').remote;
import "./../styles/Preferences.scss";

// this could grow into a preferences dialog
// for now, it's presented as an 'options' pane
export default class Preferences extends React.Component {

  static propTypes = {
    preferences: PropTypes.object.isRequired,
    onPreferenceChange: PropTypes.func
  };
  constructor(props) {
    super(props);
  }

  onChange = e => {
    let value = e.target.type == "checkbox" ?
      e.target.checked : e.target.value;
    if (this.props.onPreferenceChange) this.props.onPreferenceChange([e.target.id], value);
  };

  // browse directory button click
  onClick = e => {
    // use electron folder dialog, not html input element dialog (can't choose folders)
    dialog.showOpenDialog(
      {title: "Select a folder", properties: ['openDirectory', 'createDirectory'], buttonLabel: "Select"},
      (filenames) => {
        if (filenames != undefined) {
          this.setState({outdir: filenames[0]});
        }
      }
    );
  };

  render() {
    return (
      <section className="options">
        <h1>Options</h1>
        <ul>
          <li>
            <label htmlFor="outdir">Save reports to: </label>
            <input type="text" id="outdir" value={this.props.preferences.outdir} onChange={this.onChange}
            disabled={this.props.ready ? '' : 'disabled'}/>
            <button onClick={this.onClick} disabled={this.props.ready ? '' : 'disabled'}>Browse</button>
          </li>
          <li>
            <label htmlFor="organize">Keep reports organized: </label>
            <input type="checkbox" id="organize" disabled={this.props.ready ? '' : 'disabled'}
            checked={this.props.preferences.organize} onChange={this.onChange}/>
          </li>
          <li>
            <label htmlFor="overwrite">Overwrite files without prompting: </label>
            <input type="checkbox" id="overwrite" disabled={this.props.ready ? '' : 'disabled'}
            checked={this.props.preferences.overwrite} onChange={this.onChange}/>
          </li>
        </ul>
      </section>
    );
  }
}

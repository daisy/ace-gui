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
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onChange(e) {
    let value = e.target.type == "checkbox" ?
      e.target.checked : e.target.value;
    if (this.props.onPreferenceChange) this.props.onPreferenceChange([e.target.id], value);
  }

  // browse directory button click
  onClick() {
    // use electron folder dialog, not html input element dialog (can't choose folders)
    dialog.showOpenDialog(
      {title: "Select a folder", properties: ['openDirectory', 'createDirectory'], buttonLabel: "Save"},
      (filenames) => {
        if (filenames != undefined) {
          this.setState({outdir: filenames[0]});
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
            <label htmlFor="outdir">Save reports to: </label>
            <input type="text" id="outdir" value={this.props.preferences.outdir} onChange={this.onChange}/>
            <button onClick={this.onClick}>Browse</button>
          </li>
          <li>
            <label htmlFor="organize">Keep reports organized: </label>
            <input type="checkbox" id="organize" checked={this.props.preferences.organize} onChange={this.onChange}/>
          </li>
          <li>
            <label htmlFor="overwrite">Overwrite files without prompting: </label>
            <input type="checkbox" id="overwrite" checked={this.props.preferences.overwrite} onChange={this.onChange}/>
          </li>
        </ul>
      </section>
    );

    /*
    right now, saving reports is always true, so we don't need this until we process the json data directly from Ace and skip
    saving to disk automatically (if we decide to do that)
    <li>
      <label htmlFor="save">Save reports: </label>
      <input type="checkbox" id="save" checked={this.props.preferences.save} onChange={this.onChange}/>
    </li>
    */
  }
}

import React from 'react';
import PropTypes from 'prop-types';
const {dialog} = require('electron').remote;
import "./../styles/Preferences.scss";

// this could grow into a preferences dialog
// for now, it's presented as an 'options' pane
export default class Preferences extends React.Component {

  static propTypes = {
    preferences: PropTypes.object.isRequired,
    ready: PropTypes.bool.isRequired,
    setOutdir: PropTypes.func.isRequired,
    setOverwrite: PropTypes.func.isRequired,
    setOrganize: PropTypes.func.isRequired
  };

  // browse directory button click
  onClick = e => {
    // use electron folder dialog, not html input element dialog (can't choose folders)
    dialog.showOpenDialog(
      {title: "Select a folder", properties: ['openDirectory', 'createDirectory'], buttonLabel: "Select"},
      (filenames) => {
        if (filenames != undefined) {
          this.props.setOutdir(filenames[0]);
        }
      }
    );
  };

  render() {
    let {ready, preferences, onPreferenceChanged} = this.props;

    return (
      <section className="options">
        <h1>Options</h1>
        <ul>
          <li>
            <label htmlFor="outdir">Save reports to: </label>
            <input type="text" id="outdir" value={preferences.outdir} onChange={ e => setOutdir(e.target.value)}
            disabled={ready ? '' : 'disabled'}/>
            <button onClick={this.onClick} disabled={ready ? '' : 'disabled'}>Browse</button>
          </li>
          <li>
            <label htmlFor="organize">Keep reports organized: </label>
            <input type="checkbox" id="organize" disabled={ready ? '' : 'disabled'}
            checked={preferences.organize} onChange={ e => setOrganize(e.target.checked)}/>
          </li>
          <li>
            <label htmlFor="overwrite">Overwrite files without prompting: </label>
            <input type="checkbox" id="overwrite" disabled={ready ? '' : 'disabled'}
            checked={preferences.overwrite} onChange={ e => setOverwrite(e.target.checked)}/>
          </li>
        </ul>
      </section>
    );
  }
}

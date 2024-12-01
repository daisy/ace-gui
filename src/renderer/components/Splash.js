import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {openFile} from './../../shared/actions/app';

import './../styles/Splash.scss';
import AceLogo from './../assets/logo.svg';
import CircularProgress from '@material-ui/core/CircularProgress'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { withStyles } from '@material-ui/core/styles';

import { shell, ipcRenderer } from 'electron';
import { IPC_EVENT_showEpubFileOrFolderBrowseDialog, IPC_EVENT_showEpubFileBrowseDialog, IPC_EVENT_showEpubFolderBrowseDialog } from "../../shared/main-renderer-events";

import { localizer } from './../../shared/l10n/localize';
const { localize } = localizer;

const styles = theme => ({
  buttonProcessing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -91,
    marginLeft: -89,
    // height: 300,
    zIndex: 1,
    color: '#22C7F0',
  }
});

class Splash extends React.Component {

  state = {
    hideSponsor: false,
  };

  onBrowseFileOrFolderClick = e => {
    ipcRenderer.send(IPC_EVENT_showEpubFileOrFolderBrowseDialog);
    ipcRenderer.once(IPC_EVENT_showEpubFileOrFolderBrowseDialog, (event, filepath) => this.props.openFile(filepath));

    return false;
  };

  onBrowseFileClick = e => {
    ipcRenderer.send(IPC_EVENT_showEpubFileBrowseDialog);
    ipcRenderer.once(IPC_EVENT_showEpubFileBrowseDialog, (event, filepath) => this.props.openFile(filepath));

    return false;
  };

  onBrowseFolderClick = e => {
    ipcRenderer.send(IPC_EVENT_showEpubFolderBrowseDialog);
    ipcRenderer.once(IPC_EVENT_showEpubFolderBrowseDialog, (event, filepath) => this.props.openFile(filepath));

    return false;
  };
  componentDidMount() {
    const dateStr = localStorage.getItem('DAISY-ACE-SPONSOR-HIDE');
    // console.log(`===> ${window.location.href} ${dateStr}`);
    if (dateStr) {
      if ((new Date().getTime() - new Date(dateStr).getTime()) > (7*24*60*60*1000)) { // 7*24h
        localStorage.removeItem('DAISY-ACE-SPONSOR-HIDE');
        this.setState({ hideSponsor: false });
      } else {
        this.setState({ hideSponsor: true });
        // setTimeout(()=>{document.getElementById('sponsorship').remove()}, 0);
      }
    } else {
      this.setState({ hideSponsor: false });
    }
  }
  render() {
    let {classes, processingAce} = this.props;

    const orDropSidebar = localize("splash.orDropSidebar");
    const orDropSidebarArray = orDropSidebar.split("__");
    const orDropSidebar1 = orDropSidebarArray[0].trim();
    const orDropSidebar2 = orDropSidebarArray[1].trim();

    // "browseForFileOrFolder": "browse for a __file__ or a __folder__ ."
    const browseForFileOrFolder = localize("splash.browseForFileOrFolder");
    const browseForFileOrFolderArray = browseForFileOrFolder.split("__");
    const browseForFileOrFolder1 = browseForFileOrFolderArray[0].trim();
    const browseForFileOrFolder2 = browseForFileOrFolderArray[1].trim();
    const browseForFileOrFolder3 = browseForFileOrFolderArray[2].trim();
    const browseForFileOrFolder4 = browseForFileOrFolderArray[3].trim();
    const browseForFileOrFolder5 = browseForFileOrFolderArray[4].trim();
    return (
        <div className={`splash
            ${processingAce ? 'processing' : ''}`}
          role="main">

          <h1>{localize("splash.title")}</h1>
          <div style={{position: 'relative'}}>
            <img src={`${AceLogo}`} alt="" width="150" height="150"/>
            {processingAce && <CircularProgress size={178} className={classes.buttonProcessing}/>}
          </div>
          {!processingAce &&
          <p>{localize("splash.dropHere")}<br/>
            {orDropSidebar1}&nbsp;
              <AddCircleOutlineIcon titleAccess="“New”" fontSize='inherit' style={{position: 'relative', bottom: '-0.15em'}}/>
              &nbsp;{orDropSidebar2}<br/>
              {localize("splash.or")}
              {process.platform == 'darwin'
                ? <span> <a href="#" onClick={this.onBrowseFileOrFolderClick}>{localize("splash.clickToBrowse")}</a></span>
                : <span> {browseForFileOrFolder1} <a href="#" onClick={this.onBrowseFileClick}>{browseForFileOrFolder2}</a> {browseForFileOrFolder3} <a href="#" onClick={this.onBrowseFolderClick}>{browseForFileOrFolder4}</a> {browseForFileOrFolder5}
                </span>
              }
          </p>
          }
        {!this.state.hideSponsor &&
          <div id="sponsorship">
            <span>{localize("sponsorship_prompt")}</span>
            <a href="#" onClick={() => { shell.openExternal('https://daisy.org/AceAppSponsor'); }}>{localize("sponsorship_link")}</a>
            <input onClick={() => {
              // document.getElementById('sponsorship').remove();
              localStorage.setItem('DAISY-ACE-SPONSOR-HIDE', new Date().toISOString());
              this.setState({ hideSponsor: true });
            }} type="button" value="X" aria-label={localize("sponsorship_close")} title={localize("sponsorship_close")} />
          </div>
        }
        </div>
    );
  }
}

function mapStateToProps(state) {
  let { app: {processing: {ace}}, preferences: {language} } = state;
  return {
    language,
    processingAce: ace,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({openFile}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Splash));

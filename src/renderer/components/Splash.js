import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {openFile} from './../../shared/actions/app';
import * as FileDialogHelpers from "../../shared/helpers/fileDialogs";
import './../styles/Splash.scss';
import AceLogo from './../assets/logo.svg';
import CircularProgress from '@material-ui/core/CircularProgress'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { withStyles } from '@material-ui/core/styles';

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
  };

  onBrowseFileOrFolderClick = e => {
    setTimeout(async () => {
      await FileDialogHelpers.showEpubFileOrFolderBrowseDialog(this.props.openFile);
    }, 0);
    return false;
  };

  onBrowseFileClick = e => {
    setTimeout(async () => {
      await FileDialogHelpers.showEpubFileBrowseDialog(this.props.openFile);
    }, 0);
    return false;
  };

  onBrowseFolderClick = e => {
    setTimeout(async () => {
      await FileDialogHelpers.showEpubFolderBrowseDialog(this.props.openFile);
    }, 0);
    return false;
  };

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
                : <span> {browseForFileOrFolder1} <a href="#" onClick={this.onBrowseFileClick}>{browseForFileOrFolder2}</a> {browseForFileOrFolder3} <a href="#" onClick={this.onBrowseFolderClick}>{browseForFileOrFolder4}</a>{browseForFileOrFolder5}
                </span>
              }
          </p>
          }
        </div>
    );
  }
}

function mapStateToProps(state) {
  let { app: {processing: {ace}}, preferences: {language} } = state;
  return {
    language,
    processingAce: ace
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({openFile}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Splash));

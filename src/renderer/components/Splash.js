import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {openFile} from './../../shared/actions/app';
import './../styles/Splash.scss';
import AceLogo from './../assets/logo.svg';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

class Splash extends React.Component {

  state = {
    fileHover: false
  };

  onDrop = e => {
    e.preventDefault();
    let filepath = e.dataTransfer.files[0].path;
    this.setState({fileHover: false});
    this.props.openFile(filepath);
    return false;
  };

  onDragOver = e => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({fileHover: true});
    return false;
  };

  onDragLeave = e => {
    this.setState({fileHover: false});
    return false;
  };

  onDragEnd = e => {
    return false;
  };

  render() {
    let {ready} = this.props;
  
    return (
        <div className={`splash
            ${this.state.fileHover ? 'hover' : ''}
            ${ready ? '' : 'processing'}`}
          onDrop={this.onDrop}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd}>

          <h1>Ace, by DAISY</h1>

          <img src={`${AceLogo}`}/>
          <p>Drop an EPUB file or directory here,<br/>
            or on the&nbsp;
              <AddCircleOutlineIcon titleAccess="“New”" fontSize='inherit' style={{position: 'relative', bottom: '-0.15em'}}/>
              &nbsp;button in the sidebar, <br/>
            or click to browse.
          </p>
        </div>
    );
  }
}

function mapStateToProps(state) {
  let { app: {ready} } = state;
  return {
    ready
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({openFile}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Splash);

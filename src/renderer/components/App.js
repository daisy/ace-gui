import './../styles/App.scss';
// import 'react-splitter-layout/lib/index.css';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {openFile} from './../../shared/actions/app';
import MessagesContainer from './../containers/MessagesContainer';
import PropTypes from 'prop-types';
import React from 'react';
import ModalRoot from './ModalRoot';
import ReportContainer from './../containers/ReportContainer';
import Sidebar from './../components/Sidebar';
import Splash from './Splash';
import classNames from 'classnames';

import SplitterLayout from 'react-splitter-layout';

import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';


const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#4b4b4b',
    },
    secondary: {
      main: '#0097a7',
    },
  },
});

const styles = {
  root: {
    zIndex: 1,
    flex: '1 1 auto',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  }
};

class App extends React.Component {

  static props = {
    report: PropTypes.obj
  };

  state = {
    fileHover: false,
  };

  onDrop = e => {
    e.preventDefault();
    this.setState({fileHover: false});
    if (!e.dataTransfer.files || !e.dataTransfer.files.length) {
      return false;
    }
    let filepath = e.dataTransfer.files[0].path;
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
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <ModalRoot/>
        <div
          onDrop={this.onDrop}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd}
            
          className={classNames('hover-root', this.state.fileHover ? 'hover' : undefined)}>
        <SplitterLayout
          percentage vertical primaryMinSize={40} secondaryInitialSize={15}>
          <div className={classNames(classes.root)}>
            <Sidebar/>
            {this.props.report === null ?
            <Splash/> :
            <ReportContainer/> }
          </div>
          <MessagesContainer/>
        </SplitterLayout>
        </div>
      </MuiThemeProvider>
    );
  }
}

function mapStateToProps(state) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({openFile}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(App));

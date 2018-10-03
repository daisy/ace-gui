import './../styles/App.scss';

import MessagesContainer from './../containers/MessagesContainer';
import PropTypes from 'prop-types';
import React from 'react';
import ModalRoot from './ModalRoot';
import ReportContainer from './../containers/ReportContainer';
import Sidebar from './../components/Sidebar';
import Splash from './Splash';
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

  render() {
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        <ModalRoot/>
        <SplitterLayout percentage vertical primaryMinSize={40} secondaryInitialSize={15}>
          <div className={classes.root}>
            <Sidebar/>
            {this.props.report === null ? <Splash/> : <ReportContainer/> }
          </div>
          <MessagesContainer/>
        </SplitterLayout>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);

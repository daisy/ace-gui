import React from 'react';
import './../styles/Splash.scss';
import AceLogo from './../assets/logo.svg';

export default class Splash extends React.Component {
  // TODO logo not showing; how to reference it?
  render() {
    console.log(`Logo ${AceLogo}`);
    return (
        <div className="splash">
          <h1>Ace, by DAISY</h1>

          <img src={AceLogo}/>
          <p>EPUB Accessibility Checker</p>
        </div>
    );
  }
}

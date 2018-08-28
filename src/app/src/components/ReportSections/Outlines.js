import React from 'react';
import './../../styles/Report.scss';

// the outlines section of the report
export default class Outlines extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    console.log("rendering outlines");
    let reportStr = JSON.stringify(this.props.data, null, '  ');

    return (
      <section className="outlines report-section">
        <h2>Outlines</h2>
        {reportStr}
      </section>
    );
  }
}

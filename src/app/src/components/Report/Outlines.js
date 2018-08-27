import React from 'react';
import './../../styles/Report.scss';

export default class Metadata extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log("rendering outlines");
    let reportStr = JSON.stringify(this.props.data, null, '  ');

    return (
      <section className="outlines">
        <h2>Outlines</h2>
        {reportStr}
      </section>
    );
  }
}

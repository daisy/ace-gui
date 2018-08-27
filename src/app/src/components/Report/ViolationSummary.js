import React from 'react';
const ReactDataGrid = require('react-data-grid');
import './../../styles/Report.scss';

export default class ViolationSummary extends React.Component {
  constructor(props) {
    super(props);
    this._columns = [
      {
        key: 'type',
        name: 'Type',
      },
      {
        key: 'critical',
        name: 'Critical',
      },
      {
        key: 'serious',
        name: 'Serious',
      },
      {
        key: 'moderate',
        name: 'Moderate',
      },
      {
        key: 'minor',
        name: 'Minor',
      },
      {
        key: 'total',
        name: 'Total',
      }
    ];
    this._rows = [];
    // format the report data for the grid component
    for (var key in this.props.data) {
      this._rows.push(Object.assign({}, {'type': key}, this.props.data[key]));
    }

    this.rowGetter = this.rowGetter.bind(this);

  }
  rowGetter(i) {
    if (this._rows.length > 0) return this._rows[i];
    return null;
  }
  render() {
    let datastr = JSON.stringify(this.props.data);

    return (

      //<code>{datastr}</code>
      <section className="violationSummary">
        <h2>Violation Summary</h2>
        <ReactDataGrid
          columns={this._columns}
          rowGetter={this.rowGetter}
          rowsCount={this._rows.length}
          minHeight={500} />
      </section>
    );
  }
}

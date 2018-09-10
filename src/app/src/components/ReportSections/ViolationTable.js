import React from 'react';
const {shell} = require('electron');
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import EnhancedTable from './EnhancedTable';
const helpers = require("./../../helpers.js");


// the violation table in the report
export default class ViolationTable extends React.Component {

  static propTypes = {
    data: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      rows: helpers.createFlatListOfViolations(this.props.data),
      page: 0,
      rowsPerPage: 5
    };
  }


  onExternalLinkClick(url) {
    shell.openExternal(url);
  }

  render() {
    const impactOrder = ['minor', 'moderate', 'serious', 'critical'];
    const heads = [
      {
        id: "impact",
        label: "Impact",
        numeric: false,
        sortable: true,
        makeNumeric: impact => impactOrder.indexOf(impact),
        makeCell: (row, idx) =>
          <TableCell key={idx} className="impact">
            <span className={row.impact}>{row.impact}</span>
          </TableCell>
      },
      {
        id: "rulesetTag",
        label: "Ruleset",
        numeric: true,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="ruleset">{row.rulesetTag}</TableCell>
      },
      {
        id: "rule",
        label: "Rule",
        numeric: false,
        sortable: true,
        makeNumeric: rule => rule.rule,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="rule">
            <p>{row.rule.rule}</p>
            <p className="violation-engine">{row.rule.engine}</p>
          </TableCell>
      },
      {
        id: "location",
        label: "Location",
        numeric: false,
        sortable: true,
        makeNumeric: location => location.filename,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="location">
            <p><code>{row.location.filename}</code></p>
            {row.location.snippet != '' ?
              <pre>{unescape(row.location.snippet)}</pre>
              : ''}
          </TableCell>
      },
      {
        id: "details",
        label: "Details",
        numeric: false,
        sortable: false,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="details">
            <ul>
              {row.details.desc.map((txt, idx) => {
                  return (
                    <li key={idx}>{unescape(txt)}</li>
                  );
              })}
            </ul>
            <p><a className="external-link" onClick={this.onExternalLinkClick.bind(this, row.details.kburl)}>Learn about {row.details.kbtitle}</a></p>
          </TableCell>
      }
    ];

    let {page, rowsPerPage, rows} = this.state;
    return (
      <section className="violation-table">
        <h2>Violations</h2>
        <EnhancedTable
          rows={rows}
          heads={heads}
          orderBy='impact'
          order='desc'
          isPaginated={true}/>
        {rows.length == 0 ? <p>No violations reported.</p> : ''}
      </section>
    );
  }
}

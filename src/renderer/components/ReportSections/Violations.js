import EnhancedTable from './../Table/EnhancedTable';
import PropTypes from 'prop-types';
import React from 'react';
import TableCell from '@material-ui/core/TableCell';
const {shell} = require('electron');

// the violations page of the report
export default class Violations extends React.Component {

  static propTypes = {
    violations: PropTypes.array.isRequired,
    filters: PropTypes.array,
    pagination: PropTypes.object,
    sort: PropTypes.object,
    setTableSort: PropTypes.func,
    setTableFilterValues: PropTypes.func,
    setTablePagination: PropTypes.func,
  };

  onExternalLinkClick = url => shell.openExternal(url);

  render() {
    let {violations,
      filters,
      pagination: {page, rowsPerPage},
      sort: {order, orderBy},
      setTableSort,
      setTableFilterValues,
      setTablePagination} = this.props;
    const impactOrder = ['minor', 'moderate', 'serious', 'critical'];
    const heads = [
      {
        id: "impact",
        label: "Impact",
        numeric: false,
        sortable: true,
        sortOn: impact => impactOrder.indexOf(impact),
        makeCell: (row, idx) =>
          <TableCell key={idx} className="impact">
            <span className={row.impact}>{row.impact}</span>
          </TableCell>
      },
      {
        id: "rulesetTag",
        label: "Ruleset",
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="ruleset">{row.rulesetTag}</TableCell>
      },
      {
        id: "rule",
        label: "Rule",
        numeric: false,
        sortable: true,
        sortOn: rule => rule.rule,
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
        sortOn: location => location.filename,
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
            <p><a className="external-link" onClick={() => this.onExternalLinkClick(row.details.kburl)}>Learn about {row.details.kbtitle}</a></p>
          </TableCell>
      }
    ];

    return (
      <section className="report-section violations">
        <h2>Violations</h2>
        <EnhancedTable
          rows={rows}
          heads={heads}
          id={'violations'}
          isPaginated={true}
          filters={filters}
          sort={sort}
          pagination={pagination}
          onSort={setTableSort}
          onFilter={setTableFilterValues}
          onChangePagination={setTablePagination}
          />
        {rows.length == 0 ? <p>No violations reported.</p> : ''}
      </section>
    );
  }
}

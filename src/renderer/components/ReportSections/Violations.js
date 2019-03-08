import EnhancedTable from './../Table/EnhancedTable';
import PropTypes from 'prop-types';
import React from 'react';
import TableCell from '@material-ui/core/TableCell';
const {shell} = require('electron');

import {localize} from './../../../shared/l10n/localize';

// the violations page of the report
export default class Violations extends React.Component {

  static propTypes = {
    violations: PropTypes.array.isRequired,
    filters: PropTypes.object.isRequired,
    pagination: PropTypes.object.isRequired,
    sort: PropTypes.object.isRequired,
    expandFilters: PropTypes.bool.isRequired,
    setTableSort: PropTypes.func.isRequired,
    setTableFilterValues: PropTypes.func.isRequired,
    setTablePagination: PropTypes.func.isRequired,
    setTableFiltersExpanded: PropTypes.func.isRequired
  };

  onExternalLinkClick = url => shell.openExternal(url);

  render() {
    let {violations,
      filters,
      pagination,
      sort,
      expandFilters,
      setTableSort,
      setTableFilterValues,
      setTablePagination,
      setTableFiltersExpanded} = this.props;
    const impactOrder = ['minor', 'moderate', 'serious', 'critical'];
    const heads = [
      {
        id: "impact",
        label: localize("report.violationsSection.impact"),
        numeric: false,
        sortable: true,
        sortOn: impact => impactOrder.indexOf(impact),
        filterOn: obj => obj,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="impact">
            <span className={row.impact}>{row.impact}</span>
          </TableCell>
      },
      {
        id: "rulesetTag",
        label: localize("report.violationsSection.ruleset"),
        numeric: false,
        sortable: true,
        filterOn: obj => obj,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="ruleset">{row.rulesetTag}</TableCell>
      },
      {
        id: "rule",
        label: localize("report.violationsSection.rule"),
        numeric: false,
        sortable: true,
        sortOn: rule => rule.rule,
        filterOn: obj => obj.rule,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="rule">
            <p>{row.rule.rule}</p>
            <p className="violation-engine">{localize("report.violationsSection.via")} {row.rule.engine}</p>
          </TableCell>
      },
      {
        id: "location",
        label: localize("report.violationsSection.location"),
        numeric: false,
        sortable: true,
        sortOn: location => location.filename,
        filterOn: obj => obj.filename.indexOf('#') > 0 ? obj.filename.slice(0, obj.filename.indexOf('#')) : obj.filename,
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
        label: localize("report.violationsSection.details"),
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
            <p><a className="external-link" onClick={() => this.onExternalLinkClick(row.details.kburl)}>{localize("report.violationsSection.learnAbout")} {row.details.kbtitle}</a></p>
          </TableCell>
      }
    ];

    return (
      <section className="report-section violations">
        <h2>{localize("report.violations")}</h2>
        <EnhancedTable
          rows={violations}
          heads={heads}
          id={'violations'}
          isPaginated={true}
          filters={filters}
          sort={sort}
          pagination={pagination}
          expandFilters={expandFilters}
          onSort={setTableSort}
          onFilter={setTableFilterValues}
          onChangePagination={setTablePagination}
          onExpandFilters={setTableFiltersExpanded}
          />
        {violations.length == 0 ? <p>{localize("report.violationsSection.noViolations")}</p> : ''}
      </section>
    );
  }
}

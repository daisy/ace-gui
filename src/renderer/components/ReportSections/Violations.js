import EnhancedTable from './../Table/EnhancedTable';
import PropTypes from 'prop-types';
import React from 'react';
import TableCell from '@material-ui/core/TableCell';
const {ipcRenderer} = require('electron');

import { localizer } from './../../../shared/l10n/localize';
const { localize, getCurrentLanguage } = localizer;

const rowHeight = 200;

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

  onExternalLinkClick = url => {
    ipcRenderer.send('KB_URL', url);
    // shell.openExternal(url);
  }

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
    const keyPrefix = "report.summarySection.";
    const heads = [
      {
        l10n: {
          keyPrefix: keyPrefix,
          ignoreMissingKey: false,
        },
        id: "impact",
        label: localize("report.violationsSection.impact"),
        numeric: false,
        sortable: true,
        sortOn: impact => impactOrder.indexOf(impact),
        filterOn: obj => obj,
        makeCell: (row, idx) =>
        <TableCell style={{
            border: "black solid 1px", padding: 0,
            overflow: "hidden",
        }} key={idx} className="impact">
          <div style={{
              overflow: "hidden",
              overflowY: "auto",
              padding: 6,
              margin: 0,
              height: rowHeight,
              maxheight: rowHeight,
              whiteSpace: "break-spaces",
              textOverflow: "ellipsis"
            }} >
            <span className={row.impact}>{localize(`${keyPrefix}${row.impact}`, {ignoreMissingKey: false}).replace(keyPrefix, "")}</span>
            </div>
          </TableCell>
      },
      {
        l10n: {
          keyPrefix: keyPrefix,
          ignoreMissingKey: true,
        },
        id: "rulesetTag",
        label: localize("report.violationsSection.ruleset"),
        numeric: false,
        sortable: true,
        filterOn: obj => obj,
        makeCell: (row, idx) =>

        <TableCell style={{
            border: "black solid 1px", padding: 0,
            overflow: "hidden",
        }} key={idx} className="ruleset">
          <div style={{
              overflow: "hidden",
              overflowY: "auto",
              padding: 6,
              margin: 0,
              height: rowHeight,
              maxheight: rowHeight,
              whiteSpace: "break-spaces",
              textOverflow: "ellipsis"
            }} >
              {localize(`${keyPrefix}${row.rulesetTag}`, {ignoreMissingKey: true}).replace(keyPrefix, "").replace("wcag2aaa", "WCAG 2.0 AAA").replace("wcag2aa", "WCAG 2.0 AA").replace("wcag2a", "WCAG 2.0 A").replace("wcag21aaa", "WCAG 2.1 AAA").replace("wcag21aa", "WCAG 2.1 AA").replace("wcag21a", "WCAG 2.1 A").replace("wcag22aaa", "WCAG 2.2 AAA").replace("wcag22aa", "WCAG 2.2 AA").replace("wcag22a", "WCAG 2.2 A")}
            </div></TableCell>
      },
      {
        id: "rule",
        label: localize("report.violationsSection.rule"),
        numeric: false,
        sortable: true,
        sortOn: rule => rule.rule,
        filterOn: obj => obj.rule,
        makeCell: (row, idx) =>

        <TableCell style={{
                    border: "black solid 1px", padding: 0,
                    overflow: "hidden",
                }} key={idx} className="rule">
                  <div style={{
                      overflow: "hidden",
                      overflowY: "auto",
                      padding: 6,
                      margin: 0,
                      height: rowHeight,
                      maxheight: rowHeight,
                      whiteSpace: "break-spaces",
                      textOverflow: "ellipsis"
                    }} >
            <span>{row.rule.rule}</span>
            <p className="violation-engine">{localize("report.violationsSection.via")} {row.rule.engine}</p>
            </div>
          </TableCell>
      },
      {
        id: "details",
        label: localize("report.violationsSection.details"),
        numeric: false,
        sortable: false,
        makeCell: (row, idx) =>

        <TableCell style={{
              border: "black solid 1px", padding: 0,
              overflow: "hidden",
          }} key={idx} className="details">
            <div style={{
                overflow: "hidden",
                overflowY: "auto",
                padding: 6,
                margin: 0,
                height: rowHeight,
                maxheight: rowHeight,
                whiteSpace: "break-spaces",
                textOverflow: "ellipsis",
                minWidth: 260,
              }} >
                <p style={{
                    padding: 0,
                    margin: 0,
                    marginBottom: 6,
                  }} ><a
                  href="#"
                  tabIndex={0}
                  className="external-link"
                  onKeyPress={(e) => { if (e.key === "Enter") { this.onExternalLinkClick(getCurrentLanguage() === "ja" ? row.details.kburl.replace(/\/docs\//, "/ja/") : row.details.kburl); }}}
                  onClick={() => this.onExternalLinkClick(getCurrentLanguage() === "ja" ? row.details.kburl.replace(/\/docs\//, "/ja/") : row.details.kburl)}
                >{localize("report.violationsSection.learnAbout")} {row.details.kbtitle}</a></p>
            <ul style={{
                paddingLeft: "1em",
                margin: 0,
              }} >
              {row.details.desc.map((txt, idx) => {
                  return (
                    <li key={idx}>{unescape(txt)}</li>
                  );
              })}
            </ul>
              </div>
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

        <TableCell style={{
              border: "black solid 1px", padding: 0,
              overflow: "hidden",
          }} key={idx} className="location">
            <div style={{
                overflow: "hidden",
                overflowY: "auto",
                padding: 6,
                margin: 0,
                height: rowHeight,
                maxheight: rowHeight,
                textOverflow: "ellipsis",
                overflowWrap: "break-word",
              }} >

                <pre style={{
                      whiteSpace: "pre-wrap",
                      padding: 0,
                      margin: 0,
                      marginBottom: 6,
                      maxWidth: 400,
                    }}>{row.location.filename}</pre>

            {row.location.snippet ?
                Array.from(new Set(
                  unescape(row.location.snippet)
                  .replace(/ xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/g, "")
                  .replace(/xmlns="http:\/\/www\.w3\.org\/1999\/xhtml" /g, "")
                  .replace(/xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/g, "")
                  .replace(/ xmlns:epub="http:\/\/www\.idpf\.org\/2007\/ops"/g, "")
                  .replace(/\s\s+/g, " ")
                  .split(" <!--##--> ")
                  .map(str => str && str.trim()) // str?.trim() NOT SUPPORTED BY BABEL IN THIS PROJECT!!
                  .filter((item) => {
                    return item && !/^<[^>]+>$/.test(item); // <p> etc. (related nodes generated by Deque Axe)
                  })
                  ))
                  .map((item, index) => {
                    return (
                      <pre
                        key={`pre${index}`}
                          className='snippet' style={{
                          whiteSpace: "pre-wrap",
                          maxWidth: 400,
                        }}>
                          {item}
                      </pre>
                    );
                  })

              : ''}
            </div>
          </TableCell>
      }
    ];

    return (
      <section className="report-section violations">
        {
          // <h2>{localize("report.violations")}</h2>
        }
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

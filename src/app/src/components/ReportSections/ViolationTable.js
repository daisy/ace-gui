import React from 'react';
const {shell} = require('electron');
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableFooter, TableRow, TablePagination} from '@material-ui/core';
const helpers = require("./../../helpers.js");
import TablePaginationActionsWrapped from "./TablePaginationActions";


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

  onChangePage = (event, page) => {
    this.setState({ page });
  };

  onChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    let {page, rowsPerPage, rows} = this.state;
    return (
      <section className="violation-table">
        <h2>Violations</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Impact</TableCell>
              <TableCell>Ruleset</TableCell>
              <TableCell>Rule</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell className="impact"><span className={row.impact}>{row.impact}</span></TableCell>
                  <TableCell className="ruleset">{row.rulesetTag}</TableCell>
                  <TableCell className="rule">
                    <p>{row.rule.rule}</p>
                    <p className="violation-engine">{row.rule.engine}</p>
                  </TableCell>
                  <TableCell className="location">
                    <p><code>{row.location.filename}</code></p>
                    {row.location.snippet != '' ?
                      <pre>{unescape(row.location.snippet)}</pre>
                      : ''}
                  </TableCell>
                  <TableCell className="details">
                    <ul>
                      {row.details.desc.map((txt, idx) => {
                          return (
                            <li key={idx}>{unescape(txt)}</li>
                          );
                      })}
                    </ul>
                    <p><a className="external-link" onClick={this.onExternalLinkClick.bind(this, row.details.kburl)}>Learn about {row.details.kbtitle}</a></p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                colSpan={3}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={this.onChangePage}
                onChangeRowsPerPage={this.onChangeRowsPerPage}
                ActionsComponent={TablePaginationActionsWrapped}
              />
            </TableRow>
          </TableFooter>
        </Table>
        {rows.length == 0 ? <p>No violations reported.</p> : ''}
      </section>
    );
  }
}

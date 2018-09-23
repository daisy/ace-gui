import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

// the summary table in the report
export default class Summary extends React.Component {

  static propTypes = {
    summary: PropTypes.object.isRequired
  };

  render() {
    let {summary} = this.props;
    return (
      <section className="report-section summary">
        <h2>Summary</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Critical</TableCell>
              <TableCell>Serious</TableCell>
              <TableCell>Moderate</TableCell>
              <TableCell>Minor</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(summary).map((key, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{summary[key]['critical']}</TableCell>
                  <TableCell>{summary[key]['serious']}</TableCell>
                  <TableCell>{summary[key]['moderate']}</TableCell>
                  <TableCell>{summary[key]['minor']}</TableCell>
                  <TableCell>{summary[key]['total']}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>
    );
  }
}

import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import './../../styles/Report.scss';

// the violations summary table in the report
export default class ViolationSummary extends React.Component {
  render() {
  return (
      <section className="violation-summary report-section">
        <h2>Violation Summary</h2>
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
            {Object.keys(this.props.data).map((key, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{this.props.data[key]['critical']}</TableCell>
                  <TableCell>{this.props.data[key]['serious']}</TableCell>
                  <TableCell>{this.props.data[key]['moderate']}</TableCell>
                  <TableCell>{this.props.data[key]['minor']}</TableCell>
                  <TableCell>{this.props.data[key]['total']}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>
    );
  }
}

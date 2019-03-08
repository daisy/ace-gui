import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

import {localize} from './../../../shared/l10n/localize';

// the summary page of the report
export default class Summary extends React.Component {

  static propTypes = {
    summary: PropTypes.object.isRequired
  };

  render() {
    let {summary} = this.props;
    return (
      <section className="report-section summary">
        <h2>{localize("report.summary")}</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{localize("report.summarySection.type")}</TableCell>
              <TableCell>{localize("report.summarySection.critical")}</TableCell>
              <TableCell>{localize("report.summarySection.serious")}</TableCell>
              <TableCell>{localize("report.summarySection.moderate")}</TableCell>
              <TableCell>{localize("report.summarySection.minor")}</TableCell>
              <TableCell>{localize("report.summarySection.total")}</TableCell>
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

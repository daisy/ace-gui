import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

import { localizer } from './../../../shared/l10n/localize';
const { localize } = localizer;

// the summary page of the report
export default class Summary extends React.Component {

  static propTypes = {
    summary: PropTypes.object.isRequired
  };

  render() {
    let {summary} = this.props;
    const keyPrefix = "report.summarySection.";
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
                  <TableCell>{localize(keyPrefix+key, {ignoreMissingKey: true}).replace(keyPrefix, "")}</TableCell>
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

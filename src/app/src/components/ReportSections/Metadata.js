import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import './../../styles/Report.scss';

// the metadata table in the report
export default class Metadata extends React.Component {
  // expects props: {metadata: {..}, links {..}, a11ymeta: {present[], missing[], empty[]}}
  constructor(props) {
    super(props);
    let rows = [];
    for (let key in this.props.metadata) {
      rows.push({"name": key, "value": this.props.metadata[key]});
    }

    // conformsTo lives in ['links'] so we have to add it separately to the table
    if (this.props.links != {} && 'dcterms:conformsTo' in this.props.links) {
          rows.push({
            "name": "conformsTo",
            "value": report['earl:testSubject']['links']['dcterms:conformsTo']
        });
    }

    this.state = {
      rows: rows
    };
  }

  render() {
    let hasMissingOrEmpty = this.props.a11ymetadata.missing.length > 0 || this.props.a11ymetadata.empty.length > 0;

    return (
      <section className="metadata report-section">
        <h2>Metadata</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>A11Y</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.rows.map((row, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.value instanceof Array ?
                      <ul>{row.value.map((data, idx) => {
                        return (
                          <li key={idx}>{data}</li>
                        );
                      })}
                      </ul>
                      : row.value}
                  </TableCell>
                  <TableCell><span>{this.props.a11ymetadata.present.indexOf(row.name) != -1 ? "Yes" : ""}</span></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {hasMissingOrEmpty ?
                <aside>
                  <h2>Missing A11Y Metadata</h2>
                  <ul>
                    {this.props.a11ymetadata.missing.map((data, idx) => {
                      return (<li key={idx}>{data}</li>);
                    })}
                    {this.props.a11ymetadata.empty.map((data, idx) => {
                      return (<li key={idx}>{data}</li>);
                    })}
                  </ul>
                </aside>
              : ''}
     </section>
    );
  }
}

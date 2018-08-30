import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';

// the metadata table in the report
export default class Metadata extends React.Component {

  static propTypes = {
    metadata: PropTypes.object.isRequired,
    links: PropTypes.object.isRequired,
    a11ymetadata: PropTypes.object.isRequired
  };

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
      <section className="metadata">
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

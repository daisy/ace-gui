import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import EnhancedTable from "./EnhancedTable";

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
    if (this.props.links != undefined && this.props.links != {} && 'dcterms:conformsTo' in this.props.links) {
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
    let heads = [
      {
        id: 'name',
        label: "Name",
        numeric: true,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx} component="th" scope="row">
            {row.name}
          </TableCell>
      },
      {
        id: 'value',
        label: "Value",
        numeric: false,
        sortable: false,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.value instanceof Array ?
              <ul>{row.value.map((data, idx) => {
                return (
                  <li key={idx}>{data}</li>
                );
              })}
              </ul>
              : row.value}
          </TableCell>
      },
      {
        id: 'a11y',
        label: 'A11Y',
        numeric: true,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>
            <span>{this.props.a11ymetadata.present.indexOf(row.name) != -1 ? "Yes" : ""}</span>
          </TableCell>
      }
    ];



    return (
      <section className="metadata">
        <h2>Metadata</h2>
        <EnhancedTable
          rows={this.state.rows}
          heads={heads}
          orderBy='name'
          order='asc'
          isPaginated={false}/>

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

import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
import EnhancedTable from "./../Table/EnhancedTable";

// the metadata table in the report
export default class Metadata extends React.Component {

  static propTypes = {
    metadata: PropTypes.object.isRequired,
    links: PropTypes.object.isRequired,
    a11ymetadata: PropTypes.object.isRequired,
    initialOrder: PropTypes.string.isRequired,
    initialOrderBy: PropTypes.string.isRequired,
    onReorder: PropTypes.func
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

  onReorder = (order, orderBy) => {
    this.props.onReorder("metadata", order, orderBy);
  };

  render() {
    let {a11ymetadata, initialOrder, initialOrderBy} = this.props;

    let hasMissingOrEmpty = a11ymetadata.missing.length > 0 || a11ymetadata.empty.length > 0;
    let heads = [
      {
        id: 'name',
        label: "Name",
        numeric: true,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>
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
            <span>{a11ymetadata.present.indexOf(row.name) != -1 ? "Yes" : ""}</span>
          </TableCell>
      }
    ];

    return (
      <section className="report-section metadata">
        <h2>Metadata</h2>
        <EnhancedTable
          rows={this.state.rows}
          heads={heads}
          orderBy='name'
          order='asc'
          isPaginated={false}
          initialOrderBy={initialOrderBy}
          initialOrder={initialOrder}
          onReorder={this.onReorder}
          filterFields={[
            {name: 'name', filterOn: obj => obj}
          ]}/>

      <h2>Missing A11Y Metadata</h2>
      {hasMissingOrEmpty ?
        <ul>
          {a11ymetadata.missing.map((data, idx) => {
            return (<li key={idx}>{data}</li>);
          })}
          {a11ymetadata.empty.map((data, idx) => {
            return (<li key={idx}>{data}</li>);
          })}
        </ul>
        :
        <p>All required accessibility metadata is present.</p>
      }
     </section>
    );
  }
}

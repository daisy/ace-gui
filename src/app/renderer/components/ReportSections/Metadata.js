import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';

import EnhancedTable from "./../Table/EnhancedTable";
import PropTypes from 'prop-types';
import React from 'react';

// the metadata table in the report
export default class Metadata extends React.Component {

  static propTypes = {
    metadata: PropTypes.object.isRequired,
    a11ymetadata: PropTypes.object.isRequired,
    filters: PropTypes.array,
    pagination: PropTypes.object,
    sort: PropTypes.object,
    setTableSort: PropTypes.func,
    setTableFilterValues: PropTypes.func,
    setTablePagination: PropTypes.func,
  };

  render() {
    let {metadata, a11ymetadata, filters, pagination, sort, setTableSort, setTableFilterValues, setTablePagination} = this.props;

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
          rows={metadata}
          heads={heads}
          id={'metadata'}
          isPaginated={true}
          filters={filters}
          sort={sort}
          pagination={pagination}
          onSort={setTableSort}
          onFilter={setTableFilterValues}
          onChangePagination={setTablePagination}
        />

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

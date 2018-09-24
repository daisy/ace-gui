import EnhancedTable from "./../Table/EnhancedTable";
import PropTypes from 'prop-types';
import React from 'react';
import TableCell from '@material-ui/core/TableCell';

// the metadata page of the report
export default class Metadata extends React.Component {

  static propTypes = {
    metadata: PropTypes.array.isRequired,
    a11ymetadata: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
    pagination: PropTypes.object.isRequired,
    sort: PropTypes.object.isRequired,
    expandFilters: PropTypes.bool.isRequired,
    setTableSort: PropTypes.func.isRequired,
    setTableFilterValues: PropTypes.func.isRequired,
    setTablePagination: PropTypes.func.isRequired,
    setTableFiltersExpanded: PropTypes.func.isRequired
  };

  render() {
    let {
      metadata,
      a11ymetadata,
      filters,
      pagination,
      sort,
      expandFilters,
      setTableSort,
      setTableFilterValues,
      setTablePagination,
      setTableFiltersExpanded} = this.props;

    let hasMissingOrEmpty = a11ymetadata.missing.length > 0 || a11ymetadata.empty.length > 0;
    let heads = [
      {
        id: 'name',
        label: "Name",
        numeric: false,
        sortable: true,
        filterOn: obj => obj,
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
        numeric: false,
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
          expandFilters={expandFilters}
          onSort={setTableSort}
          onFilter={setTableFilterValues}
          onChangePagination={setTablePagination}
          onExpandFilters={setTableFiltersExpanded}
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

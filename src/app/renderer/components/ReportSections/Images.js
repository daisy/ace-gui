import EnhancedTable from './../Table/EnhancedTable';
import PropTypes from 'prop-types';
import React from 'react';
import TableCell from '@material-ui/core/TableCell';
const path = require('path');

// the images page of the report
export default class Images extends React.Component {

  static propTypes = {
    images: PropTypes.array.isRequired,
    filters: PropTypes.array,
    pagination: PropTypes.object,
    sort: PropTypes.object,
    setTableSort: PropTypes.func,
    setTableFilterValues: PropTypes.func,
    setTablePagination: PropTypes.func,
  };

  render() {
    let {images, filters, pagination, sort, setTableSort, setTableFilterValues, setTablePagination} = this.props;

    const heads = [
      {
        id: 'image',
        label: "Image",
        numeric: false,
        sortable: false,
        makeCell: (row, idx) =>
          <TableCell key={idx}><img src={path.resolve(reportFilepath, `../data/${row.src}`)}/></TableCell>
      },
      {
        id: 'alt',
        label: <span><code>alt</code> attribute</span>,
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.alt ? row.alt : "N/A"}</TableCell>
      },
      {
        id: 'describedby',
        label: <span><code>aria-describedby</code> content</span>,
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.describedby ? row.describedby : "N/A"}</TableCell>
      },
      {
        id: 'figcaption',
        label: <span>Associated <code>figcaption</code></span>,
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.figcaption ? row.figcaption : "N/A"}</TableCell>
      },
      {
        id: 'location',
        label: 'Location',
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="location"><pre>{row.location}</pre></TableCell>
      },
      {
        id: 'role',
        label: 'Role',
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.role ? row.role : "N/A"}</TableCell>
      }
    ];


    return (
      <section className="report-section images">
        <h2>Images</h2>
        <EnhancedTable
          rows={images}
          heads={heads}
          id={'images'}
          isPaginated={true}
          filters={filters}
          sort={sort}
          pagination={pagination}
          onSort={setTableSort}
          onFilter={setTableFilterValues}
          onChangePagination={setTablePagination}
          />
          {rows.length == 0 ? <p>No images encountered in this publication.</p> : ''}
      </section>
    );
  }
}

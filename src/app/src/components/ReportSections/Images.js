import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination} from '@material-ui/core';
const path = require('path');
import TablePaginationActionsWrapped from "./../Table/TablePaginationActions";
import EnhancedTable from './../Table/EnhancedTable';

// the images table in the report
export default class Images extends React.Component {

  static propTypes = {
    images: PropTypes.array.isRequired,
    reportFilepath: PropTypes.string.isRequired,
    initialOrder: PropTypes.string.isRequired,
    initialOrderBy: PropTypes.string.isRequired,
    onReorder: PropTypes.func
  };

  state = {
    page: 0,
    rowsPerPage: 5
  };

  onReorder = (order, orderBy) => {
    this.props.onReorder("images", order, orderBy);
  };

  render() {
    let {page, rowsPerPage} = this.state;
    let {images, reportFilepath, initialOrder, initialOrderBy} = this.props;

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
        numeric: true,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.alt ? row.alt : "N/A"}</TableCell>
      },
      {
        id: 'describedby',
        label: <span><code>aria-describedby</code> content</span>,
        numeric: true,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.describedby ? row.describedby : "N/A"}</TableCell>
      },
      {
        id: 'figcaption',
        label: <span>Associated <code>figcaption</code></span>,
        numeric: true,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.figcaption ? row.figcaption : "N/A"}</TableCell>
      },
      {
        id: 'location',
        label: 'Location',
        numeric: true,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="location"><pre>{row.location}</pre></TableCell>
      },
      {
        id: 'role',
        label: 'Role',
        numeric: true,
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
          isPaginated={true}
          initialOrderBy={initialOrderBy}
          initialOrder={initialOrder}
          onReorder={this.onReorder}
          filterFields={[
            {name: 'location', filterOn: obj => obj.indexOf('#') > 0 ? obj.slice(0, obj.indexOf('#')) : obj},
            {name: 'role', filterOn: obj => obj}
          ]}/>
      </section>
    );
  }
}

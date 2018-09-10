import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination} from '@material-ui/core';
const path = require('path');
import TablePaginationActionsWrapped from "./TablePaginationActions";
import EnhancedTable from './EnhancedTable';

// the images table in the report
export default class Images extends React.Component {

  static propTypes = {
    images: PropTypes.array.isRequired,
    reportFilepath: PropTypes.string.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      rowsPerPage: 5,
      order: this.props.order,
      orderBy: this.props.orderBy
    };
  }

  onChangePage = (event, page) => {
    this.setState({ page });
  };

  onChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    let {page, rowsPerPage} = this.state;

    const heads = [
      {
        id: 'image',
        label: "Image",
        numeric: false,
        sortable: false,
        makeCell: (row, idx) =>
          <TableCell key={idx}><img src={path.resolve(this.props.reportFilepath, `../data/${row.src}`)}/></TableCell>
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
      <section className="images">
        <h2>Images</h2>
        <EnhancedTable
          rows={this.props.images}
          heads={heads}
          orderBy='location'
          order='asc'
          isPaginated={true}/>
      </section>
    );
  }
}

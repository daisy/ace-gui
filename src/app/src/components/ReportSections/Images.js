import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination} from '@material-ui/core';
const path = require('path');
import TablePaginationActionsWrapped from "./TablePaginationActions";


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
      rowsPerPage: 5
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
    return (
      <section className="images">
        <h2>Images</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell><code>alt</code> attribute</TableCell>
              <TableCell><code>aria-describedby</code> content</TableCell>
              <TableCell>Associated <code>figcaption</code></TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.images.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((image, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell><img src={path.resolve(this.props.reportFilepath, `../data/${image.src}`)}/></TableCell>
                  <TableCell>{image.alt ? image.alt : "N/A"}</TableCell>
                  <TableCell>{image.describedby ? image.describedby : "N/A"}</TableCell>
                  <TableCell>{image.figcaption ? image.figcaption : "N/A"}</TableCell>
                  <TableCell className="location"><pre>{image.location}</pre></TableCell>
                  <TableCell>{image.role ? image.role : "N/A"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                colSpan={3}
                count={this.props.images.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={this.onChangePage}
                onChangeRowsPerPage={this.onChangeRowsPerPage}
                ActionsComponent={TablePaginationActionsWrapped}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </section>
    );
  }
}

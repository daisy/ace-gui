import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableFooter, TableRow, TablePagination} from '@material-ui/core';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FilterListIcon from '@material-ui/icons/FilterList';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import TablePaginationActionsWrapped from "./TablePaginationActions";


function desc(a, b, orderBy, head) {
  let aValue = head.numeric ? a[orderBy] : head.makeNumeric(a[orderBy]);
  let bValue = head.numeric ? b[orderBy] : head.makeNumeric(b[orderBy]);

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy, heads) {
  let head = heads.find(h => h.id === orderBy);
  return order === 'desc' ? (a, b) => desc(a, b, orderBy, head) : (a, b) => -desc(a, b, orderBy, head);
}
/*
heads = [{
    id: id,
    label: str,
    numeric: bool,
    makeCell: fn (row[headId], idx),
    makeNumeric: fn (row[headId])
  },
  ...
]

rows:[{headId: whatever, headId: whatever}, ...]
*/
export default class EnhancedTable extends React.Component {
  static propTypes = {
    heads: PropTypes.array,
    rows: PropTypes.array,
    order: PropTypes.string,
    orderBy: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      order: this.props.order,
      orderBy: this.props.orderBy,
      page: 0,
      rowsPerPage: 5,
    };
  }

  handleRequestSort = (id) => {
    let order = 'desc';
    if (this.state.orderBy === id && this.state.order === 'desc') {
      order = 'asc';
    }
    this.setState({ order: order, orderBy: id });
  };

  onChangePage = (event, page) => {
    this.setState({ page });
  };

  onChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { rows, heads } = this.props;
    const {order, orderBy, page, rowsPerPage} = this.state;
    const emptyRows = this.state.rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
      <Table>
        <TableHead>
          <TableRow>
            {heads.map(head => {
              return (
                <TableCell
                  key={head.id}
                  numeric={head.numeric}
                  sortDirection={head.sortable && orderBy === head.id ? order : false}>
                  {head.sortable ?
                  <Tooltip
                  title="Sort"
                  placement={head.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}>
                    <TableSortLabel
                      active={orderBy === head.id}
                      direction={order}
                      onClick={event => this.handleRequestSort(head.id)}>
                      {head.label}
                    </TableSortLabel>
                  </Tooltip>
                  : head.label }
              </TableCell>
              );
            }, this)}
          </TableRow>
        </TableHead>
        <TableBody>
          {stableSort(rows, getSorting(order, orderBy, heads))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, idx) => {
              return (
                <TableRow
                  tabIndex={-1}
                  key={idx}>
                  {heads.map((head, idx) => {
                    return (head.makeCell(row[head.id], idx));
                  })}
                </TableRow>
              );
            })}
          {emptyRows > 0 && (
            <TableRow style={{ height: 49 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              colSpan={3}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={this.onChangePage}
              onChangeRowsPerPage={this.onChangeRowsPerPage}
              ActionsComponent={TablePaginationActionsWrapped}
            />
          </TableRow>
        </TableFooter>
      </Table>
    );
  }
}

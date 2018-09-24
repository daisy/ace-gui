import { Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow } from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import FilterListIcon from '@material-ui/icons/FilterList';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import TablePaginationActionsWrapped from "./TablePaginationActions";
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import { lighten } from '@material-ui/core/styles/colorManipulator';

function desc(a, b, orderBy, head) {
  let aValue = head.hasOwnProperty('sortOn') ? head.sortOn(a[orderBy]) : a[orderBy];
  let bValue = head.hasOwnProperty('sortOn') ? head.sortOn(b[orderBy]) : b[orderBy];

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
head properties

heads = [{
    id: id,
    label: str,
    numeric: bool,
    makeCell: fn (row[headId], idx),
    sortOn: fn (row[headId])
  },
  ...
]

rows:[{headId1: value, headId2: value}, ...]

filters: [headId1: {values: [], filterOnFn}, ..]
]
*/
export default class EnhancedTable extends React.Component {

  static propTypes = {
    id: PropTypes.string.isRequired,
    heads: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
    isPaginated: PropTypes.bool.isRequired,

    filters: PropTypes.object.isRequired,
    sort: PropTypes.object.isRequired,
    pagination: PropTypes.object.isRequired,

    onSort: PropTypes.func.isRequired,
    onFilter: PropTypes.func.isRequired,
    onChangePagination: PropTypes.func.isRequired,
  };

  state = {
    filters: Object.keys(this.props.filters).map(key => ({
      ...this.props.filters[key],
      id: key,
      options: this.props.rows.reduce(
        (uniqueValues, row) => {
          let head = this.props.heads.find(h => h.id === key);
          let rowValue = head.filterOn(row[key]);
          return rowValue != null && uniqueValues.indexOf(rowValue) == -1 ? uniqueValues.concat(rowValue) : uniqueValues;
        },
      [])
      .map(option => {return {value: option, label: option}; } ),
      }))
      .reduce((activeFilters, filter) =>
        filter.options.length != 0 ? activeFilters.concat(filter) : activeFilters, []) // don't include filters with no options
  };

  onChangeSort = (id) => {
    let {onSort, sort} = this.props;
    let order = 'desc';
    if (sort.orderBy === id && sort.order === 'desc') {
      order = 'asc';
    }
    onSort(this.props.id, {order: order, orderBy: id});
  };

  onChangePage = (event, page) => {
    let {onChangePagination, pagination} = this.props;
    onChangePagination(this.props.id, {rowsPerPage: pagination.rowsPerPage, page: page});
  };

  onChangeRowsPerPage = event => {
    let {onChangePagination, pagination} = this.props;
    onChangePagination(this.props.id, {page: pagination.page, rowsPerPage: event.target.value});
  };

  onChangeFilter = (id, values, {action, removedValue}) => {
    let {onFilter} = this.props;
    // long-winded but trying not to upset react state
    let filters = this.state.filters;
    let filter = filters.find(filter => filter.id == id);
    let filterIdx = filters.indexOf(filter);
    let filterValues = filter.values;

    if (action == "select-option") {
      console.log(`Filter [${id}]: adding criteria`);
      filterValues = values;

    }
    else if (action == "remove-value") {
      console.log(`Filter [${id}]: removing criteria`);
      filterValues = values;
    }
    else if (action == "clear") {
      console.log(`Filter [${id}]: clear`);
      filterValues = [];
    }
    onFilter(this.props.id, id, filterValues);
  };

  filterRows() {
    let {rows} = this.props;
    let {filters} = this.state;
    filters.forEach(filter => {
      if (filter.values.length > 0) {
        rows = rows.reduce((filteredRows, row) => {
          // the row property values might be strings or objects, so run the filterOn function to get the
          // value the filter is based on
          let rowValue = filter.filterOn(row[filter.id]);
          if (filter.values.find(sel => sel.value == rowValue)) {
            return filteredRows.concat(row);
          }
          else {
            return filteredRows;
          }
        }, []);
      }
    });
    return rows;
  }

  render() {
    const { heads, isPaginated, pagination: {rowsPerPage, page}, sort: {order, orderBy} } = this.props;
    const {filters} = this.state;
    const filteredRows = this.filterRows();
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredRows.length - page * rowsPerPage);

    return (
      <div>
      {filters.length > 0 ?
        <ExpansionPanel className="table-filters-panel" classes={{expanded: 'expanded'}}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Filter by</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className="table-filters">

            {filters.map((filter, idx) =>
              <Select
                key={idx}
                options={filter.options}
                value={filter.values}
                onChange={(values, {action, removedValue}) => this.onChangeFilter(filter.id, values, {action, removedValue})}
                name={heads.find(head => head.id == filter.id).label}
                closeMenuOnSelect={true}
                isMulti={true}
                placeholder={heads.find(head => head.id == filter.id).label}
                isSearchable={true}
              />)}

            </ExpansionPanelDetails>
          </ExpansionPanel>
      : ''}
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
                  placement={'bottom-start'}
                  enterDelay={300}>
                    <TableSortLabel
                      active={orderBy === head.id}
                      direction={order}
                      onClick={event => this.onChangeSort(head.id)}>
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
          {stableSort(filteredRows, getSorting(order, orderBy, heads))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, idx) => {
              return (
                <TableRow
                  tabIndex={-1}
                  key={idx}>
                  {heads.map((head, idx) => {
                    return (head.makeCell(row, idx));
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
        {isPaginated ?
        <TableFooter>
          <TableRow>
            <TablePagination
              colSpan={3}
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={this.onChangePage}
              onChangeRowsPerPage={this.onChangeRowsPerPage}
              ActionsComponent={TablePaginationActionsWrapped}
            />
          </TableRow>
        </TableFooter>
        : '' }
      </Table>
      </div>
    );
  }
}

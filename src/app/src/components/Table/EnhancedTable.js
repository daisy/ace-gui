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
import Select from 'react-select';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

function desc(a, b, orderBy, head) {
  let aValue = head.numeric ? a[orderBy] : head.sortOn(a[orderBy]);
  let bValue = head.numeric ? b[orderBy] : head.sortOn(b[orderBy]);

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
    sortOn: fn (row[headId])
  },
  ...
]

rows:[{headId: whatever, headId: whatever}, ...]

filters: [headId1, headId2, ..]
]
*/
export default class EnhancedTable extends React.Component {

  static defaultProps = {
    filterFields: []
  };

  static propTypes = {
    heads: PropTypes.array,
    filterFields: PropTypes.array,
    // initialFilters: PropTypes.array,
    initialOrder: PropTypes.string,
    initialOrderBy: PropTypes.string,
    isPaginated: PropTypes.bool,
    onBeforeClose: PropTypes.func
  };

  state = {
    order: this.props.initialOrder,
    orderBy: this.props.initialOrderBy,
    page: 0,
    rowsPerPage: 5,
    filters: this.props.filterFields.map(field => ({
        id: field.name,
        filterOn: field.filterOn,
        options: this.props.rows.reduce(
          (uniqueValues, row) => {
            let rowValue = field.filterOn(row[field.name]);
            return rowValue != null && uniqueValues.indexOf(rowValue) == -1 ? uniqueValues.concat(rowValue) : uniqueValues;
          },
          [])
          .map(option => {return {value: option, label: option}; } ),
        selections: []
      }))
      .reduce((activeFilters, filter) =>
        filter.options.length != 0 ? activeFilters.concat(filter) : activeFilters, []) // don't include filters with no options
  };

  onRequestSort = (id) => {
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

  onFilterChange = (id, values, {action, removedValue}) => {
    // long-winded but trying not to upset react state
    let filters = this.state.filters;
    let filter = filters.find(filter => filter.id == id);
    let filterIdx = filters.indexOf(filter);
    let selections = filter.selections;

    if (action == "select-option") {
      console.log(`Filter [${id}]: adding criteria`);
      selections = values;

    }
    else if (action == "remove-value") {
      console.log(`Filter [${id}]: removing criteria`);
      selections = values;
    }
    else if (action == "clear") {
      console.log(`Filter [${id}]: clear`);
      selections = [];
    }

    filter.selections = selections;
    filters[filterIdx] = filter;
    this.setState({filters});
  };

  filterRows() {
    let rows = this.props.rows;
    let {filters} = this.state;
    filters.forEach(filter => {
      if (filter.selections.length > 0) {
        rows = rows.reduce((filteredRows, row) => {
          // the row property values might be strings or objects, so run the filterOn function to get the
          // value the filter is based on
          let rowValue = filter.filterOn(row[filter.id]);
          if (filter.selections.find(sel => sel.value == rowValue)) {
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
    const { heads, isPaginated } = this.props;
    const { order, orderBy, page, rowsPerPage, filters } = this.state;
    const filteredRows = this.filterRows();
    const emptyRows = this.state.rowsPerPage - Math.min(rowsPerPage, filteredRows.length - page * rowsPerPage);

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
                value={filter.selections}
                onChange={(values, {action, removedValue}) => this.onFilterChange(filter.id, values, {action, removedValue})}
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
                  placement={head.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}>
                    <TableSortLabel
                      active={orderBy === head.id}
                      direction={order}
                      onClick={event => this.onRequestSort(head.id)}>
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

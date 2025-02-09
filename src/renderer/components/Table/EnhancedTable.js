import { Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow } from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
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

import { localizer } from './../../../shared/l10n/localize';
const { localize } = localizer;

const tableLayoutFixed = false;

function desc(a, b, orderBy, head) {
  // console.log("----------", JSON.stringify(a), " ================ ", JSON.stringify(b), " ############### ", orderBy, " ***** ", JSON.stringify(head));
  let aValue = head.hasOwnProperty('sortOn') ? head.sortOn(a[orderBy]) : a[orderBy];
  let bValue = head.hasOwnProperty('sortOn') ? head.sortOn(b[orderBy]) : b[orderBy];

  const aValueNIL = aValue == null; // NOT TRIPLE EQUAL! (includes typeof "undefined")
  const bValueNIL = bValue == null;
  if (aValueNIL && bValueNIL) {
    // console.log("NILLLL", typeof aValue, typeof bValue, aValue, bValue);
    aValue = "";
    bValue = "";
  } else if (aValueNIL) {
    // console.log("NILLLL a", typeof bValue, bValue);
    if (typeof bValue === "string") {
      aValue = "";
    } else {
      aValue = 0;
    }
  } else if (bValueNIL) {
    // console.log("NILLLL b", typeof aValue, aValue);
    if (typeof aValue === "string") {
      bValue = "";
    } else {
      bValue = 0;
    }
  }
  // console.log("%%%%%%%%% ", aValue, bValue);

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
    expandFilters: PropTypes.bool.isRequired,

    onSort: PropTypes.func.isRequired,
    onFilter: PropTypes.func.isRequired,
    onChangePagination: PropTypes.func.isRequired,

    onExpandFilters: PropTypes.func.isRequired
  };

  state = {
    filters:
      Object.keys(this.props.filters)
      .map((key, _ind, filtersKeys) => {
        let head = this.props.heads.find(h => h.id === key);
        const options = this.props.rows
          .reduce((uniqueValues, row) => {
              let rowValue = head.filterOn(row[key]);
              return (rowValue != null && uniqueValues.indexOf(rowValue) == -1) ?
                uniqueValues.concat(rowValue) :
                uniqueValues;
            },
          [])
          .map(option => {
            const ignoreMissingKey = (head.l10n && head.l10n.ignoreMissingKey) ? true : false;
            return {
              value: option,
              label: head.l10n ?
                (
                  head.l10n.keyPrefix ?
                  localize(head.l10n.keyPrefix + option, {ignoreMissingKey}).replace(head.l10n.keyPrefix, "") :
                  localize(option, {ignoreMissingKey})
                ) : option
            };
          });
        const obj = this.props.filters[key];
        // console.log("FILTERS obj init: ", key, JSON.stringify(obj, null, 4));
        if (obj.valuesRegex) {
          const regexp = new RegExp(obj.valuesRegex);
          obj.values = options.reduce((acc, option) => {
            if (regexp.test(option.value)) {
              // console.log("FILTERS regexp match", option.value);
              return acc.concat({
                ...option,
              });
            }
            // console.log("FILTERS regexp NO match", option.value);
            return acc;
          }, []);
          // console.log("FILTERS obj valuesRegex: ", obj.valuesRegex, JSON.stringify(options, null, 4), JSON.stringify(obj.values, null, 4));
        } else {
          const oneWithRegex = filtersKeys.map(filterKey => this.props.filters[filterKey]).find(filtr => filtr.valuesRegex);
          if (oneWithRegex) {
            obj.values = []; // reset others, valuesRegex wins all
          }
        }
        return {
          ...obj,
          id: key,
          options,
        };
      })

      // don't include filters with no options
      .filter(filter => filter.options.length)
      // equivalent to the above filter
      // .reduce((activeFilters, filter) =>
      //   filter.options.length != 0 ? activeFilters.concat(filter) : activeFilters, [])
      ,
  };

  onChangeSort = (id) => {
    let {onSort, sort} = this.props;
    let order = 'desc';
    if (sort.orderBy === id && sort.order === 'desc') {
      order = 'asc';
    }
    //console.log("SORT", this.props.id, order, id);
    onSort(this.props.id, {order: order, orderBy: id});
  };

  onPageChange = (event, page) => {
    let {onChangePagination, pagination} = this.props;
    onChangePagination(this.props.id, {rowsPerPage: pagination.rowsPerPage, page: page});
  };

  onRowsPerPageChange = event => {
    let {onChangePagination, pagination} = this.props;
    onChangePagination(this.props.id, {page: pagination.page, rowsPerPage: event.target.value});
  };

  // values is an array formatted like each option is formatted {value: '', label: ''}
  onChangeFilter = (id, values, {action, removedValue}) => {
    // the state doesn't get recalculated on render
    // so either we could be really clever or just set it manually here:
    let filters = this.state.filters;
    let filter = filters.find(f => f.id == id);
    filter.values = values;
    filter.valuesRegex = null;
    filters[id] = filter;
    this.props.onChangePagination(this.props.id, {page: 0, rowsPerPage: this.props.pagination.rowsPerPage});
    this.setState({filters});
    // console.log("FILTERS onChangeFilter: ", JSON.stringify(filters, null, 4));
    this.props.onFilter(this.props.id, id, values);
  };

  onChangeExpanded = (expanded) => {
    this.props.onExpandFilters(this.props.id, expanded);
  }

  filterRows() {
    let {rows, heads} = this.props;
    let {filters} = this.state;
    // console.log("FILTERS filterRows: ", JSON.stringify(filters, null, 4));
    filters.forEach(filter => {
      if (filter.values.length > 0) {
        rows = rows
        .filter(row => {
          let head = heads.find(h => h.id == filter.id);
          let rowValue = head.filterOn(row[filter.id]);
          return filter.values.find(sel => {
            return sel.value == rowValue;
          });
        })
        // equivalent to the above filter
        // .reduce((filteredRows, row) => {
        //   // the row property values might be strings or objects, so run the filterOn function to get the
        //   // value the filter is based on
        //   let head = heads.find(h=>h.id == filter.id);
        //   let rowValue = head.filterOn(row[filter.id]);
        //   if (filter.values.find(sel => sel.value == rowValue)) {
        //     return filteredRows.concat(row);
        //   }
        //   else {
        //     return filteredRows;
        //   }
        // }, [])
        ;
      }
    });
    return rows;
  }

  render() {
    const { heads, isPaginated, pagination: {rowsPerPage, page}, sort: {order, orderBy}, expandFilters } = this.props;
    const {filters, rows} = this.state;
    const filteredRows = this.filterRows();

    // const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredRows.length - page * rowsPerPage);
    // const rowsPerPageAdjusted = Math.min(rowsPerPage, filteredRows.length);

    const rowsPerPageOptions = [10, 25, 50];
    // if (filteredRows.length > 25) {
    //   rowsPerPageOptions.push(25);
    // }
    // if (filteredRows.length > 50) {
    //   rowsPerPageOptions.push(50);
    // }
    if (filteredRows.length > 100) {
      rowsPerPageOptions.push(100);
    }
    if (filteredRows.length > 200) {
      rowsPerPageOptions.push(200);
    }
    if (filteredRows.length > 300) {
      rowsPerPageOptions.push(300);
    }

    // console.log("filteredRows: ", order, orderBy, JSON.stringify(filteredRows, null, 4));

    // console.log("FILTERS render: ", JSON.stringify(filters, null, 4));

    // ensure correct language
    filters.forEach((filter) => {
      let head = heads.find(h => h.id === filter.id);
      if (!head) {
        return;
      }
      const ignoreMissingKey = (head.l10n && head.l10n.ignoreMissingKey) ? true : false;
      if (filter.options) {
        filter.options.forEach((option) => {
          option.label = head.l10n ?
            (head.l10n.keyPrefix ? localize(head.l10n.keyPrefix + option.value, {ignoreMissingKey}).replace(head.l10n.keyPrefix, "").replace("wcag2aaa", "WCAG 2.0 AAA").replace("wcag2aa", "WCAG 2.0 AA").replace("wcag2a", "WCAG 2.0 A").replace("wcag21aaa", "WCAG 2.1 AAA").replace("wcag21aa", "WCAG 2.1 AA").replace("wcag21a", "WCAG 2.1 A").replace("wcag22aaa", "WCAG 2.2 AAA").replace("wcag22aa", "WCAG 2.2 AA").replace("wcag22a", "WCAG 2.2 A") : localize(option.value, {ignoreMissingKey})) :
            option.value;
        });
      }
      if (filter.values) {
        filter.values.forEach((value) => {
          value.label = head.l10n ?
            (head.l10n.keyPrefix ? localize(head.l10n.keyPrefix + value.value, {ignoreMissingKey}).replace(head.l10n.keyPrefix, "") : localize(value.value, {ignoreMissingKey})) :
            value.value;
        });
      }
    });

    return (
      <div style={{ marginTop: 6 }}>
      {filters.length > 0 ?
        <Accordion
          className="table-filters-panel"
          expanded={expandFilters}
          classes={{expanded: 'expanded'}}
          onChange={(e, v) => this.onChangeExpanded(v)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{localize("enhancedTable.filterBy")}</Typography>
          </AccordionSummary>
          <AccordionDetails className="table-filters">
            {filters.map((filter, idx) =>
            <Select
                key={idx}
                options={filter.options}
                value={filter.values}
                onChange={(values, {action, removedValue}) => this.onChangeFilter(filter.id, values || [], {action, removedValue})}
                name={heads.find(head => head.id == filter.id).label}
                closeMenuOnSelect={true}
                isMulti={true}
                placeholder={heads.find(head => head.id == filter.id).label}
                isSearchable={true}
              />
            )}
        </AccordionDetails>
      </Accordion>
      : ''}
          <Table aria-live="polite" style={{
          tableLayout: tableLayoutFixed ? "fixed" : undefined,
          border: "silver solid 1px",
          overflow: "visible"
        }}>
        <TableHead>
          <TableRow>
            {heads.map(head => {
              return (
                <TableCell
                  style={{border: "black solid 2px", fontWeight: "bold", overflow: "hidden", padding: 6,
                  wordBreak: "auto-phrase"
                  }}
                  key={head.id}
                  numeric={head.numeric.toString()}
                  sortDirection={head.sortable && orderBy === head.id ? order : false}>
                  {head.sortable ?
                  <Tooltip
                  title={localize("enhancedTable.sortBy") + head.label}
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
          {
            stableSort(filteredRows, getSorting(order, orderBy, heads))
            .slice(Math.min(filteredRows.length - 1, page * rowsPerPage), page * rowsPerPage + rowsPerPage)
            .map((row, idx) => {
              return (
                <TableRow style={{
                    // border: "magenta solid 1px",
                    height: "max-content",
                  }}
                  tabIndex={-1}
                  key={idx}>
                  {heads.map((head, idx) => {
                    return (head.makeCell(row, idx));
                  })}
                </TableRow>
              );
            })}
          {
          // emptyRows > 0 && (
          //   <TableRow style={{ height: 49 * emptyRows }}>
          //     <TableCell colSpan={heads.length} />
          //   </TableRow>
          // )
          }
        </TableBody>
        {isPaginated ?
        <TableFooter>
          <TableRow>
            <TablePagination
              classes={{
                spacer: "tablePaginationSpacerClass",
                //.MuiTablePagination-spacer
              }}
              colSpan={heads.length}
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              page={page}
              onPageChange={this.onPageChange}
              onRowsPerPageChange={this.onRowsPerPageChange}
              ActionsComponent={TablePaginationActionsWrapped}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
              labelRowsPerPage={localize("enhancedTable.rowsPerPage")}
            />
          </TableRow>
        </TableFooter>
        : '' }
      </Table>

      </div>
    );
  }
}

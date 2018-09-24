export const SELECT_TAB = "SELECT_TAB";
export const SET_TABLE_FILTER_VALUES = "SET_TABLE_FILTER_VALUES";
export const SET_TABLE_SORT = "SET_TABLE_SORT";
export const SET_TABLE_PAGINATION = "SET_TABLE_PAGINATION";
export const SET_TABLE_FILTERS_EXPANDED = "SET_TABLE_FILTERS_EXPANDED";

export function selectTab(tabIndex) {
  return {
    type: SELECT_TAB,
    payload: tabIndex,
  };
}
export function setTableFilterValues(tableId, filterId, filterValues) {
  return {
    type: SET_TABLE_FILTER_VALUES,
    payload: {tableId, filterId, filterValues},
  };
}
export function setTableSort(tableId, sort) {
  return {
    type: SET_TABLE_SORT,
    payload: {tableId, sort},
  };
}
export function setTablePagination(tableId, pagination) {
  return {
    type: SET_TABLE_PAGINATION,
    payload: {tableId, pagination},
  };
}
export function setTableFiltersExpanded(tableId, isExpanded) {
  return {
    type: SET_TABLE_FILTERS_EXPANDED,
    payload: {tableId, isExpanded}
  }
}

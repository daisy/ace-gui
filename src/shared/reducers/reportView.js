/* eslint-disable no-param-reassign */
import {
  SELECT_TAB,
  SET_TABLE_FILTER_VALUES,
  SET_TABLE_SORT,
  SET_TABLE_PAGINATION
} from '../actions/reportView';


const initialState = {
  selectedTab: 0,
  filters:
  {
    "violations": {
      "impact": {values: []},
      "rulesetTag": {values: []},
      "rule": {values: []},
      "location": {values: []}
    },
    "metadata": {
      "name": {values: []}
    },
    "images": {
      "location": {values: []},
      "role": {values: []}
    }
  },

  sort: {
    "violations": {order: "desc", orderBy: "impact"},
    "metadata": {order: "asc", orderBy: "name"},
    "images": {order: "desc", orderBy: "location"}
  },

  pagination: {
    "violations": {page: 0, rowsPerPage: 5},
    "metadata": {page: 0, rowsPerPage: 5},
    "images": {page: 0, rowsPerPage: 5}
  }
};

export default function reportView(state = initialState, action) {
  switch (action.type) {
    case SELECT_TAB: {
      return {
        ...state,
        selectedTab: action.payload,
      };
    }
    case SET_TABLE_FILTER_VALUES: {
      let {tableId, filterId, filterValues} = action.payload;
      let tableFilters = state.filters;
      if (tableFilters.hasOwnProperty(tableId)) {
        if (tableFilters[tableId].hasOwnProperty(filterId)) {
          tableFilters[tableId][filterId].values = filterValues;
          return {
            ...state,
            filters: tableFilters
          };
        }
      }
      return state;
    }
    case SET_TABLE_SORT: {
      let {tableId, sort: {order, orderBy}} = action.payload;
      let sort = state.sort;
      sort[tableId] = {order, orderBy};
      return {
        ...state,
        sort
      };
    }
    case SET_TABLE_PAGINATION: {
      let {tableId, pagination: {page, rowsPerPage}} = action.payload;
      let pagination = state.pagination;
      pagination[tableId] = {page, rowsPerPage};
      return {
        ...state,
        pagination
      };
    }

    default:
      return state;
  }
}

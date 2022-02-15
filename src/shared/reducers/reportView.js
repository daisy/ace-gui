/* eslint-disable no-param-reassign */
import {
  SELECT_TAB,
  SET_TABLE_FILTER_VALUES,
  SET_TABLE_SORT,
  SET_TABLE_PAGINATION,
  SET_TABLE_FILTERS_EXPANDED,
  RESET_INITIAL_REPORT_VIEW,
} from '../actions/reportView';


const initialState = {
  selectedTab: 0,
  filters:
  {
    "violations": {
      "impact": {values: [], valuesRegex: null},
      "rulesetTag": {values: [], valuesRegex: null},
      "rule": {values: [], valuesRegex: null},
      "location": {values: [], valuesRegex: null},
    },
    "metadata": {
      "name": {values: [], valuesRegex: null}
    },
    "images": {
      "location": {values: [], valuesRegex: null},
      "role": {values: [], valuesRegex: null}
    }
  },
  expandFilters:
  {
    "violations": false,
    "metadata": false,
    "images": false
  },
  sort: {
    "violations": {order: "desc", orderBy: "impact"},
    "metadata": {order: "asc", orderBy: "name"},
    "images": {order: "desc", orderBy: "location"}
  },

  pagination: {
    "violations": {page: 0, rowsPerPage: 50},
    "metadata": {page: 0, rowsPerPage: 50},
    "images": {page: 0, rowsPerPage: 50}
  }
};

export default function reportView(state = initialState, action) {
  state = JSON.parse(JSON.stringify(state));

  switch (action.type) {
    case RESET_INITIAL_REPORT_VIEW: {
      return {
        ...initialState,
        selectedTab: typeof state.selectedTab === "number" ? state.selectedTab : undefined,
      };
    }
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
          if (typeof filterValues === "string") {
            tableFilters[tableId][filterId].valuesRegex = filterValues;
            tableFilters[tableId][filterId].values = [];
          } else {
            tableFilters[tableId][filterId].valuesRegex = null;
            tableFilters[tableId][filterId].values = filterValues;
          }
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
    case SET_TABLE_FILTERS_EXPANDED: {
      let {tableId, isExpanded } = action.payload;
      let expandFilters = state.expandFilters;
      expandFilters[tableId] = isExpanded;
      return {
        ...state,
        expandFilters
      };
    }
    default:
      return state;
  }
}

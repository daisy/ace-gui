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
      "impact": {
        values: [],
        filterOn: obj => obj},
      "rulesetTag": {
        values: [],
        filterOn: obj => obj},
      "rule": {
        values: [],
        filterOn: obj => obj.rule},
      "location": {
        values: [],
        filterOn: obj => obj.filename.indexOf('#') > 0 ? obj.filename.slice(0, obj.filename.indexOf('#')) : obj.filename}
    },
    "metadata": {
      "name": {values: [], filterOn: obj => obj}
    },
    "images": {
      "location": {values: [], filterOn: filterOn: obj => obj.indexOf('#') > 0 ? obj.slice(0, obj.indexOf('#')) : obj},
      "role": {values: [], filterOn: obj => obj}
    }
  },

  sort: {
    "violations": {order: "desc", orderBy: "impact"},
    "metadata": {order: "asc", orderBy: "name"},
    "images": {order: "desc", orderBy: "location"}
  },

  pagination: {
    "violations": {page: 0, rowsPerPage: 5},
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
      let tableFilters = state.filters?;
      if (tableFilters.hasOwnProperty(tableId)) {
        if (tableFilters[tableId].hasOwnProperty(filterId)) {
          tableFilters[tableId][filterId].values = filterValues;
          return {
            ...state,
            tableFilters
          };
        }
      }
      return state;
    }
    case SET_TABLE_SORT: {
      let {tableId, order, orderBy} = action.payload;
      let sort = state.sort;
      tableSort[tableId] = {order, orderBy};
      return {
        ...state,
        sort
      };
    }
    case SET_TABLE_PAGINATION: {
      let {tableId, tablePagination} = action.payload;
      let pagination = state.pagination;
      pagination[tableId] = tablePagination;
      return {
        ...state,
        pagination
      };
    }

    default:
      return state;
  }
}

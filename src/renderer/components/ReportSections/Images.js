import EnhancedTable from './../Table/EnhancedTable';
import PropTypes from 'prop-types';
import React from 'react';
import TableCell from '@material-ui/core/TableCell';
const path = require('path');

import { localizer } from './../../../shared/l10n/localize';
const { localize } = localizer;

// the images page of the report
export default class Images extends React.Component {

  static propTypes = {
    images: PropTypes.array.isRequired,
    reportPath: PropTypes.string.isRequired,
    filters: PropTypes.object.isRequired,
    pagination: PropTypes.object.isRequired,
    sort: PropTypes.object.isRequired,
    expandFilters: PropTypes.bool.isRequired,
    setTableSort: PropTypes.func.isRequired,
    setTableFilterValues: PropTypes.func.isRequired,
    setTablePagination: PropTypes.func.isRequired,
    setTableFiltersExpanded: PropTypes.func.isRequired
  };

  render() {
    let {
      images,
      reportPath,
      filters,
      pagination,
      sort,
      expandFilters,
      setTableSort,
      setTableFilterValues,
      setTablePagination,
      setTableFiltersExpanded} = this.props;

    const heads = [
      {
        id: 'image',
        label: localize("report.imagesSection.image"),
        numeric: false,
        sortable: false,
        makeCell: (row, idx) =>
          {
            const src = path.resolve(reportPath, `../data/${row.src}`);
            return <TableCell key={idx}><img src={`file://${src}`}/></TableCell>
          }
      },
      {
        id: 'alt',
        label: localize("report.imagesSection.altAttribute"),
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.alt ? row.alt : localize("report.imagesSection.NA")}</TableCell>
      },
      {
        id: 'describedby',
        label: localize("report.imagesSection.ariaDescribedbyContent"),
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.describedby ? row.describedby : localize("report.imagesSection.NA")}</TableCell>
      },
      {
        id: 'figcaption',
        label: localize("report.imagesSection.associatedFigcaption"),
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.figcaption ? row.figcaption : localize("report.imagesSection.NA")}</TableCell>
      },
      {
        id: 'location',
        label: localize("report.imagesSection.location"),
        numeric: false,
        sortable: true,
        filterOn: obj => obj.indexOf('#') > 0 ? obj.slice(0, obj.indexOf('#')) : obj,
        makeCell: (row, idx) =>
          <TableCell key={idx} className="location"><pre>{row.location}</pre></TableCell>
      },
      {
        id: 'role',
        label: localize("report.imagesSection.role"),
        numeric: false,
        sortable: true,
        filterOn: obj => obj,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.role ? row.role : localize("report.imagesSection.NA")}</TableCell>
      }
    ];


    return (
      <section className="report-section images">
        <h2>{localize("report.images")}</h2>
        <EnhancedTable
          rows={images}
          heads={heads}
          id={'images'}
          isPaginated={true}
          filters={filters}
          sort={sort}
          pagination={pagination}
          expandFilters={expandFilters}
          onSort={setTableSort}
          onFilter={setTableFilterValues}
          onChangePagination={setTablePagination}
          onExpandFilters={setTableFiltersExpanded}
          />
          {images.length == 0 ? <p>{localize("report.imagesSection.noImages")}</p> : ''}
      </section>
    );
  }
}

import EnhancedTable from './../Table/EnhancedTable';
import PropTypes from 'prop-types';
import React from 'react';
import TableCell from '@material-ui/core/TableCell';
const path = require('path');

import { localizer } from './../../../shared/l10n/localize';
const { localize } = localizer;

import { ipcRenderer } from 'electron';

const rowHeight = 150;

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
            const src = encodeURIComponent(path.resolve(reportPath, `../data/${row.src}`));
            return <TableCell key={idx} style={{
                border: "black solid 1px", padding: 6,
                overflow: "hidden",
                maxWidth: Math.round(rowHeight*1.5),
              }}>
              <img tabIndex="0" onKeyUp={(e) => {
                if (e.key === "Enter") {
                  // shell.openExternal(src);
                    ipcRenderer.send('ELECTRON_SHELL_OPEN_EXTERNAL', `file://${decodeURIComponent(src).replace(/\\/g, "/")}`);
                }
              }} onClick={() => {
                // shell.openExternal(src);
                ipcRenderer.send('ELECTRON_SHELL_OPEN_EXTERNAL', `file://${decodeURIComponent(src).replace(/\\/g, "/")}`);
              }} style={{ maxHeight: rowHeight, objectFit: "contain", cursor: "pointer" }} src={`fileproto://host/${src}`}/>
            </TableCell>
          }
      },
      {
        id: 'alt',
        label: localize("report.imagesSection.altAttribute"),
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell style={{
              border: "black solid 1px", padding: 0,
              overflow: "hidden",
          }} key={idx}>
      <div style={{
          overflow: "hidden",
          overflowY: "auto",
          padding: 6,
          margin: 0,
          height: rowHeight,
          maxHeight: rowHeight,
          whiteSpace: "break-spaces",
          textOverflow: "ellipsis"
        }} >
          {row.alt ? row.alt : localize("report.imagesSection.NA")}
        </div>
        </TableCell>
      },
      {
        id: 'describedby',
        label: localize("report.imagesSection.ariaDescribedbyContent"),
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell style={{
              border: "black solid 1px", padding: 0,
              overflow: "hidden",
          }} key={idx}>
          <div style={{
              overflow: "hidden",
              overflowY: "auto",
              padding: 6,
              margin: 0,
              height: rowHeight,
              maxHeight: rowHeight,
              whiteSpace: "break-spaces",
              textOverflow: "ellipsis"
            }}>
              {row.describedby ? row.describedby : localize("report.imagesSection.NA")}
            </div>
          </TableCell>
      },
      {
        id: 'details',
        label: localize("report.imagesSection.ariaDetails"),
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell style={{
              border: "black solid 1px", padding: 0,
              overflow: "hidden",
            }} key={idx}>
              <div style={{
                  overflow: "hidden",
                  overflowY: "auto",
                  padding: 6,
                  margin: 0,
                  height: rowHeight,
                  maxHeight: rowHeight,
                  whiteSpace: "break-spaces",
                  textOverflow: "ellipsis"
                }}>
                  {row.details ? row.details : localize("report.imagesSection.NA")}
              </div>
          </TableCell>
      },
      {
        id: 'figcaption',
        label: localize("report.imagesSection.associatedFigcaption"),
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell style={{
              border: "black solid 1px", padding: 0,
              overflow: "hidden",
          }} key={idx}>
          <div style={{
              overflow: "hidden",
              overflowY: "auto",
              padding: 6,
              margin: 0,
              height: rowHeight,
              maxHeight: rowHeight,
              whiteSpace: "break-spaces",
              textOverflow: "ellipsis"
            }}>
              {row.figcaption ? row.figcaption : localize("report.imagesSection.NA")}
            </div>
          </TableCell>
      },
      {
        id: 'role',
        label: localize("report.imagesSection.role"),
        numeric: false,
        sortable: true,
        filterOn: obj => obj,
        makeCell: (row, idx) =>
          <TableCell style={{
              border: "black solid 1px", padding: 0,
              overflow: "hidden",
          }} key={idx}>
      <div style={{
          overflow: "hidden",
          overflowY: "auto",
          padding: 6,
          margin: 0,
          height: rowHeight,
          maxHeight: rowHeight,
          whiteSpace: "break-spaces",
          textOverflow: "ellipsis"
        }}>
          {row.role ? row.role : localize("report.imagesSection.NA")}
        </div>
        </TableCell>
      },
      {
        id: 'location',
        label: localize("report.imagesSection.location"),
        numeric: false,
        sortable: true,
        filterOn: obj => obj.indexOf('#') > 0 ? obj.slice(0, obj.indexOf('#')) : obj,
        makeCell: (row, idx) =>
          <TableCell style={{
              border: "black solid 1px", padding: 0,
              overflow: "hidden",
          }} key={idx}>
      <div style={{
          overflow: "hidden",
          overflowY: "auto",
          padding: 6,
          margin: 0,
          height: rowHeight,
          maxHeight: rowHeight,
          textOverflow: "ellipsis",
          overflowWrap: "break-word",
        }} className="location">
          <pre style={{
              whiteSpace: "pre-wrap",
              padding: 0,
              margin: 0,
              maxWidth: 300,
            }}>{decodeURIComponent(row.location)}</pre>
              <p style={{
                  whiteSpace: "pre-wrap",
                  padding: 3,
                  border: "silver solid 2px",
                  fontFamily: "monospace",
                  maxWidth: 300,
                }}>{ row.src }</p>
        </div>
        </TableCell>
      }
    ];


    return (
      <section className="report-section images">
        {
          // <h2>{localize("report.images")}</h2>
        }
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

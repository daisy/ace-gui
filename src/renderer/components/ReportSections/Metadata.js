import EnhancedTable from "./../Table/EnhancedTable";
import PropTypes from 'prop-types';
import React from 'react';
import TableCell from '@material-ui/core/TableCell';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import {showMetadataEditor} from './../../../shared/actions/metadata';

import { localizer } from './../../../shared/l10n/localize';
const { localize } = localizer;

const {ipcRenderer} = require('electron');

const styles = theme => ({
  editButton: {
    'float': 'right',
  },
});

const KB_BASE = 'http://kb.daisy.org/publishing/';

// the metadata page of the report
class Metadata extends React.Component {

  static propTypes = {
    metadata: PropTypes.array.isRequired,
    a11ymetadata: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
    pagination: PropTypes.object.isRequired,
    sort: PropTypes.object.isRequired,
    expandFilters: PropTypes.bool.isRequired,
    setTableSort: PropTypes.func.isRequired,
    setTableFilterValues: PropTypes.func.isRequired,
    setTablePagination: PropTypes.func.isRequired,
    setTableFiltersExpanded: PropTypes.func.isRequired
  };

  onExternalLinkClick = url => {
    ipcRenderer.send('KB_URL', url);
    // shell.openExternal(url);
  }

  render() {
    let {
      classes,
      metadata,
      a11ymetadata,
      filters,
      pagination,
      sort,
      expandFilters,
      setTableSort,
      setTableFilterValues,
      setTablePagination,
      setTableFiltersExpanded} = this.props;

    let hasMissingOrEmpty = a11ymetadata.missing.length > 0 || a11ymetadata.empty.length > 0;
    let heads = [
      {
        id: 'name',
        label: localize("report.metadataSection.name"),
        numeric: false,
        sortable: true,
        filterOn: obj => obj,
        makeCell: (row, idx) =>
          <TableCell key={idx}>
            {row.name}
          </TableCell>
      },
      {
        id: 'value',
        label: localize("report.metadataSection.value"),
        numeric: false,
        sortable: false,
        makeCell: (row, idx) =>
          <TableCell key={idx}>{row.value instanceof Array ?
              <ul>{row.value.map((data, idx) => {
                return (
                  <li key={idx}>{data}</li>
                );
              })}
              </ul>
              : row.value}
          </TableCell>
      },
      {
        id: 'a11y',
        label: localize("report.metadataSection.a11y"),
        numeric: false,
        sortable: true,
        makeCell: (row, idx) =>
          <TableCell key={idx}>
            {row.a11y}
          </TableCell>
      }
    ];

    return (
      <section className="report-section metadata">
        <h2>{localize("report.metadata")}</h2>
        <EnhancedTable
          rows={metadata}
          heads={heads}
          id={'metadata'}
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

      <h2>{localize("report.metadataSection.missing")}</h2>
      {hasMissingOrEmpty ?
      <>
        <ul>
          {a11ymetadata.missing.map((data, idx) => {
            return (<li key={idx}>{data}</li>);
          })}
          {a11ymetadata.empty.map((data, idx) => {
            return (<li key={idx}>{data}</li>);
          })}
        </ul>
        <p><a className="external-link" onClick={() => this.onExternalLinkClick(`${KB_BASE}docs/metadata/schema-org.html`)}>{localize("report.violationsSection.learnAbout")} {localize("report.metadata")}</a></p>
      </>
        :
        <p>{localize("report.metadataSection.allPresent")}</p>
      }

      <hr/>
      <Button onClick={this.props.showMetadataEditor} className={classes.editButton}>
        {`${localize("metadata.edit")} ...`}
      </Button>

     </section>
    );
  }
}
function mapStateToProps(state) {
  let { app: {processing: {ace}, inputPath, reportPath, epubBaseDir} } = state;
  return {
    inputPath,
    reportPath,
    epubBaseDir,
    processing: ace,
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({showMetadataEditor}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Metadata));

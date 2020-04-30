import EnhancedTable from "./../Table/EnhancedTable";
import PropTypes from 'prop-types';
import React from 'react';
import TableCell from '@material-ui/core/TableCell';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import {showMetadataEditor} from './../../../shared/actions/metadata';
import {selectTab} from './../../../shared/actions/reportView';
import {zipEpub} from './../../../shared/actions/app';

import { localizer } from './../../../shared/l10n/localize';
const { localize } = localizer;

import a11yMetadata from '@daisy/ace-core/lib/core/a11y-metadata';

const {ipcRenderer} = require('electron');
import classNames from 'classnames';

import CircularProgress from '@material-ui/core/CircularProgress'

const styles = theme => ({

  buttonProcessing: {
    // position: 'absolute',
    // top: '50%',
    // left: '50%',
    // marginTop: -91,
    marginLeft: "0.5em",
    // height: 300,
    // zIndex: 1,
    color: '#22C7F0',
  },
  detailProcessing: {
    fontSize: "0.94em",
    fontFamily: "monospace",
    verticalAlign: "super",
    marginLeft: "1em",
  },
  editButton: {
    'font-size': '1em',
    'margin-bottom': '1em',
    'border': '2px solid silver',
    'border-radius': '4px',
  },
  kbLinkContainer: {
    'text-align': 'right',
    'display': 'block',
    'margin-right': '1em',
  },
  kbLink: {
    'margin-left': '1em',
  },
});

const KB_BASE = 'http://kb.daisy.org/publishing/';

// http://kb.daisy.org/publishing/docs/metadata/schema.org/index.html
// http://kb.daisy.org/publishing/docs/metadata/evaluation.html

const A11Y_META = a11yMetadata.A11Y_META;

// the metadata page of the report
class Metadata extends React.Component {

  static propTypes = {
    hasMetadataViolations: PropTypes.bool.isRequired,
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

  onKBSchemaOrg = () => {
    const url = `${KB_BASE}docs/metadata/schema.org/index.html`;
    ipcRenderer.send('KB_URL', url);
    // shell.openExternal(url);
  }
  onKBEvaluation = () => {
    const url = `${KB_BASE}docs/metadata/evaluation.html`;
    ipcRenderer.send('KB_URL', url);
    // shell.openExternal(url);
  }
  onKB = () => {
    this.onKBSchemaOrg();
    this.onKBEvaluation();
  }

  render() {
    let {
      hasMetadataViolations,
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

    // console.log("FILTERS metadata render: ", JSON.stringify(filters, null, 4));

    const showMetadataViolations = () => {
      // const stateTab = {
      //   reportView: {
      //     expandFilters: {
      //       violations: true,
      //     },
      //     filters: {
      //       violations: {
      //         rule: {
      //           values: [],
      //         },
      //       },
      //     },
      //   },
      // };
      setTableFiltersExpanded('violations', true);
      setTableFilterValues('violations', 'rule', '^metadata.*');

      setTimeout(() => {
        this.props.selectTab(1);
      }, 100);
    };
    const jsxZipProgress = () => {

      if (!this.props.processingZipEpub) {
        return (<></>);
      }
      // value={this.props.processingZipEpub.progressPercent}
      // variant={"determinate"}
      if (this.props.processingZipEpub.progressPercent) {
        if (this.props.processingZipEpub.progressFile) {
          return (<><CircularProgress size={28} className={classes.buttonProcessing}

          /><span className={classes.detailProcessing}><strong>{`${this.props.processingZipEpub.progressPercent.toFixed(2)}% `}</strong>{` ${this.props.processingZipEpub.progressFile}`}</span></>);
        } else {
          return (<><CircularProgress size={28} className={classes.buttonProcessing}

            /><span className={classes.detailProcessing}><strong>{`${this.props.processingZipEpub.progressPercent.toFixed(2)}%`}</strong></span></>);
        }
      } else if (this.props.processingZipEpub.progressFile) {
        return (<><CircularProgress size={28} className={classes.buttonProcessing}
        /><span className={classes.detailProcessing}>{`${this.props.processingZipEpub.progressFile}`}</span></>);
      } else {
        return (<CircularProgress size={28} className={classes.buttonProcessing}/>);
      }
    };

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
        <ul>
          {a11ymetadata.missing && a11ymetadata.missing.sort().map((data, idx) => {
            let suffix = "";
            if (data in A11Y_META) {
              if (A11Y_META[data].required || A11Y_META[data].recommended) {
                suffix = ` (${A11Y_META[data].required ? localize("report.summarySection.serious") : localize("report.summarySection.moderate")})`
              }
            }
            
            return (<li key={idx}>{data}{suffix}</li>);
          })}
          {a11ymetadata.empty && a11ymetadata.empty.sort().map((data, idx) => {
            let suffix = "";
            if (data in A11Y_META) {
              if (A11Y_META[data].required || A11Y_META[data].recommended) {
                suffix = ` (${A11Y_META[data].required ? localize("report.summarySection.serious") : localize("report.summarySection.moderate")})`
              }
            }
            
            return (<li key={idx}>{data}{suffix}</li>);
          })}
        </ul>
        :
        <p>{localize("report.metadataSection.allPresent")}</p>
      }
      <h2>{localize("report.violations")}</h2>
      {hasMetadataViolations ?
        <p>
          <span>{`[ ${localize("versionCheck.yes")} ]`}</span>
          <a
            href="#"
            tabIndex={0}
            className={classNames('external-link', classes.kbLink)}
            onKeyPress={(e) => { if (e.key === "Enter") { showMetadataViolations(); }}}
            onClick={() => { showMetadataViolations(); }}
            >{localize("menu.gotoViolations")}</a>
        </p>
        :
        <p>{localize("report.violationsSection.noViolations")}</p>
      }
      <div className={classNames(classes.kbLinkContainer)}>
        <span>{`${localize("menu.knowledgeBase")} (${localize("menu.help")}):`}</span>

        <a
            href="#"
            tabIndex={0}
            className={classNames('external-link', classes.kbLink)}
            onKeyPress={(e) => { if (e.key === "Enter") { this.onKBSchemaOrg(); }}}
            onClick={() => this.onKBSchemaOrg()}
            >{`#1`}</a>

        <a
            href="#"
            tabIndex={0}
            className={classNames('external-link', classes.kbLink)}
            onKeyPress={(e) => { if (e.key === "Enter") { this.onKBEvaluation(); }}}
            onClick={() => this.onKBEvaluation()}
            >{`#2`}</a>

      </div>
      <hr/>
      <Button onClick={this.props.showMetadataEditor}
        className={classes.editButton}>
        {`${localize("metadata.edit")} ...`}
      </Button>
      <Button onClick={this.props.zipEpub}
        style={{
          marginLeft: "1em",
        }}
        className={classes.editButton}>
        {`${localize("metadata.save")} (zip / EPUB)`}
      </Button>
      {
        jsxZipProgress()
      }
     </section>
    );
  }
}
function mapStateToProps(state) {
  let { app: {processing: {zipepub}, inputPath, reportPath, epubBaseDir} } = state;
  return {
    inputPath,
    reportPath,
    epubBaseDir,
    processingZipEpub: zipepub,
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({showMetadataEditor, selectTab, zipEpub }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Metadata));

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Metadata from './../../components/ReportSections/Metadata';
import * as ReportViewActions from './../../../shared/actions/reportView';

import { localizer } from './../../../shared/l10n/localize';
const { localize } = localizer;

const mapStateToProps = state => {
  let {app: {report}, reportView: {filters, sort, pagination, expandFilters}, preferences: {language}} = state;
  let rows = [];
  let metadata = report['earl:testSubject'].metadata;
  let links = report['earl:testSubject']['links'];
  let a11ymeta = report['a11y-metadata'];

  for (let key in metadata) {
    let a11y = a11ymeta.present.indexOf(key) != -1 ? localize("versionCheck.yes") : "";
    rows.push({"name": key, "value": metadata[key], "a11y": a11y});
  }

  // conformsTo lives in ['links'] so we have to add it separately to the table
  if (links) {
    if ('dcterms:conformsTo' in links) {
        let a11y = a11ymeta.present.indexOf("dcterms:conformsTo") != -1 ? localize("versionCheck.yes") : "";
        rows.push({
          "name": "dcterms:conformsTo",
          "value": links['dcterms:conformsTo'],
          "a11y": a11y
      });
    }
    if ('a11y:certifierReport' in links) {
        let a11y = a11ymeta.present.indexOf("a11y:certifierReport") != -1 ? localize("versionCheck.yes") : "";
        rows.push({
          "name": "a11y:certifierReport",
          "value": links['a11y:certifierReport'],
          "a11y": a11y
      });
    }
    if ('a11y:certifierCredential' in links) {
        let a11y = a11ymeta.present.indexOf("a11y:certifierCredential") != -1 ? localize("versionCheck.yes") : "";
        rows.push({
          "name": "a11y:certifierCredential",
          "value": links['a11y:certifierCredential'],
          "a11y": a11y
      });
    }
  }

  // see createFlatListOfViolations
  const hasMetadataViolations = report.assertions.find(assertion => assertion.assertions.find(item => /^metadata.*/.test(item["earl:test"]["dct:title"]))) ? true : false;
  return {
    hasMetadataViolations,
    language,
    metadata: rows,
    a11ymetadata: a11ymeta,
    filters: filters['metadata'],
    pagination: pagination['metadata'],
    sort: sort['metadata'],
    expandFilters: expandFilters['metadata']
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(ReportViewActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Metadata);

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Metadata from './../../components/ReportSections/Metadata';
import * as ReportViewActions from './../../../shared/actions/reportView';

const mapStateToProps = state => {
  let {app: {report}, reportView: {filters, sort, pagination, expandFilters}, preferences: {language}} = state;
  let rows = [];
  let metadata = report['earl:testSubject'].metadata;
  let links = report['earl:testSubject']['links'];
  let a11ymeta = report['a11y-metadata'];

  for (let key in metadata) {
    let a11y = a11ymeta.present.indexOf(key) != -1 ? "Yes" : "";
    rows.push({"name": key, "value": metadata[key], "a11y": a11y});
  }

  // conformsTo lives in ['links'] so we have to add it separately to the table
  if (links != undefined && links != {} && 'dcterms:conformsTo' in links) {
        let a11y = a11ymeta.present.indexOf(rows.name) != -1 ? "Yes" : "";
        rows.push({
          "name": "dcterms:conformsTo",
          "value": links['dcterms:conformsTo'],
          "a11y": a11y
      });
  }

  return {
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

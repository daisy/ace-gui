import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Metadata from './../../components/ReportSections/Metadata';
import * as ReportViewActions from './../../../shared/actions/reportView';

const mapStateToProps = state => {
  let {app: {report}, reportView: {filters, sort, pagination, expandFilters}} = state;
  let rows = [];
  let metadata = report['earl:testSubject'].metadata;
  let links = report['earl:testSubject']['links'];
  let a11ymeta = report['a11y-metadata'];

  for (let key in metadata) {
    rows.push({"name": key, "value": metadata[key]});
  }

  // conformsTo lives in ['links'] so we have to add it separately to the table
  if (links != undefined && links != {} && 'dcterms:conformsTo' in links) {
        rows.push({
          "name": "conformsTo",
          "value": links['dcterms:conformsTo']
      });
  }

  return {
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

import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import React from 'react';

import {localize} from './../../../shared/l10n/localize';

// the outlines page of the report
export default class Outlines extends React.Component {

  static propTypes = {
    outlines: PropTypes.object.isRequired
  };

  render() {
    let {outlines} = this.props;
    return (
      <section className="report-section outlines">
        <h2>{localize("report.outlines")}</h2>
        <Grid container spacing={24}>
          <Grid item xs>
            <h3>{localize("report.outlinesSection.toc")}</h3>
            <div dangerouslySetInnerHTML={createMarkup(outlines.toc)}/>
          </Grid>
          <Grid item xs>
            <h3>{localize("report.outlinesSection.headings")}</h3>
            <div dangerouslySetInnerHTML={createMarkup(outlines.headings)}/>
          </Grid>

          <Grid item xs>
            <h3>{localize("report.outlinesSection.html")}</h3>
            <div dangerouslySetInnerHTML={createMarkup(outlines.html)}/>
          </Grid>
        </Grid>
      </section>
    );
  }
}

function createMarkup(htmlString) {
  return {__html: htmlString};
}

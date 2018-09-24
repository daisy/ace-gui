import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import React from 'react';

// the outlines page of the report
export default class Outlines extends React.Component {

  static propTypes = {
    outlines: PropTypes.object.isRequired
  };

  render() {
    let {outlines} = this.props;
    return (
      <section className="report-section outlines">
        <h2>Outlines</h2>
        <Grid container spacing={24}>
          <Grid item xs>
            <h3>EPUB Table of Contents</h3>
            <div dangerouslySetInnerHTML={createMarkup(outlines.toc)}/>
          </Grid>
          <Grid item xs>
            <h3>Headings outline</h3>
            <div dangerouslySetInnerHTML={createMarkup(outlines.headings)}/>
          </Grid>

          <Grid item xs>
            <h3>HTML outline</h3>
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

import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

// the outlines section of the report
export default class Outlines extends React.Component {

  static propTypes = {
    data: PropTypes.object.isRequired
  };

  render() {
    console.log("rendering outlines");

    return (
      <section className="report-section outlines">
        <h2>Outlines</h2>
        <Grid container spacing={24}>
          <Grid item xs>
            <h3>EPUB Table of Contents</h3>
            <div dangerouslySetInnerHTML={createMarkup(this.props.data.toc)}/>
          </Grid>
          <Grid item xs>
            <h3>Headings outline</h3>
            <div dangerouslySetInnerHTML={createMarkup(this.props.data.headings)}/>
          </Grid>

          <Grid item xs>
            <h3>HTML outline</h3>
            <div dangerouslySetInnerHTML={createMarkup(this.props.data.html)}/>
          </Grid>
        </Grid>
      </section>
    );
  }
}

function createMarkup(htmlString) {
  return {__html: htmlString};
}

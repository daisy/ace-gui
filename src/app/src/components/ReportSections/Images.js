import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
const path = require('path');

// the images table in the report
export default class Images extends React.Component {

  static propTypes = {
    images: PropTypes.array.isRequired,
    reportFilepath: PropTypes.string.isRequired
  };

  render() {
  return (
      <section className="images">
        <h2>Violation Summary</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell><code>alt</code> attribute</TableCell>
              <TableCell><code>aria-describedby</code> content</TableCell>
              <TableCell>Associated <code>figcaption</code></TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.images.map((image, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell><img src={path.resolve(this.props.reportFilepath, `../data/${image.src}`)}/></TableCell>
                  <TableCell>{image.alt ? image.alt : "N/A"}</TableCell>
                  <TableCell>{image.describedby ? image.describedby : "N/A"}</TableCell>
                  <TableCell>{image.figcaption ? image.figcaption : "N/A"}</TableCell>
                  <TableCell className="location"><pre>{image.location}</pre></TableCell>
                  <TableCell>{image.role ? image.role : "N/A"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>
    );
  }
}

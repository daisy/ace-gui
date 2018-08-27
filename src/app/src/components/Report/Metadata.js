import React from 'react';
const ReactDataGrid = require('react-data-grid');

import './../../styles/Report.scss';

// expects
// data: {metadata: obj, conformsTo: string, a11ymeta: []}
export default class Metadata extends React.Component {
  constructor(props) {
    super(props);

    this._columns = [
      {
        key: 'name',
        name: 'Name',
      },
      {
        key: 'value',
        name: 'Value',
      }
    ];
    this._rows = [];
    for (var key in this.props.data) {
      this._rows.push(Object.assign({}, {'name': key}, this.props.data[key]));
    }
    if (this.props.conformsTo != '') this._rows.push(Object.assign({}, {'name': 'conformsTo'}, this.props.conformsTo));

    this.rowGetter = this.rowGetter.bind(this);

  }

  rowGetter(i) {
    if (this._rows.length > 0) return this._rows[i];
    return null;
  }

  render() {
    console.log("rendering metadata");
    let reportStr = JSON.stringify(this.props.data, null, '  ');

    let a11ymetadata;
    return (
      <section className="metadata">
        <h2>Metadata</h2>

        <ReactDataGrid
          columns={this._columns}
          rowGetter={this.rowGetter}
          rowsCount={this._rows.length}
          minHeight={500} />

     <h2 id="a11y-metadata">Accessibility Metadata</h2>

     </section>
     /*
     {{#if a11y-metadata.present}}
       <p>The following accessibility metadata is present:
       {{#each a11y-metadata.present}}
         <span class="metadata-name">{{this}}</span>
       {{/each}}
       </p>
     {{else}}
       <p>No accessibility metadata was found.</p>
     {{/if}}

     {{!-- a little messy because handlebars templates have no logical operators --}}
     {{#if a11y-metadata.missing }}
       <p>The following accessibility metadata is missing:
       {{#each a11y-metadata.missing}}
<span class="metadata-name">{{this}}</span>
       {{/each}}
       {{#each a11y-metadata.empty}}
         <span class="metadata-name">{{this}}</span>
       {{/each}}
       .
       </p>
     {{else}}
       {{#if a11y-metadata.empty}}
         <p>The following accessibility metadata is missing:
           {{#each a11y-metadata.missing}}
             <span class="metadata-name">{{this}}</span>
           {{/each}}
           .
         </p>
       {{/if}}
     {{/if}}
     <p class="pagenav">Go to <a href="#metadata">Top of section</a> | <a href="#navlist">Page navigation</a></p>
   </div>
*/
    );
  }
}

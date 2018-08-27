import React from 'react';
import ReactDataGrid from 'react-data-grid';
import './../../styles/Report.scss';

class RuleFormatter extends React.Component {
  render() {
    return (
      <div>
        <p>{this.props.value.rule}</p>
        <p>{this.props.value.engine}</p>
      </div>
    );
  }
}

class LocationFormatter extends React.Component {
  render() {
    return (
      <div>
      <p><code>{this.props.value.filename}</code></p>
      <p>Snippet:</p>
      <p><code>{this.props.value.html}</code></p>
      </div>
    );
  }
}

class DetailsFormatter extends React.Component {
  render() {
    let lis = [];
    for (let i in this.props.value.desc) {
      lis.push(<li>{this.props.value.desc[i]}</li>);
    }
    return (
      <div>
      <ul>{lis}</ul>
      <p><a href={this.props.value.kburl}>Learn more about {this.props.value.kbtitle}</a></p>
      </div>
    );
  }
}

export default class ViolationTable extends React.Component {
  constructor(props) {
    super(props);
    this.setupTable();
  }
  setupTable() {
    let data = this.createFlatListOfViolations(this.props.data);
    this._columns = [
      {
        key: 'impact',
        name: 'Impact'
      },
      {
        key: 'ruleset',
        name: 'Ruleset'
      },
      {
        key: 'rule',
        name: 'Rule',
        formatter: RuleFormatter
      },
      {
        key: 'location',
        name: 'Location',
        formatter: LocationFormatter
      },
      {
        key: 'details',
        name: 'Details',
        formatter: DetailsFormatter
      }
    ];
    this._rows = data;
    this.rowGetter = this.rowGetter.bind(this);

  }

  rowGetter(i) {
    if (this._rows.length > 0) return this._rows[i];
    return null;
  }

  render() {
    console.log("rendering violation table");



    return (
      <section className="violation-table">
        <h2>Violations</h2>
        <ReactDataGrid
          columns={this._columns}
          rowGetter={this.rowGetter}
          rowsCount={this._rows.length}
          minHeight={500} />
      </section>
    );
  }

  // copied from https://github.com/daisy/ace/blob/master/packages/ace-report/src/generate-html-report.js#L172
  // TODO reduce duplication of code
  createFlatListOfViolations(violations) {
    let flatData = [];
    let rulesetTags = ['wcag2a', 'wcag2aa', 'EPUB', 'best-practice']; // applicable ruleset tags

    violations.forEach(function(assertion) {
      let filename = assertion["earl:testSubject"]["url"];
      let filetitle = assertion["earl:testSubject"]["dct:title"];
      assertion.assertions.forEach(function(item) {
        // each item may have multiple ruleset tags from the underlying html checker
        // narrow it down to one, from our list above, or label as 'other'
        let applicableRulesetTag = "other";
        item["earl:test"]["rulesetTags"].forEach(function(tag) {
          if (rulesetTags.indexOf(tag) != -1) {
            applicableRulesetTag = tag;
          }
        });
        let cfi = item["earl:result"]["earl:pointer"] ?
          `#epubcfi(${item["earl:result"]["earl:pointer"]["cfi"]})` : '';
        let html = item["earl:result"]["html"] ? escape(item["earl:result"]["html"]) : '';
        let desc = escape(item["earl:result"]["dct:description"]);

        let obj = {
          "impact": item["earl:test"]["earl:impact"],
          "rulesetTag": applicableRulesetTag,
          "rule": {
            "rule": item["earl:test"]["dct:title"],
            "engine": item["earl:assertedBy"]
          },
          "location": {
            "filename": `${filename}${cfi}`,
            "snippet": html
          },
          "details": {
            "kburl": item["earl:test"]["help"]["url"],
            "kbtitle": item["earl:test"]["help"]["dct:title"],
            "desc": desc.split("\n").filter(s => s.trim().length > 0)
          }
        };

        flatData.push(obj);
      });
    });
    return flatData;
  }
}

import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core';
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
    this.state = {
      rows: this.createFlatListOfViolations(this.props.data)
    };

  }

  render() {

    return (
      <section className="violation-table">
        <h2>Violations</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Impact</TableCell>
              <TableCell>Ruleset</TableCell>
              <TableCell>Rule</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.rows.map((row, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell component="th" scope="row">{row.impact}</TableCell>
                  <TableCell>{row.rulesetTag}</TableCell>
                  <TableCell>
                    <p>{row.rule.rule}</p>
                    <p>{row.rule.engine}</p>
                  </TableCell>
                  <TableCell>
                    <p><code>{row.location.filename}</code></p>
                    <p>Snippet:</p>
                    <p><code>{row.location.html}</code></p>
                  </TableCell>
                  <TableCell>
                    <ul>
                      {row.details.desc.map((txt, idx) => {
                          return (
                            <li key={idx}>{txt}</li>
                          );
                      })}
                    </ul>
                    <p><a href={row.kburl}>Learn more about {row.kbtitle}</a></p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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

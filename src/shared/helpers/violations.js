module.exports = {

  createFlatListOfViolations: function(assertions) {
    return createFlatListOfViolations(assertions);
  },

  summarizeViolations: function(assertions) {
    let flatList = createFlatListOfViolations(assertions);
    return collectViolationStats(flatList);
  },
};

// to support older Ace reports without a separate summary section
// summarize the violation ruleset and impact data
// copied and slightly modified from https://github.com/daisy/ace/blob/master/packages/ace-report/src/generate-html-report.js#L112
function collectViolationStats(flatListOfViolations) {
  var rulesetTags = ['wcag2a', 'wcag2aa', 'EPUB', 'best-practice'];

  var summaryData = {
    'wcag2a': {'critical': 0, 'serious': 0, 'moderate': 0, 'minor': 0, 'total': 0},
    'wcag2aa': {'critical': 0, 'serious': 0, 'moderate': 0, 'minor': 0, 'total': 0},
    'EPUB': {'critical': 0, 'serious': 0, 'moderate': 0, 'minor': 0, 'total': 0},
    'best-practice': {'critical': 0, 'serious': 0, 'moderate': 0, 'minor': 0, 'total': 0},
    'other': {'critical': 0, 'serious': 0, 'moderate': 0, 'minor': 0, 'total': 0},
    'total': {'critical': 0, 'serious': 0, 'moderate': 0, 'minor': 0, 'total': 0}
  };

  flatListOfViolations.forEach(function(item) {
    if (rulesetTags.includes(item.rulesetTag)){
      summaryData[item.rulesetTag][item.impact] += 1;
      summaryData[item.rulesetTag]['total'] += 1;
    }
    else {
      summaryData['other'][item.impact] += 1;
      summaryData['other']['total'] += 1;
    }
  });

  Object.keys(summaryData['total']).forEach(function(key) {
    summaryData['total'][key] += summaryData['wcag2a'][key]
      + summaryData['wcag2aa'][key]
      + summaryData['EPUB'][key]
      + summaryData['best-practice'][key]
      + summaryData['other'][key];
  });

  return summaryData;
}

// a flat list is easier to work with regarding visual presentation
function createFlatListOfViolations(violations) {
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
      let cfi = '';
      if (item["earl:result"]["earl:pointer"]) {
        let singleCfi = item["earl:result"]["earl:pointer"]["cfi"];
        if (Array.isArray(singleCfi)) { // this should always be true (same with ["earl:result"]["earl:pointer"]["css"])
          singleCfi = singleCfi[0];
        }
        cfi = `#epubcfi(${singleCfi})`;
      }
      
      let html = item["earl:result"]["html"] ? escape(item["earl:result"]["html"]) : '';
      let desc = item["earl:result"]["dct:description"];
      desc = desc.replace("Fix all of the following:", "");
      desc = desc.replace("Fix any of the following:", "");

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

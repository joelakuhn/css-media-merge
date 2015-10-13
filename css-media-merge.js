var cssParse = require('css-parse');
var fs = require('fs');

function InMemoryAcc () {
  this.push = (s) => this.stack.push(s + "\n");
  this.stack = [];
  this.get = () => this.stack.join('');
}

function printRule(rule, acc) {
  if (rule instanceof Array) {
    for (var i=0; i<rule.length; i++) {
      printRule(rule[i], acc);
    }
  }
  else if (rule.type == 'comment') {
    acc.push('/*' + rule.comment + '*/');
  }
  else if (rule.type == 'rule') {
    acc.push(rule.selectors + '{');
    printRule(rule.declarations, acc);
    acc.push('}')
  }
  else if (rule.type == 'declaration') {
    acc.push(rule.property + ':' + rule.value + ';');
  }
  else if (rule.type == 'media') {
    acc.push('@media' + rule.media + '{');
    printRule(rule.rules, acc);
    acc.push('}');
  }
}

function merge_media(medias) {
  var media = medias[0];
  for (var i=1; i<medias.length; i++) {
    media.rules.push(medias[i].rules);
  }
  return media;
}

function merge_file(file) {
  var file_contents = fs.readFileSync(file);
  return merge(file_contents.toString())
}

function merge(css) {
  var parsed = cssParse(css);
  var rules = parsed.stylesheet.rules;
  var media = rules.filter((rule) => rule.type == 'media');
  var non_media = rules.filter((rule) => rule.type != 'media');

  var mediaGrouped = {};
  media.forEach(function(rule) {
    var key = rule.media.replace(/\s+/g, ' ');
    if (!mediaGrouped[key]) mediaGrouped[key] = [];
    mediaGrouped[key].push(rule);
  });

  var merged = [];
  for (var key in mediaGrouped) {
    merged.push(merge_media(mediaGrouped[key]));
  }

  var acc = new InMemoryAcc();
  printRule(non_media, acc);
  printRule(merged, acc);

  return acc.get();
}

module.exports = {
  mergeFile: merge_file,
  merge: merge
};

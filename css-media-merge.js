var cssParse = require('css-parse');
var fs = require('fs');

function printRule(rule) {
  if (rule instanceof Array) {
    for (var i=0; i<rule.length; i++) {
      printRule(rule[i]);
    }
  }
  else if (rule.type == 'comment') {
    console.log('/*' + rule.comment + '*/');
  }
  else if (rule.type == 'rule') {
    console.log(rule.selectors + '{');
    printRule(rule.declarations);
    console.log('}')
  }
  else if (rule.type == 'declaration') {
    console.log(rule.property + ':' + rule.value + ';');
  }
  else if (rule.type == 'media') {
    console.log('@media' + rule.media + '{');
    printRule(rule.rules);
    console.log('}');
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
  merge(file_contents.toString())
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

  printRule(non_media);
  printRule(merged);
}

merge_file('style.css');

module.exports = {
  mergeFile: merge_file,
  merge: merge
};
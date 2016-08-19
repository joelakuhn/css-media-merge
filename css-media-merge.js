var cssParse = require('css-parse');
var fs = require('fs');

function InMemoryAcc () {
  this.push = (s) => this.stack.push(s + "\n");
  this.stack = [];
  this.get = () => this.stack.join('');
}

function printRule(rule, acc, indent) {
  if (typeof indent == 'undefined') indent = '';
  if (rule instanceof Array) {
    for (var i=0; i<rule.length; i++) {
      printRule(rule[i], acc, indent);
    }
  }
  else if (rule.type == 'comment') {
    acc.push(indent + '/*' + rule.comment + '*/');
  }
  else if (rule.type == 'rule') {
    acc.push(indent + rule.selectors + '{');
    printRule(rule.declarations, acc, indent + '  ');
    acc.push(indent + '}')
  }
  else if (rule.type == 'declaration') {
    acc.push(indent + rule.property + ':' + rule.value + ';');
  }
  else if (rule.type == 'media') {
    acc.push(indent + '@media' + rule.media + '{');
    printRule(rule.rules, acc, indent + '  ');
    acc.push(indent + '}');
  }
}

function merge_media(medias) {
  var media = medias[0];
  for (var i=1; i<medias.length; i++) {
    media.rules.push(medias[i].rules);
  }
  return media;
}

function merge_file(file, options) {
  var file_contents = fs.readFileSync(file);
  return merge(file_contents.toString(), options)
}

function get_media_size(media_spec) {
  var max_match = media_spec.match(/max-width:\s*(\d+)px/);
  if (max_match) return max_match[1];
  var min_match = media_spec.match(/min-width:\s*(\d+)px/);
  if (min_match) return min_match[1];
  return 0;
}

function merge(css, options) {
  options = options || {};
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

  if (options.mobile_first) {
    merged.sort(function(a, b) {
      return get_media_size(a.media) < get_media_size(b.media)
    });
  }
  else {
    merged.sort(function(a, b) {
      return get_media_size(a.media) > get_media_size(b.media)
    });
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

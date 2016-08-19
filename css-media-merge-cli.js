#!/usr/bin/env node

var cmm = require('./css-media-merge.js');

var args = process.argv.slice(2);

var options = {
	mobile_first: false
};

var inFile = null;



for (var i=0; i<args.length; i++) {
	if (args[i] == '--mobile-first') {
		options.mobile_first = true;
	}
	else {
		inFile = args[i];
	}
}



if (inFile) {
	var merged = cmm.mergeFile('./test-css.css', options);
	console.log(merged);
}
else {
	process.stdin.on('readable', function() {
		var stdintext = '';

		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function(data) {
			stdintext += data;
		});
		process.stdin.on('end', function(data) {
			console.log(cmm.merge(stdintext, options));
		});
	});
}

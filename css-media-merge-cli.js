#!/usr/bin/env node

var cmm = require('./css-media-merge.js');

var args = process.argv.slice(2);

var options = {
	mobile_first: false
};

var inFile = null;


function show_help() {
	console.log('usage: ' + "\n" +
							'    css-media-merge [--mobile-first] <file>' + "\n" +
							'    css-media-merge [--mobile-first] < <file>' + "\n");
}


for (var i=0; i<args.length; i++) {
	if (args[i] == '--mobile-first') {
		options.mobile_first = true;
	}
	if (args[i] == '--help' || args[i] == '-h') {
		show_help();
		process.exit();
	}
	else {
		inFile = args[i];
	}
}



if (inFile) {
	var merged = cmm.mergeFile(inFile, options);
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

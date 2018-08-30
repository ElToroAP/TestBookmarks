#! /usr/bin/env node
"use strict";

// Requires
const fs = require('fs');

var bmChrome = {};

function chromeBookmarkProcessChildren(node, path) {
	var thisPath;
	
	if (node.name == "Bookmarks bar") {
		thisPath = "[BAR]";
	} else {
		thisPath = path + "[" + node.name + "]";
	}
	if (node.url) {
		bmChrome[thisPath] = node.url;
	}
	if (node.children) {
		for (var i = 0; i < node.children.length; i++) {
			chromeBookmarkProcessChildren(node.children[i], thisPath);
		}
	}	
}
function chromeBookmark() {
	var fileContents = loadJsonFile("./bmChrome.json");
	chromeBookmarkProcessChildren(fileContents["roots"]["bookmark_bar"], "");
	console.log(bmChrome);
}
function loadJsonFile(path) {
	var stats;
	var hasErrors = false;
	try {
		stats = fs.statSync(path);
		hasErrors = (stats.size == 0);
	} catch (ex) {
		log.debug("Error checking file: " + log.getPrettyJson(ex));
		hasErrors = true;
	}

	if (hasErrors) {
		try {
			fs.writeFileSync(path, '{}');
		} catch (ex) {
			log.error("Error creating file: " + path);
		}
	}

	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

ChromeBookmark();
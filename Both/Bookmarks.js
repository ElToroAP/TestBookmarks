#! /usr/bin/env node
"use strict";

// Requires
const fs = require('fs');

// Paths
const bmChromePath = "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Bookmarks";
const bmFirefoxPath = ["C:\\Users\\Admin\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\","*.default","places.sqlite"];

var bm = {};

function parseChromeBookmarksProcessChildren(node, path) {
	var thisPath;
	
	if (node.name == "Bookmarks bar") {
		thisPath = "[BAR]";
	} else {
		thisPath = path + "[" + node.name + "]";
	}
	if (node.url) {
		bm.Chrome[thisPath] = node.url;
	}
	if (node.children) {
		for (var i = 0; i < node.children.length; i++) {
			parseChromeBookmarksProcessChildren(
				node.children[i], thisPath);
		}
	}	
}
function parseChromeBookmarks(data) {
	bm.Chrome = {};
	parseChromeBookmarksProcessChildren(
		data["roots"]["bookmark_bar"], "");
}
function parseFirefoxBookmarks() {
	var tmp = {};
	var record = {};
	var sqlitepath = "";

	tmp.TitlesByRow = {};
	tmp.TitlesByName = {};
	tmp.URLs = {};
	
	// Find sqlite path
	sqlitepath = bmFirefoxPath[0];
	var files = fs.readdirSync();
	if (files.length == 1) {
		sqlitepath += "\\" + files[0] + bmFirefoxPath[2];
		console.log("Path: sqlitepath");
	} else {
		throw new Error("Multiple profiles for Firefox found");
	}
	/*
	fs.readdirSync(bmFirefoxPath[0]).forEach(function(file) {

	});
	
	
	// Execute sqlite3 to get data
	
	// Process results
	var lineReader = require('readline').createInterface({
	  input: require('fs').createReadStream('./bmFF_LINE.txt')
	});

	lineReader.on('line', function (line) {
		if (line == "") {
			if (record.bTitle == "Bookmarks Toolbar") {
				record.bTitle = "BAR";
			}
			if (tmp.TitlesByRow[record.id]) {
				throw new Error("Record already defined");
			} else {
				tmp.TitlesByRow[record.id] = "";
			}
			if (record.url) tmp.URLs[record.id] = record.url;
			if (record.bTitle) {
				var title = "";
				if (record.parent) {
					title = tmp.TitlesByRow[record.parent];
				}
				title += "[" + record.bTitle + "]";
				if (tmp.TitlesByName[title]) {
					throw new Error("Duplicate record: [" + record.bTitle + "]");
				}
				tmp.TitlesByRow[record.id] = title;
				tmp.TitlesByName[title] = record.id;
			}
			
			record = {};
		} else {
			var parts = line.split('=');
			record[parts[0].trim()] = parts[1].trim();
		}
	});
	
	lineReader.on('close', function () {
		// Merge the data
		bm.FF = {};
		for (var path in tmp.TitlesByName) {
			if (tmp.TitlesByName.hasOwnProperty(path)) {
				var rowId = tmp.TitlesByName[path];
				var url = tmp.URLs[rowId];
				if (url) {
					bm.FF[path] = url;
				}
			}
		}

		console.log(bm);
		console.log("X");
	});
	*/
	
}



// This method already exist in the merged code.
function loadFileJson(path) {
	return JSON.parse(loadFile(path));
}
function loadFile(path) {
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

	return fs.readFileSync(path, 'utf8');
}
parseChromeBookmarks(loadFileJson(bmChromePath));
parseFirefoxBookmarks();

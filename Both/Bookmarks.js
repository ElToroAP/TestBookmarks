#! /usr/bin/env node
"use strict";

// Requires
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

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
	// open the database
	let db = new sqlite3.Database('./places.sqlite');
	let sql = `SELECT b.id, b.parent, b.title as bTitle, p.title as pTitle, p.url
	           FROM moz_bookmarks AS b LEFT JOIN moz_places AS p ON b.fk = p.id
	           ORDER BY b.id`;

	db.all(sql, [], (err, rows) => {
		var tmp = {};
		tmp.TitlesByRow = {};
		tmp.TitlesByName = {};
		tmp.URLs = {};

		if (err) throw err;
	
		// Process each record
		rows.forEach((row) => {
			if (row.bTitle == "Bookmarks Toolbar") {
				row.bTitle = "BAR";
			}
			if (tmp.TitlesByRow[row.id]) {
				throw new Error("Row already defined");
			} else {
				tmp.TitlesByRow[row.id] = "";
			}
			if (row.url) tmp.URLs[row.id] = row.url;
			if (row.bTitle) {
				var title = "";
				if (row.parent) {
					title = tmp.TitlesByRow[row.parent];
				}
				title += "[" + row.bTitle + "]";
				if (tmp.TitlesByName[title]) {
					throw new Error("Duplicate row: [" + row.bTitle + "]");
				}
				tmp.TitlesByRow[row.id] = title;
				tmp.TitlesByName[title] = row.id;
			}
		});
	
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
	});

	// close the database connection
	db.close();
}



// This method already exist in the merged code.
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
parseChromeBookmarks(loadJsonFile("./bmChrome.json"));
parseFirefoxBookmarks();


















































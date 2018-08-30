#! /usr/bin/env node
"use strict";

const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./places.sqlite');
let sql = `SELECT b.id, b.parent, b.title as bTitle, p.title as pTitle, p.url
           FROM moz_bookmarks AS b LEFT JOIN moz_places AS p ON b.fk = p.id
           ORDER BY b.id`;

var bmFF = {};

db.all(sql, [], (err, rows) => {
	var tmp = {};
	tmp.TitlesByRow = {};
	tmp.TitlesByName = {};
	tmp.URLs = {};

	if (err) {
		throw err;
	}
	
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
	bmFF = {};
	for (var path in tmp.TitlesByName) {
		if (tmp.TitlesByName.hasOwnProperty(path)) {
			var rowId = tmp.TitlesByName[path];
			var url = tmp.URLs[rowId];
			if (url) {
				bmFF[path] = url;				
			}
		}
	}
	
	console.log(bmFF);
});

// close the database connection
db.close();
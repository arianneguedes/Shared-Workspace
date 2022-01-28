// Name: Course Project - Coworking Registry
// Program: Software Development Diploma
// Course Code: SODV1201 - Introduction to Web Programming
// Authors: Arianne Hoffschneider Guedes Gayer and Jorge Eduardo Schmitt Gayer
// Student IDs: 425002 and 424267

// This module starts the connection with the local database 4work.db
var sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("./4work.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log(
    "I'm connected to 4work database and I can read and write from this db"
  );
});

module.exports = db;
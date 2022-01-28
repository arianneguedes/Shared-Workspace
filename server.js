// Name: Course Project - Coworking Registry
// Program: Software Development Diploma
// Course Code: SODV1201 - Introduction to Web Programming
// Authors: Arianne Hoffschneider Guedes Gayer and Jorge Eduardo Schmitt Gayer
// Student IDs: 425002 and 424267

//---------------------------------------------------------------------
// This module is the main server. It is used to connect to the 3000
// port and perform database changes depending on the address accessed.
//---------------------------------------------------------------------

//-------------------- Addresses Table ------------------------
// http://localhost:3000 - Redirect to Index.html when accessed
//-------------------------------------------------------------

// -------------------------- METHOD: GET -------------------------------

// http://localhost:3000/4work/types - Bring a list of all types recorded
// in the database

// http://localhost:3000/4work/types/id - Bring 1 type record from the
// database based on the id informed

// http://localhost:3000/4work/amenities - Bring a list with all amenities
// found on the database amenities table

// http://localhost:3000/4work/workspaces - Bring a list with all the
// workspaces on the database workspaces table

// http://localhost:3000/4work/workspaces/id - Bring 1 type record from the
// database based on the id informed

// http://localhost:3000/4work/workspaces/amenities/id - Bring a list of
// amenities from the database based on the workspace informed

// http://localhost:3000/4work/users/username - Bring 1 record from the
// database from the users table based on the username informed

// http://localhost:3000/4work/lastid - Check on the database what was
// the last workspace id created

//------------------------------------------------------------------------

// -------------------------- METHOD: POST -------------------------------

// http://localhost:3000/filter/sorting option - Bring a list with records
// from the database that matches the filter selected also ordered by the
// sorting option selected

// http://localhost:3000/4work/workspaces/ - Create a new workspace record
// on the database based on the request.body

// http://localhost:3000/workspace/amenities/id - Insert into the table
// workspace_amenities all the amenities associated with an specific
// workspace id

//-------------------------------------------------------------------------

// -------------------------- METHOD: PATCH -------------------------------

// http://localhost:3000/4work/workspace/id - update 1 workspace record
// on the database based on the fields informed on the request.body

//-------------------------------------------------------------------------

// -------------------------- METHOD: DELETE ------------------------------

// http://localhost:3000/deletews/id - Delete an specific workspace from
// the database

// http://localhost:3000/workspace/amenities/id - Delete all amenities
// associated with an specific workspace from the database

//-------------------------------------------------------------------------

var db = require("./database.js");
var express = require("express");
const { response } = require("express");

var app = express();

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// http://localhost:3000 - Redirect to Index.html when accessed
var server = app.listen(3000, () => {
  console.log("the server is listening on port " + server.address().port);
});

//-----------------------------------------------------------------------
// METHOD: GET
// http://localhost:3000/4work/types - Bring a list of all types recorded
// in the database
//-----------------------------------------------------------------------
app.get("/4work/types", function (req, res) {
  db.all("SELECT * from types order by id", function (err, rows) {
    if (err) {
      res.status(404).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

//--------------------------------------------------------------------
// METHOD: GET
// http://localhost:3000/4work/types/id - Bring 1 type record from the
// database based on the id informed
//--------------------------------------------------------------------
app.get("/4work/types/:id", (req, res) => {
  var params = [req.params.id];
  db.get("select * from Types where id = ?", params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Success", data: row });
  });
});

//------------------------------------------------------------------------
// METHOD: GET
// http://localhost:3000/4work/amenities - Bring a list with all amenities
// found on the database amenities table
//------------------------------------------------------------------------
app.get("/4work/amenities", function (req, res) {
  db.all("SELECT * from Amenities order by id ", function (err, rows) {
    if (err) {
      res.status(404).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

//----------------------------------------------------------------------
// METHOD: GET
// http://localhost:3000/4work/workspaces - Bring a list with all the
// workspaces on the database workspaces table
//----------------------------------------------------------------------
app.get("/4work/workspaces", function (req, res) {
  db.all("SELECT * from workspaces order by id ", function (err, rows) {
    if (err) {
      res.status(404).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Generic function to determine the query that will be used for sorting based on the sorting field selected by the user
function defineLocalSql(sorting) {
  if (sorting == "amenities") {
    return " SELECT w.*, count(wa.amenitieid) amCount from workspaces w left join workspace_amenities wa on w.id = wa.workspaceid ";
  } else {
    return " SELECT * from workspaces ";
  }
}

// Generic function to insert the sorting clause on the SQL based on the sort option
function defineSorting(sorting) {
  if (sorting == "amenities") {
    return " group by id order by amCount desc";
  } else {
    return " order by " + sorting;
  }
}

//------------------------------------------------------------------------
// METHOD: POST
// http://localhost:3000/filter/sorting option - Bring a list with records
// from the database that matches the filter selected also ordered by the
// sorting option selected
//------------------------------------------------------------------------
app.post("/4work/filter/:sorting", function (req, res) {
  var localFilter = req.body;
  var localWhere = "";
  var sortingOption = req.params.sorting;
  var localSql = defineLocalSql(sortingOption);
  var concat = "";

  // i controls if it is the first loop. In this case, concat needs to
  // be empty because it has already a Where
  var i = 0;
  localFilter.forEach((element) => {
    if (element != "") {
      if (i != 0 && element.length < 50) concat = " or ";
      else if (i != 0 && element.length > 50) concat = " and ";
      else concat = "";
      localWhere += concat + element;
      i = 1;
    }
  });
  if (localWhere.length > 1) localWhere = " where " + localWhere;

  console.log(localSql + localWhere + defineSorting(sortingOption));

  db.all(
    localSql + localWhere + defineSorting(sortingOption),
    function (err, rows) {
      if (err) {
        res.status(404).json({ error: err.message });
        return;
      }
      console.log(rows);
      res.json(rows);
    }
  );
});

//-------------------------------------------------------------------------
// METHOD: GET
// http://localhost:3000/4work/workspaces/id - Bring 1 type record from the
// database based on the id informed
//-------------------------------------------------------------------------
app.get("/4work/workspaces/:id", function (req, res) {
  db.all(
    "SELECT * from workspaces where id =" + req.params.id,
    function (err, rows) {
      if (err) {
        res.status(404).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

//-----------------------------------------------------------------------
// METHOD: GET
// http://localhost:3000/4work/workspaces/amenities/id - Bring a list of
// amenities from the database based on the workspace informed
//-----------------------------------------------------------------------
app.get("/4work/workspaces/amenities/:id", function (req, res) {
  db.all(
    "SELECT * from workspace_Amenities wa, amenities a  where  wa.amenitieid = a.id and  workspaceid=" +
      [req.params.id],
    function (err, rows) {
      if (err) {
        res.status(404).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

//----------------------------------------------------------------------
// METHOD: GET
// http://localhost:3000/4work/users/username - Bring 1 record from the
// database from the users table based on the username informed
//----------------------------------------------------------------------
app.get("/4work/users/:username", (req, res) => {
  var params = [req.params.username];
  //db.get("select * from users where user = 'admin'", (err, row) => {
  db.get("select * from users where user = ?", params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Success", data: row });
  });
});

//------------------------------------------------------------------------
// METHOD: POST
// http://localhost:3000/4work/workspaces/ - Create a new workspace record
// on the database based on the request.body
//------------------------------------------------------------------------
app.post("/4work/workspace/", (req, res) => {
  var errors = [];
  console.log("start post");
  console.log(req.body.name);
  var data = {
    name: req.body.name,
    description: req.body.description,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    neighborhood: req.body.neighborhood,
    email: req.body.email,
    price: req.body.price,
    available: req.body.available,
    seatcapacity: req.body.seatcapacity,
    typeid: req.body.typeid,
    typedescription: req.body.typedescription,
  };
  var params = [
    req.body.name,
    req.body.description,
    req.body.latitude,
    req.body.longitude,
    req.body.neighborhood,
    req.body.email,
    req.body.price,
    req.body.available,
    req.body.seatcapacity,
    req.body.typeid,
    req.body.typedescription,
  ];
  console.log("mydata " + JSON.stringify(data));
  db.run(
    "insert into workspaces ( name, description, latitude, longitude, neighborhood, email, price, available, seatcapacity, typeid, typedescription) values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    params,
    function (err, response) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        data: response,
      });
    }
  );
});

//---------------------------------------------------------------------
// METHOD: PATCH
// http://localhost:3000/4work/workspace/id - Update 1 workspace record
// on the database based on the fields informed on the request.body
//---------------------------------------------------------------------
app.patch("/4work/workspace/:id", (req, res) => {
  var errors = [];
  console.log("start patch");
  var data = {
    name: req.body.name,
    description: req.body.description,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    neighborhood: req.body.neighborhood,
    email: req.body.email,
    price: req.body.price,
    available: req.body.available,
    seatcapacity: req.body.seatcapacity,
    typeid: req.body.typeid,
    typedescription: req.body.typedescription,
  };
  var params = [
    req.body.name,
    req.body.description,
    req.body.latitude,
    req.body.longitude,
    req.body.neighborhood,
    req.body.email,
    req.body.price,
    req.body.available,
    req.body.seatcapacity,
    req.body.typeid,
    req.body.typedescription,
  ];
  db.run(
    "update workspaces set name = '" +
      data.name +
      "',  description = '" +
      data.description +
      "', latitude = " +
      data.latitude +
      ", longitude = " +
      data.longitude +
      ", neighborhood = '" +
      data.neighborhood +
      "', email = '" +
      data.email +
      "', price = " +
      data.price +
      ", available = " +
      data.available +
      ", seatcapacity= " +
      data.seatcapacity +
      ", typeid = " +
      data.typeid +
      " , typedescription = '" +
      data.typedescription +
      "' where id = " +
      req.params.id,
    function (err, response) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        data: response,
      });
    }
  );
});

//---------------------------------------------------------------------
// METHOD: DELETE
// http://localhost:3000/workspace/amenities/id - delete all amenities
// associated with an specific workspace from the database
//---------------------------------------------------------------------
app.delete("/4work/workspace/amenities/:id", (req, res, next) => {
  console.log("start to delete workspace's amenities");
  // After insert workspace, delete all the amenities from this workspace and include it again
  const sql =
    "delete from workspace_amenities where workspaceid = " + req.params.id;
  console.log("Server to delete amenities: " + sql);
  db.run(sql, function (err, response) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Deleted successfully", changes: this.changes });
  });
});

//----------------------------------------------------------------------
// METHOD: POST
// http://localhost:3000/workspace/amenities/id - Insert into the table
// workspace_amenities all the amenities associated with an specific
// workspace id
//----------------------------------------------------------------------
app.post("/4work/workspace/amenities/:id", (req, res) => {
  console.log("Add ws amenities ");
  console.log(req.body.amenities);
  var iCount = 0;
  var sComma = "";
  var localSQL =
    "insert into workspace_amenities ( workspaceid, amenitieid) values";
  req.body.amenities.forEach((element) => {
    // After the amenities for this workspace were deleted, add the new amenities
    sComma = iCount > 0 ? "," : "";
    localSQL += sComma + " (" + req.params.id + ", " + element.id + ")";
    iCount++;
  });
  // Run the Sql
  console.log(localSQL);
  db.run(localSQL, function (err, response) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      data: response,
    });
  });
});

//----------------------------------------------------------------------------
// METHOD: GET
// http://localhost:3000/4work/lastid - Check on the database what was
// the last workspace id created
//----------------------------------------------------------------------------
app.get("/4work/lastid/", (req, res) => {
  //var params = [req.params.id];
  console.log("get lastid");
  db.get("select id from workspaces order by id desc limit 1", (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Success", data: row });
  });
});

//----------------------------------------------------------------------
// METHOD: DELETE
// http://localhost:3000/deletews/id - Delete an specific workspace from
// the database
//----------------------------------------------------------------------
app.delete("/4work/deletews/:id", (req, res, next) => {
  console.log("Called server to delete ");
  var params = [req.params.id];
  const sql = "delete from workspaces where id = " + params;
  console.log("Server to delete " + sql);
  db.run(sql, function (err, response) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Deleted successfully", changes: this.changes });
  });
});

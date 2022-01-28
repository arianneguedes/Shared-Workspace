// Name: Course Project - Coworking Registry
// Program: Software Development Diploma
// Course Code: SODV1201 - Introduction to Web Programming
// Authors: Arianne Hoffschneider Guedes Gayer and Jorge Eduardo Schmitt Gayer
// Student IDs: 425002 and 424267

//mainID is the global variable that will have the ID when the page needs to be loaded with information
const params = new URLSearchParams(document.location.search);
var mainID = params.get("id");
var mainAction = params.get("action");
const mainEmail = "admin@4work.ca";
var mainAmenities = [];

console.info("mainID" + mainID);

$(document).ready(function () {
  mainID = params.get("id");
  if (mainID) populateFields(mainID);
});

// Object with all the fields that can be sorted
function loadSortingFields() {
  return (myFilters = [
    {
      id: "0",
      description: "",
      show: "",
    },
    {
      id: "1",
      description: "price",
      show: "Price",
    },
    {
      id: "2",
      description: "available",
      show: "Availability",
    },
    {
      id: "3",
      description: "amenities",
      show: "More Amenities",
    },
    {
      id: "4",
      description: "typedescription",
      show: "Type",
    },
    {
      id: "5",
      description: "proximity",
      show: "Proximity",
    },
  ]);
}

// Function that returns an object with all filter possibilities
function loadFilterOptions() {
  return (filterOptions = {
    price: [
      {
        sqlCode: " price < 500 ",
      },
      {
        sqlCode: " (price >= 500 and price < 1000) ",
      },
      {
        sqlCode: " (price >= 1000 and price < 1500) ",
      },
      {
        sqlCode: " (price >= 1500 and price <= 2000) ",
      },
    ],
    availability: [
      {
        sqlCode: " available = 1",
      },
      {
        sqlCode: " available = 0",
      },
    ],
    Amenities: [
      {
        sqlCode: "  1",
      },
      {
        sqlCode: "  2",
      },
      {
        sqlCode: "  3",
      },
      {
        sqlCode: "  4",
      },
      {
        sqlCode: "  5",
      },
      {
        sqlCode: "  6",
      },
      {
        sqlCode: "  7",
      },
      {
        sqlCode: "  8",
      },
      {
        sqlCode: "  9",
      },
      {
        sqlCode: "  10",
      },
      {
        sqlCode: "  11",
      },
      {
        sqlCode: "  12",
      },
    ],
    type: [
      {
        sqlCode: " typeid = 1",
      },
      {
        sqlCode: " typeid = 2",
      },
      {
        sqlCode: " typeid = 3",
      },
      {
        sqlCode: " typeid = 4",
      },
      {
        sqlCode: " typeid = 5",
      },
    ],
  });
}

// Function to load all amenities options that the owner can select
function showAmenitieOptions() {
  $.get("http://localhost:3000/4work/amenities", (data) => {
    let amenitiesList = data;
    mainAmenities = data;
    amenitiesList.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );
    let divAmenities = document.getElementById("div-amenities");
    let myId = "";
    var i = 0;
    var myHTML = document.getElementById("div-amenities").innerHTML;
    myHTML += "<div>";

    var localView = mainAction == "view" ? "Disabled" : "Enabled";

    amenitiesList.forEach((element) => {
      if (i != 0)
        if (i % 4 == 0) {
          myHTML += "<div>";
        }
      myId = "chkAmenities" + element.id;
      myHTML +=
        "<input type='checkbox' id='" +
        myId +
        "' name='" +
        myId +
        "' class='chkAmenities' " +
        localView +
        "/>";
      myHTML +=
        "<label class='labels' for='" +
        myId +
        "'>" +
        element.name +
        "</label> <br>";

      i++;
      if (i % 4 == 0) {
        myHTML += "</div>";
      }
    });

    divAmenities.innerHTML = myHTML;
    var frame = "";

    divAmenities.style.gridTemplateColumns = frame;
  });
}

function loadTypeOptions() {
  // Load all the type options available to be selected for the workspace
  //   <select name="optType" id="optType">
  //   <option value="1">Desk in shared space</option>
  //   <option value="2">Desk in private room</option>
  //   <option value="3">Meeting room</option>
  //   <option value="4">Theater</option>
  //   <option value="5">Conference Room</option>
  // </select>

  $.get("http://localhost:3000/4work/types", (data) => {
    let myTypes = data;
    optType = document.getElementById("optType");
    var myHTML = "";

    myTypes.forEach((element) => {
      myHTML +=
        "<option value=" + element.id + ">" + element.name + "</option>";
    });
    optType.innerHTML = myHTML;
  });
}

// Based on what the owner selected, call the correct function to post a new
// workspace or update the workspace selected
function actionWS() {
  try {
    var localWS = validateFields();
    removeError();
    // Called if the owner is adding a new workspace
    if (mainAction == "add") {
      PostWS(localWS);
      $.get("http://localhost:3000/4work/lastid/", (data) => {
        localWS.id = data.data.id;
        console.log(localWS);
        addWSAmenities(localWS);
      });
      window.alert("Workspace was inserted successfully!");
      window.location.href = "http://localhost:3000/ws_management.html";

      // Called if the owner is updating a workspace
    } else if (mainAction == "update") {
      console.log("localws before calling patch on server");
      console.log(localWS);
      PatchWS(localWS);
      deleteWSAmenities(localWS);

      window.alert("Workspace was updated successfully!");
      window.location.href = "http://localhost:3000/ws_management.html";
    }
  } catch (Err) {
    if (Err) {
      showError(Err.message);
    }
  }
}

// Function that posts the new workspace into the database based on the object it receives
function PostWS(localWS) {
  console.log(" post ws ");
  console.log(JSON.stringify(localWS));
  fetch("http://localhost:3000/4work/workspace", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(localWS),
  })
    .then(function (res) {
      //console.log(res);
    })
    .catch(function (res) {
      console.log(res);
    });
}

// Function to update the workspace in the database
function PatchWS(localWS) {
  console.log(" patch ws " + JSON.stringify(localWS));
  fetch("http://localhost:3000/4work/workspace/" + localWS.id, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PATCH",
    body: JSON.stringify(localWS),
  })
    .then(function (res) {
      //window.alert("Workspace was updated successfully!");
      //window.location.href = "http://localhost:3000/ws_management.html";
    })
    .catch(function (res) {
      console.log(res);
    });
}

// Function to call the server to delete the amenities of a workspace
function deleteWSAmenities(localWS) {
  fetch("http://localhost:3000/4work/workspace/amenities/" + localWS.id, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "DELETE",
    body: JSON.stringify(localWS),
  })
    .then(function (res) {
      if (mainAction == "update") {
        addWSAmenities(localWS);
      }
    })
    .catch(function (res) {
      console.log(res);
    });
}

// Function to call the server and associate to the workspace all the amenities selected by the owner
function addWSAmenities(localWS) {
  fetch("http://localhost:3000/4work/workspace/amenities/" + localWS.id, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(localWS),
  })
    .then(function (res) {
      //window.alert("Workspace was updated successfully!");
      //window.location.href = "http://localhost:3000/ws_management.html";
    })
    .catch(function (res) {
      console.log(res);
    });
}

// Function to show the error message if no worskpace is found
function showError(errMessage) {
  document.documentElement.scrollTop = 0;
  divErr = document.getElementById("err-msg");
  divErr.innerHTML =
    "<h5><img src='./images/error.png' class='action-icons'>" +
    errMessage +
    "</h5>";
  divErr.style.display = "grid";
}

// Function to validate all the fields entered by the owner to make sure
// they are correct. If they are correct, it returns an object
// with all the workspace information.
function validateFields() {
  // Validate name
  var name = document.getElementById("txtName").value;
  if (name.trim() == "") {
    throw new Error("Please inform workspace name!!");
  }
  // Validate description
  var description = document.getElementById("txtDescription").value;
  if (description.trim() == "") {
    throw new Error("Please inform workspace description!!");
  }
  if (description.length < 50) {
    throw new Error("Description must have at least 50 characters!!");
  }
  // Validate neighborhood
  var neighborhood = document.getElementById("txtNeighborhood").value;
  if (neighborhood.trim() == "") {
    throw new Error("Please inform workspace neighborhood!!");
  }
  // Validate location
  var latitude = document.getElementById("txtLatitude").value;
  if (latitude.trim() == "") {
    throw new Error("Please inform workspace latitude!!");
  }
  var longitude = document.getElementById("txtLongitude").value;
  if (longitude.trim() == "") {
    throw new Error("Please inform workspace longitude!!");
  }
  // Validate price
  var price = parseFloat(document.getElementById("txtPrice").value);
  if (price == 0 || isNaN(price)) {
    throw new Error("Please inform workspace price!!");
  }
  // Validate seating
  var seating = parseFloat(document.getElementById("txtSeating").value);
  if (seating == 0 || isNaN(seating)) {
    throw new Error("Please inform workspace seating capacity!!");
  }

  // Create the object
  // Once all the fields are correct, this function creates
  // an object with all the information for the workspace

  var select = document.getElementById("optType");
  var typeid = parseInt(document.getElementById("optType").value);
  var typedescription = $("#optType :selected").text();
  var myCheckbox = document.getElementById("chkAvailable");
  var available = myCheckbox.checked == true ? 1 : 0;

  var amenitiesList = [];

  for (var i = 1; i <= 12; i++) {
    if (document.getElementById("chkAmenities" + i).checked) {
      amenitiesList.push({ id: i });
    }
  }
  console.log(document.getElementById("chkAvailable").value);
  console.log("amenities list " + amenitiesList);
  console.log("Available: " + available);
  mainID = params.get("id");

  var localWS = {
    id: mainID,
    name: name,
    description: description,
    latitude: latitude,
    longitude: longitude,
    price: price,
    typeid: typeid,
    typedescription: typedescription,
    email: mainEmail,
    neighborhood: neighborhood,
    available: available,
    seatcapacity: seating,
    amenities: amenitiesList,
  };
  console.log("here is the list");
  console.log(localWS);
  return localWS;
}

function removeError() {
  divErr = document.getElementById("err-msg");
  divErr.innerHTML = "<h5>" + "" + "</h5>";
  divErr.style.display = "none";
}

// Function to create the map for the workspace presented on the screen
function InitMap() {
  var lat = parseFloat(document.getElementById("txtLatitude").value);
  var long = parseFloat(document.getElementById("txtLongitude").value);
  let location = { lat: lat, lng: long };
  let Map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: location,
  });
  let Marker = new google.maps.Marker({ position: location, map: Map });
}

// When editing, this function populates the screen with all the fields with the
// information it gets from the database
function populateFields(selectedID) {
  $.get("http://localhost:3000/4work/workspaces/" + selectedID, (data) => {
    var myData = data[0];
    $("#txtName").val(myData.name);
    $("#txtDescription").html(myData.description);
    $("#txtNeighborhood").val(myData.neighborhood);
    $("#optType").val(myData.typeid);
    $("#txtPrice").val(myData.price);
    $("#txtSeating").val(myData.seatCapacity);
    console.log(myData.latitude);
    $("#txtLatitude").val(myData.latitude);
    $("#txtLongitude").val(myData.longitude);
    InitMap();
    //  $("#chkEnable").prop( "checked",  myData.enable );
    $("#chkAvailable").prop("checked", myData.available);

    $.get(
      "http://localhost:3000/4work/workspaces/amenities/" + selectedID,
      (amData) => {
        myData = amData;
        console.log(amData);
        myData.forEach((element) => {
          $("#chkAmenities" + element.amenitieid).prop("checked", true);
        });
      }
    );
    checkUpdateView();
  });
}

// Function to disable all the fields if the owner is just viewing the workspace details
function checkUpdateView() {
  if (mainAction == "view") {
    document.getElementById("doAction").style.display = "none";
    document.getElementById("txtName").disabled = "true";
    document.getElementById("txtDescription").disabled = "true";
    document.getElementById("txtNeighborhood").disabled = "true";
    document.getElementById("optType").disabled = "true";
    document.getElementById("txtPrice").disabled = "true";
    document.getElementById("txtSeating").disabled = "true";
    document.getElementById("txtLatitude").disabled = "true";
    document.getElementById("txtLongitude").disabled = "true";
    document.getElementById("chkAvailable").disabled = "true";
  } else if (mainAction == "update") {
    document.getElementById("doAction").value = "Update Workspace";
  }
}

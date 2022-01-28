// Name: Course Project - Coworking Registry
// Program: Software Development Diploma
// Course Code: SODV1201 - Introduction to Web Programming
// Authors: Arianne Hoffschneider Guedes Gayer and Jorge Eduardo Schmitt Gayer
// Student IDs: 425002 and 424267

let globalLat = [];
var globalLong = [];
var globalMapCount = 0;

// Function to execute loadWorkspaces and displayYear functions when the page loads
$(document).ready(function () {
  loadWorkspaces(0);
  displayYear();
});

function cancelLogin() {
  document.getElementById("login").style.display = "none";
  document.getElementById("drop-button").style.display = "inherit";
}

function showLogin() {
  document.getElementById("login").style.display = "inherit";
  document.getElementById("drop-button").style.display = "none";
}

function InitMapHome(globalMapCount) {
  for (var iCount = 1; iCount <= globalMapCount; iCount++) {
    let location = { lat: globalLat[iCount], lng: globalLong[iCount] };
    var localID = "map" + iCount;
    let Map = new google.maps.Map(document.getElementById(localID), {
      zoom: 18,
      center: location,
    });
    let Marker = new google.maps.Marker({ position: location, map: Map });
  }
}

function loadWorkspaces(sortOption) {
  // 0 - No Filter
  // 1 - Price
  // 2 - Availability
  // 3 - More Amenities
  // 4 - Type
  // 5 - Proximity

  // Call filtering function that creates an array with all the filter options selected by the user
  var filterSelected = filtering();

  // This function determines the sorting selected by the user
  var sortingOptions = loadSortingFields();

  var toSort = sortingOptions[sortOption].description;
  if (toSort == "") toSort = sortingOptions[1].description;
  console.log(sortingOptions[sortOption].description);

  // Use the post method to get a list of workspaces from the backend and passing
  // the filterSelected object on the body where it will be used for the SQL filter
  fetch("http://localhost:3000/4work/filter/" + toSort, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(filterSelected),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Populate the screen based on the object returned by the server
      console.log(data);
      myWS = data;
      var localHTML = "";
      var divWS = document.getElementById("main-container");
      var iCount = 0;
      divWS.innerHTML = "";
      // Create the strutucture of the first div
      if (myWS.length == 0) displayEmptyState();
      myWS.forEach((element) => {
        localHTML +=
          "<div class='inner-container'>" +
          "<div class='room'>" +
          "<div class='main-room'>" +
          "<div class='room-info1'>";
        localHTML += "<h2>" + element.name + "</h2>";
        localHTML +=
          "<p>" +
          element.typedescription +
          "<br>" +
          element.seatCapacity + " Seats <br>";
        localHTML += element.neighborhood + "</p></div>";
        localHTML += "<div class='room-info2'>";
        localHTML += "<h2>CAD$" + element.price + "/month</h2>";
        if (element.available) {
          localHTML +=
            "<p class='available'><strong>For rent</strong></p></div>";
        } else {
          localHTML +=
            "<p class='available' style='background-color: #888888'><strong>Rented</strong></p></div>";
        }

        localHTML += "</div><div class='room-description'>";
        localHTML += "<p>" + element.description + "</p></div>";
        iCount++;
        // Populate the map
        localHTML += "<div class='room-map' id='map" + iCount + "'></div>";
        globalLat[iCount] = element.latitude;
        globalLong[iCount] = element.longitude;

        localHTML += "<div class='main-amenities'>";
        localHTML += "<strong class='amenities-tittle'>Amenities:</strong>";
        localHTML +=
          "<div class='room-amenities" +
          element.id +
          "' id='room-amenities" +
          element.id +
          "'>";

        divWS.innerHTML += localHTML;
        localHTML = "";

        localHTML += "</div></div>";
        localHTML += "</div>";
        divWS.innerHTML += localHTML;
        localHTML = "";
        hideEmptyState();
      });

      globalMapCount = iCount;

      // Call a function to load the map for each one of the divs
      InitMapHome(globalMapCount);
      localHTML = "";
    })
    .catch(function (res) {
      // If nothing is returned, show the empty state div. This div shows a message stating that no
      // workspaces were found with the selected criteria
      console.log(res);
      displayEmptyState();
    });

  // Once all workspaces were loaded on the screen, another select is done to load all amenities
  fetch("http://localhost:3000/4work/filter/" + toSort, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(filterSelected),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var myWS = data;
      // Create the strutucture of the first div
      if (myWS.length > 0) {
        myWS.forEach((element) => {
          $.get(
            "http://localhost:3000/4work/workspaces/amenities/" + element.id,
            (amData) => {
              myData = amData;
              setTimeout(showAmenities(myData), 1000);
            }
          );
        });
      }
    })
    .catch(function () {
      displayEmptyState();
    });
}

// Function to populate the amenities div for each one of the workspaces
function showAmenities(amData) {
  localHTML = "<ul>";
  var divWS = document.getElementById("room-amenities" + amData[0].workspaceid);
  for (var i = 0; i < amData.length; i++) {
    localHTML += "<li>" + amData[i].name + "</li>";
  }
  localHTML += "</ul>";
  localHTML += "<a class='button' href='mailto:admin@4work.ca' >Contact us</a>";

  divWS.innerHTML += localHTML;
}

// Function to filter the rooms
function filtering() {
  var filterOptions = loadFilterOptions();
  console.log(filterOptions);
  var filterSelected = [];
  var FilterAdded = false;

  for (i = 0; i <= 3; i++) {
    if (document.getElementById("chkPrice" + i).checked) {
      filterSelected.push(filterOptions.price[i].sqlCode);
      FilterAdded = true;
    }
  }
  if (FilterAdded) {
    filterSelected.push();
  }
  var FilterAdded = false;
  if (document.getElementById("chkForRent").checked) {
    filterSelected.push(filterOptions.availability[0].sqlCode);
    FilterAdded = true;
  }
  if (FilterAdded) {
    filterSelected.push();
  }
  var FilterAdded = false;
  if (document.getElementById("chkRented").checked) {
    filterSelected.push(filterOptions.availability[1].sqlCode);
    FilterAdded = true;
  }
  if (FilterAdded) {
    filterSelected.push();
  }

  for (i = 0; i <= 4; i++) {
    if (document.getElementById("chkType" + i).checked) {
      filterSelected.push(filterOptions.type[i].sqlCode);
    }
  }
  var sqlAmenities = "";

  for (i = 0; i <= 11; i++) {
    if (document.getElementById("chkAmenitie" + i).checked) {
      if (sqlAmenities == "") {
        sqlAmenities =
          " id in (select workspaceid from workspace_amenities where amenitieid in (" +
          filterOptions.Amenities[i].sqlCode;
      } else {
        sqlAmenities += ", " + filterOptions.Amenities[i].sqlCode;
      }
    }
  }
  if (sqlAmenities != "") sqlAmenities += "))";
  if (sqlAmenities != "") filterSelected.push(sqlAmenities);

  console.log(filterSelected);
  return filterSelected;
}

// Function to sort the rooms
function sorting(option) {
  loadWorkspaces(option);
  document.getElementById("drop-button").textContent =
    "Sorted by " + loadSortingFields()[option].show;
}

// Function to display the current year on the footer
function displayYear() {
  var year = new Date().getFullYear();
  document.getElementById("current-year").innerHTML = year;
}

// Function to verify the owner credentials and login the user in case the credentials are ok
function systemLogin() {
  var user = document.getElementById("user-login").value;
  var password = document.getElementById("user-password").value;

  $.get("http://localhost:3000/4work/users/" + user, (data) => {
    if (password == data.data.password) {
      window.location.href = "http://localhost:3000/ws_management.html";
    } else {
      document.getElementById("login-content1").style.marginTop = "40px";
      document.getElementById("wrong-cred").style.display = "inherit";
    }
  });
}

// Function to display the empty state div showing that no workspaces were found
function displayEmptyState() {
  document.getElementById("empty-state").style.display = "inherit";
}

// Function to hide the empty state div and show the workspaces that were found
function hideEmptyState() {
  document.getElementById("empty-state").style.display = "none";
}
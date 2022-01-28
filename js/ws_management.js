// Name: Course Project - Coworking Registry
// Program: Software Development Diploma
// Course Code: SODV1201 - Introduction to Web Programming
// Authors: Arianne Hoffschneider Guedes Gayer and Jorge Eduardo Schmitt Gayer
// Student IDs: 425002 and 424267

var iTypes = [];

// Function to call the loadTable function as soon as the page is loaded
$(document).ready(function () {
  loadTable();
});

// Function to populate the main table and bring the workspace information
function loadTable() {
  var localTable = document.getElementById("main-table");
  // Create the table header
  localHTML = loadTableHeader();
  $.get("http://localhost:3000/4work/workspaces", (data) => {
    var ws = data;
    //console.log(ws);
    // Populate the table with the information from the global array
    for (l = 0; l < ws.length; l++) {
      // Create a new line

      localHTML += "<a class='table-link' href='./ActionWS.html?id=" + ws[l].id + "&action=view'>";

      //var newRow = localTable.insertRow(localTable.length);
      localHTML += "<tr class='table-row'>";

      localHTML += "<td class='r-content content-view' onclick='viewWS(\"" + ws[l].id + "\")'>";
      localHTML += "<img src='./images/view.png'  title='View this workspace' class='action-icons view-icon'>";
      localHTML += "</td>";

      localHTML += "<td class='r-content content-available'>";
      localHTML += "<input type='checkbox' name='' id='chkAvailable' disabled  ";
      if (ws[l].available == 1) {
        localHTML += "checked";
      } else {
        localHTML += "unchecked";
      }
      localHTML += " />";
      localHTML += "</td>";

      localHTML += "<td class='r-content content-type'>";
      localHTML += ws[l].typedescription;
      localHTML += "</td>";

      localHTML += "<td class='r-content content-name'>";
      localHTML += ws[l].name;
      localHTML += "</td>";

      localHTML += "<td class='r-content content-description'>";
      localHTML += ws[l].description;
      localHTML += "</td>";

      localHTML += "<td class='r-content content-neighborhood'>";
      localHTML += ws[l].neighborhood;
      localHTML += "</td>";

      localHTML += "<td class='r-content content-price'>";
      localHTML += "$" + parseFloat(ws[l].price).toFixed(2);
      localHTML += "</td>";

      localHTML += "<td class='r-content content-seating'>";
      localHTML += ws[l].seatCapacity + " Seats";
      localHTML += "</td>";

      localHTML +=
        "<td class='content-actions r-content' onclick=''>" +
        "<a class='table-link' title='Edit this workspace' href='./ActionWS.html?id=" +
        ws[l].id +
        "&action=update'" +
        "><img class='action-icons' src='./images/edit.png' alt=''/></a>" +
        "<img class='action-icons' title='Delete this workspace' src='./images/delete.png' alt='' onclick='showDelete(\"" +
        ws[l].id +
        "\");'/></td>";
      localHTML += "</tr>";
      localHTML += "</a>";
      localTable.innerHTML = localHTML;
    }
  });
}

// Function to load the workspaces table header
function loadTableHeader() {
  return (
    "<thead> <tr>" +
    "<th class='head-view head' onclick=''>View</th>" +
    "<th class='head-available head' onclick=''>Available</th>" +
    "<th class='head-type head' onclick=''>Type</th>" +
    "<th class='head-name head' onclick=''>Name</th>" +
    "<th class='head-description head' onclick=''>Description</th>" +
    "<th class='head-neighborhood head' onclick=''>Neighborhood</th>" +
    "<th class='head-price head' onclick=''>Price</th>" +
    "<th class='head-seating head' onclick=''>Seats</th>" +
    "<th class='head-actions head' onclick=''>  Actions </th>" +
    "</tr></thead>"
  );
}

// Function to convert the availability from a boolean to a text to help on the html presentation
function convertAvailable(available) {
  console.log("available" + available);
  if (available == true) {
    return "checked";
  } else {
    return "unchecked";
  }
}

// Function to show the delete div, which is hidden all the time and is shown as soon
// as the user clicks on Delete
function showDelete(idReceived) {
  document.getElementById("div-delete").style.display = "block";
  document.getElementsByClassName("content-view").disabled = "true";
  document.getElementById("idToDelete").innerHTML = idReceived;

  var localText =
    "You are about to delete this record. Do you confirm this operation?";
}

// Function to hide the delete div and show the page content
function hideDelete() {
  document.getElementById("div-delete").style.display = "none";
}

// Function to call the delete API on the server to delete the workspace
function deleteField() {
  var idToDelete = document.getElementById("idToDelete").innerHTML;
  console.log("id to delete" + idToDelete);

  fetch("http://localhost:3000/4work/deletews/" + idToDelete, {
    method: "DELETE",
  })
    .then((response) => {
      //console.log(response.json)
      return response.json();
    })
    .then((data) =>
      // This is the data we get after putting our data
      console.log(data)
    );
  // Call the function to delete all the association between the amenities and the workspace
  deleteWSAmenities({ id: idToDelete });
  window.alert("Record with ID: " + idToDelete + " was deleted successfully!");
  location.reload();
}

function viewWS(receivedID) {
  window.location.href = "ActionWS.html?id=" + receivedID + "&action=view";
}
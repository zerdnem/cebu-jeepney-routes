var el = document.getElementById("searchContainer");
var elem = document.getElementById("searchByDestinationContainer");

var mymap = L.map("mapid", { attributionControl: false }).setView(
  [10.3157, 123.8854],
  13
);

var hr = new Date().getHours();

if (hr => 18) {
  L.tileLayer(
    "https://api.mapbox.com/styles/v1/zerdnem/cizqvumen005w2spiqh7l4afm/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiemVyZG5lbSIsImEiOiJjaXpmbnhnOXQwMGU0MzNsNDk1dm5jNmdiIn0.lgidMrXL9kKP22iSKAfPlw",
    { attribution: "", maxZoom: 18 }
  ).addTo(mymap);
} else {
  L.tileLayer(
    "https://api.mapbox.com/styles/v1/zerdnem/cizqvumen005w2spiqh7l4afm/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiemVyZG5lbSIsImEiOiJjaXpmbnhnOXQwMGU0MzNsNDk1dm5jNmdiIn0.lgidMrXL9kKP22iSKAfPlw",
    { attribution: "", maxZoom: 18 }
  ).addTo(mymap);
}

lc = L.control
  .locate({
    returnToPrevBounds: true
  })
  .addTo(mymap);

var cssIcon = L.divIcon({
  className: "css-icon",
  html: '<div class="gps_ring"></div>',
  iconSize: [22, 22]
});

var database = firebase.database();
var routesRef = database.ref("routes");

var routes = [];
var coords = [];
var allData = [];

if (localStorage.getItem("routes") === null) {
  var popup = L.popup()
    .setLatLng([10.3157, 123.8854], 13)
    .setContent("Loading data...")
    .openOn(mymap);
  routesRef.on("child_added", function(snap) {
    routes.push(snap.val().route);
    document.getElementById("searchContainer").style.display = "";
    localStorage.setItem("routes", routes);
    mymap.closePopup();
  });
} else {
  var jeepneyRouteNum = localStorage.getItem("routes");
  jeepneyRouteNum = jeepneyRouteNum.split(",");
  routes = jeepneyRouteNum;
  document.getElementById("searchContainer").style.display = "";
}

new autoComplete({
  selector: 'input[name="searchBox"]',
  minChars: 2,
  source: function(term, suggest) {
    term = term.toLowerCase();
    choices = routes;
    var matches = [];
    for (i = 0; i < choices.length; i++)
      if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
    suggest(matches);
  }
});

function getRoute(e, obj, click) {
  deleteFromGroupByID();
  routesRef.on("child_added", function(snap) {
    var jeepNumSearchVal = document.getElementById("searchBox").value;
    jeepNumSearchVal = jeepNumSearchVal.toLowerCase();

    if (jeepNumSearchVal == snap.val().route) {
      var data = snap.val().data;
      data = JSON.parse(data);
      allData.push(data);
      var startRoute = data.features[0].geometry;
      var backRoute = data.features[1].geometry;

      var startRouteCoord = data.features[0].geometry.coordinates;
      var backRouteCoord = data.features[1].geometry.coordinates;

      if (click) {
        addRouteLayer(startRoute, backRoute, startRouteCoord, backRouteCoord);
      } else if (e.keyCode === 13) {
        addRouteLayer(startRoute, backRoute, startRouteCoord, backRouteCoord);
      }
    }
  });
}

Array.prototype.swapItems = function(a, b) {
  this[a] = this.splice(b, 1, this[a])[0];
  return this;
};

function addRouteLayer(startRoute, backRoute, startRouteCoord, backRouteCoord) {
  var startRouteCoords = [];
  var backRouteCoords = [];

  var startRouteColor = { color: "#0000ff", weight: 5, opacity: 0.65 };
  var backRouteColor = { color: "#33ff33", weight: 5, opacity: 0.65 };

  startRouteLayer = L.geoJSON(startRoute, { style: startRouteColor }).addTo(
    mymap
  );
  backRouteLayer = L.geoJSON(backRoute, { style: backRouteColor }).addTo(mymap);

  for (var i = 0; i < startRouteCoord.length; i++) {
    startRouteCoord[i].splice(2, 1);
    startRouteCoord[i].swapItems(0, 1);
    startRouteCoords.push(startRouteCoord[i]);
    coords.push(startRouteCoord[i]);
  }

  for (var i = 0; i < backRouteCoord.length; i++) {
    backRouteCoord[i].splice(2, 1);
    backRouteCoord[i].swapItems(0, 1);
    backRouteCoords.push(backRouteCoord[i]);
  }

  var myMovingMarker = L.Marker.movingMarker(
    startRouteCoords.concat(backRouteCoords),
    50000,
    { autostart: true }
  ).addTo(mymap);
  myMovingMarker.on("click", function() {
    if (myMovingMarker.isRunning()) {
      myMovingMarker.pause();
    } else {
      myMovingMarker.start();
    }
  });
  mymap.panTo(startRouteCoords[0]);
}

function removeSearch() {
  removeClass(el, "searchContainer");
}

function removeSearchDestination() {
  removeClass(elem, "searchByDestinationContainer");
}

function removeClass(el, className) {
  if (el.classList) el.classList.remove(className);
  else if (hasClass(el, className)) {
    var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
    el.className = el.className.replace(reg, " ");
  }
}

var tempID = 1;
mymap.eachLayer(function(layer) {
  layer.layerID = tempID;
  tempID += 1;
  layer.bindPopup("Layer ID: " + layer.layerID);
});

deleteFromGroupByID = function(group, ID) {
  mymap.eachLayer(function(layer) {
    if (layer.layerID === ID) {
      mymap.removeLayer(layer);
    }
  });
};

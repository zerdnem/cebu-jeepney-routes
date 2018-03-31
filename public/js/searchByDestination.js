var colorArray = [
  "#FF6633",
  "#FFB399",
  "#FF33FF",
  "#FFFF99",
  "#00B3E6",
  "#E6B333",
  "#3366E6",
  "#999966",
  "#99FF99",
  "#B34D4D",
  "#80B300",
  "#809900",
  "#E6B3B3",
  "#6680B3",
  "#66991A",
  "#FF99E6",
  "#CCFF1A",
  "#FF1A66",
  "#E6331A",
  "#33FFCC",
  "#66994D",
  "#B366CC",
  "#4D8000",
  "#B33300",
  "#CC80CC",
  "#66664D",
  "#991AFF",
  "#E666FF",
  "#4DB3FF",
  "#1AB399",
  "#E666B3",
  "#33991A",
  "#CC9999",
  "#B3B31A",
  "#00E680",
  "#4D8066",
  "#809980",
  "#E6FF80",
  "#1AFF33",
  "#999933",
  "#FF3380",
  "#CCCC00",
  "#66E64D",
  "#4D80CC",
  "#9900B3",
  "#E64D66",
  "#4DB380",
  "#FF4D4D",
  "#99E6E6",
  "#6666FF"
];

var destination = [];
var data = [];

if (localStorage.getItem("destination") === null) {
  var popup = L.popup()
    .setLatLng([10.3157, 123.8854], 13)
    .setContent("Loading data...")
    .openOn(mymap);

  routesRef
    .once("value")
    .then(snapshot => {
      snapshot.forEach(data => {
        var dest = data.val().destination;
        if (dest) {
          for (var i = 0; i < dest.length; i++) {
            var name = dest[i].name;
            destination.push(name);
            document.getElementById(
              "searchByDestinationContainer"
            ).style.display =
              "";
            destination = removeDuplicate(destination);
            localStorage.setItem("destination", destination);
            mymap.closePopup();
          }
        }
      });
    })
    .catch(err => console.log(err));
} else {
  var jeepneyRouteNum = localStorage.getItem("destination");
  jeepneyRouteNum = jeepneyRouteNum.split(",");
  destination = jeepneyRouteNum;
  document.getElementById("searchByDestinationContainer").style.display = "";
}

new autoComplete({
  selector: 'input[name="searchByDestinationBox"]',
  minChars: 2,
  source: function(term, suggest) {
    term = term.toLowerCase();
    choices = destination;
    var matches = [];
    for (i = 0; i < choices.length; i++)
      if (~choices[i].toLowerCase().indexOf(term)) matches.push(choices[i]);
    suggest(matches);
  }
});

function getDestinationRoute(e, obj, click) {
  deleteFromGroupByID();
  routesRef.on("value", snapshot => {
    snapshot.forEach(data => {
      var jeepNumSearchVal = document.getElementById("searchByDestinationBox")
        .value;
      jeepNumSearchVal = jeepNumSearchVal.toLowerCase();
      var dest = data.val().destination;
      if (dest) {
        for (let i = 0; i < dest.length; i++) {
          if (dest[i].name != undefined) {
            if (jeepNumSearchVal == dest[i].name.toLowerCase()) {
              var routeCode = data.val().route;
              var fullRoute = data.val().data;
              var destCoord = data.val().destination[i].coord;
              var destName = data.val().destination[i].name;
              if (click) {
                addDestinationRouteLayer(
                  JSON.parse(fullRoute),
                  routeCode.toUpperCase(),
                  destCoord,
                  destName
                );
              } else if (e.keyCode === 13) {
                addDestinationRouteLayer(
                  JSON.parse(fullRoute),
                  routeCode.toUpperCase(),
                  destCoord,
                  destName
                );
              }
            }
          }
        }
      }
    });
  });
}

Array.prototype.swapItems = function(a, b) {
  this[a] = this.splice(b, 1, this[a])[0];
  return this;
};

Array.prototype.getRandom = function(cut) {
  var i = Math.floor(Math.random() * this.length);
  if (cut && i in this) {
    return this.splice(i, 1)[0];
  }
  return this[i];
};

function addDestinationRouteLayer(fullRoute, routeCode, destCoord, destName) {
  var randomColor = colorArray.getRandom();
  console.log(routeCode, destName, destCoord, randomColor);
  var routeColor = { color: randomColor, weight: 5, opacity: 0.65 };
  var marker = L.geoJSON(fullRoute, { style: routeColor }).addTo(mymap);

  L.marker(destCoord, { icon: cssIcon }).addTo(mymap);

  L.marker(destCoord)
    .bindPopup(destName)
    .openPopup()
    .addTo(mymap);

  marker.bindPopup(routeCode).openPopup();
  mymap.panTo(destCoord);
}

function removeDuplicate(arr) {
  var obj = {};
  var ret_arr = [];
  for (var i = 0; i < arr.length; i++) {
    obj[arr[i]] = true;
  }
  for (var key in obj) {
    ret_arr.push(key);
  }
  return ret_arr;
}

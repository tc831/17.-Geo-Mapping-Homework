// Setting backgrounds of our map.
var lightMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/light-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

// Create map object.
var map = L.map("map", {
  center: [25, 0],
  zoom: 2,
});

// Set the map as default.
lightMap.addTo(map);

// Create a layer group made from the earthquake data
var earthquakes = new L.LayerGroup();

// Store the query URL to a variable
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// retrieve earthquake geoJSON data.
d3.json(queryURL, function(data) {  
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Set colors for the marker based on the magnitude.
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#ff0000";
      case magnitude > 4:
        return "#ff7300";
      case magnitude > 3:
        return "#ffa800";
      case magnitude > 2:
        return "#ffd900";
      case magnitude > 1:
        return "#e3ff00";
      default:
        return "#a3ff00";
    }
  }

  // Set size of each marker based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 3;
  }

  // Add GeoJSON layer to the map.
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

  }).addTo(earthquakes);

  earthquakes.addTo(map);

  // Creating Legend.
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");
   
    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#a3ff00",
      "#e3ff00",
      "#ffd900",
      "#ffa800",
      "#ff7300",
      "#ff0000"
     ];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Adding Legend to the map
  legend.addTo(map);

});
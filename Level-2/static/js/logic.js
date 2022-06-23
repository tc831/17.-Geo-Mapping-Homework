// Setting backgrounds of our map.
var lightMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: "mapbox/light-v10",
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});
  
var darkMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: "mapbox/dark-v10",
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

var outdoorsMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: "mapbox/outdoors-v11",
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

var satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: "mapbox/satellite-v9",
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

// Create map object.
var map = L.map("map", {
  center: [25, 0],
  zoom: 2,
  //Setting light map as default of the page.
  layers: [lightMap]
});

// Additional layers for two different sets of data, earthquakes and tectonicplates.
var earthquakes = new L.LayerGroup();
var tectonicplates = new L.LayerGroup();

// Create a baseMaps object to hold the map layers.
var baseMaps = {
  "Light Map": lightMap,
  "Dark Map": darkMap,
  "Outdoors": outdoorsMap,
  "Satellite": satelliteMap
};

// Create an overlayMaps object to hold the addidtional layers.
var overlayMaps = {
  "Fault Lines": tectonicplates,
  "Earthquakes Locations": earthquakes
};

// Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps,{
    collapsed: false
}).addTo(map);

// Store the query URL to a variable
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform an API call to the USGS API to get earthquake information.
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

  // Query for Tectonic Plate.
  d3.json(tectonicURL, function(platedata) { 
      L.geoJson(platedata, {
        color: "blue",
        weight: 2
      })
      .addTo(tectonicplates);

      // Add the tectonicplates layer to the map.
      tectonicplates.addTo(map);
    });

});
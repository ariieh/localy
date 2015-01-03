'use strict';

/* Leaflet interaction and geolocate library */

var userMarker = L.Marker.extend({
  options: {
    userID: ""
  }
});

window.Locator = {
  baseMaps: {
    Jane: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.c7d2024a/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
    Pencil: L.tileLayer("https://a.tiles.mapbox.com/v4/examples.a4c252ab/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
    Comic: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.bc17bb2a/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
    Pirate: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.a3cad6da/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
    Zombie: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.fb8f9523/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q")
  },
  
  getLocation: function(callback) {
    if (!window.testMode && navigator.onLine) {
    navigator.geolocation.getCurrentPosition(function(position) {
      Locator.retrieveLocation(position, callback);
    });
    } else {
      Locator.retrieveLocation({coords: {latitude: 40.718428, longitude: -73.991319}}, callback);
    }
  },
  
  retrieveLocation: function(position, callback) {
    position = [position.coords.latitude, position.coords.longitude];
    var places = leafletPip.pointInLayer([position[1], position[0]], nycNeighborhoodGeojson);
    var placename = places.length > 0 ? places[0].feature.properties.NTAName : "";

    eventManager.trigger("setView", position, 17);
    callback(position, placename);
  }
}

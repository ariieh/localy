'use strict';

/* Leaflet interaction and geolocate library */

var userMarker = L.Marker.extend({
  options: {
    userID: ""
  }
});

window.Locator = {
  baseMaps: {
    Streets: L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXJpZWhzbWl0aCIsImEiOiJzVm16MjN3In0.WHedYGED-rn6YpFwCX06Mg"),
    Outdoors: L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXJpZWhzbWl0aCIsImEiOiJzVm16MjN3In0.WHedYGED-rn6YpFwCX06Mg"),
    Dark: L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXJpZWhzbWl0aCIsImEiOiJzVm16MjN3In0.WHedYGED-rn6YpFwCX06Mg"),
    Light: L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXJpZWhzbWl0aCIsImEiOiJzVm16MjN3In0.WHedYGED-rn6YpFwCX06Mg"),
    Satellite: L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYXJpZWhzbWl0aCIsImEiOiJzVm16MjN3In0.WHedYGED-rn6YpFwCX06Mg"),
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
    // Get placename from Google if we can't find it
    position = [position.coords.latitude, position.coords.longitude];
    var places = leafletPip.pointInLayer([position[1], position[0]], nycNeighborhoodGeojson);
    var placename = places.length > 0 ? places[0].feature.properties.NTAName : "";
    if (placename == "") {
      var geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(position[0], position[1]);
      geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK && results[1]) {
          placename = results[1]["address_components"][0]["short_name"];
          Locator.setMapView(position, placename, callback);
        }
      });
    } else {
      Locator.setMapView(position, placename, callback);
    }
  },

  setMapView: function(position, placename, callback) {
    eventManager.trigger("setView", position, 17);
    callback(position, placename);
  }
}

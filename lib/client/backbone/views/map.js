LocalyBackbone.Views.Map = LocalyBackbone.LocalyView.extend({
  init: function(options){
    this.$containerEl = options.$containerEl;
    this.markers = {};
    this.map = L.map('map');
    this.eventManager = options.eventManager;
  },

  global_events: {
    'loadMap': 'loadMap',
    'loadMarker': 'loadMarker',
    'setView': 'setView',
    'getUserMarker': 'getUserMarker',
    'deleteMarker': 'deleteMarker',
    'removeLayer': 'removeLayer',
    'drawCircle': 'drawCircle'
  },

  render: function () {
    Locator.baseMaps["Jane"].addTo(this.map);
    L.control.layers(Locator.baseMaps).addTo(this.map);
    L.control.scale().addTo(this.map);
    this.map.on("zoomend", this.toggleZoomStates.bind(this));

    $("#map").on("click", ".icon-comment", function(event){
      this.startIndividualConversation(event);
    }.bind(this));

    $("#map").on("click", ".about", function(event){
      this.aboutMe();
    }.bind(this));
  },

  loadMap: function(users) {
    if (_.size(users) > 0) {
      _.each(users, function(user) {
        if (user.socket_id !== window.user.get("socketID")) this.loadMarker(user);
      }.bind(this));      
    }
  },

  loadMarker: function(user) {
    var userCollection = LocalyBackbone.Collections.users;
    var coords = {lat: MathLib.radToDeg(user.latitude), lon: MathLib.radToDeg(user.longitude)};

    var userModel = new LocalyBackbone.Models.User({
      username: user.username,
      socket_id: user.socket_id,
      latitude: MathLib.radToDeg(user.latitude),
      longitude: MathLib.radToDeg(user.longitude)
    });

    if (userCollection.indexOf(userModel) !== -1) {
      userCollection.get(userModel).markerView.marker.setLatLng([coords.lat, coords.lon]).update();
    } else {
      userCollection.add(userModel);

      var markerView = userModel.markerView = new LocalyBackbone.Views.Marker({
        model: userModel
      });

      this.markers[user.socket_id] = markerView;

      var renderedContent = JST["popup-header"]({username: user.username, socketID: user.socket_id});
      var popup = L.popup({minWidth: 100}).setContent(renderedContent);
      markerView.marker.bindPopup(popup);
      this.addLayer(markerView.marker);
    }
  },

  getUserMarker: function(userSocketID, callback) {
    callback(this.markers[userSocketID]);
  },

  deleteMarker: function(userSocketID) {
    var mapView = this.markers[userSocketID];
    this.map.removeLayer(mapView.marker);

    delete this.markers[userSocketID];
    mapView.remove();
  },

  toggleZoomStates: function() {
    var zoomLevel = this.map.getZoom();
    this.map.off("click");

    if (zoomLevel > 14) {
      this.removeLayer(nycNeighborhoodGeojson);
      this.map.on("click", this.swapHoodRoom.bind(this));
    } else if (zoomLevel > 10) {
      this.addLayer(nycNeighborhoodGeojson);
      this.map.on("click", this.swapHoodRoom.bind(this));
    } else {
      this.removeLayer(nycNeighborhoodGeojson);
    }
  },

  swapHoodRoom: function(event) {
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(event.latlng.lat, event.latlng.lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK && results[1]) {
        var placename = results[1]["address_components"][0]["short_name"];
        eventManager.trigger('swapRoom', 'hood', {hood: placename});
        socket.emit('join room', placename);
      }
    });
  },

  remoteCircleClick: function(event) {
    //drawCircle and join remote room on map click
    Localy.leaveAllRooms();

    var lat = event.latlng.lat;
    var lon = event.latlng.lng;

    Localy.joinRemote(lat, lon);
    eventManager.trigger("addRemoteButton", lat, lon);
  },

  drawCircle: function(type, lat, lon) {
    var circle = L.circle([lat, lon], 32.1869, {
            weight: 1,
            opacity: 0.5,
            fillOpacity: 0.4,
            color: '#3498db'
    });

    circle.addTo(this.map);

    switch(type) {
      case "local":
        window.localCircle = circle;
        break;
      case "remote":
        window.remoteCircle = circle;
        break;
    }
  },

  toggleHoodLayer: function(geojson) {
    this.map.hasLayer(geojson) ? this.removeLayer(geojson) : geojson.addTo(this.map);
  },

  setView: function(position, zoom) {
    this.map.setView(position, zoom);
  },

  addLayer: function(layer) {
    this.map.addLayer(layer);
  },

  removeLayer: function(layer) {
    if (layer !== undefined) this.map.removeLayer(layer);
  },

  startIndividualConversation: function(event) {
    var popupHeader = $(event.currentTarget).siblings(".popup-header");
    var username = popupHeader.attr("username");
    var socketID = popupHeader.attr("socket-id");

    Localy.leaveAllRooms();
    Localy.joinIndividual(socketID, username);
    eventManager.trigger("addIndividualButton", socketID, username);
  },

  aboutMe: function() {
    var aboutMeModal = window.JST['about-me']();
    $("#about-modal").html(aboutMeModal);
    $("#about-me-modal").fadeIn();
    $("body").off("click");
    $("body").on("click", function(event){
      if (!$(event.target).is("a.about, #about-me-modal-wrapper, #about-modal, #about-me-modal")) {
        $("#about-me-modal").fadeOut();
      }
    });
  }

});

LocalyBackbone.Views.Marker = LocalyBackbone.LocalyView.extend({
  init: function() {
    this.marker = L.marker([this.model.get('latitude'), this.model.get('longitude')]);
  },

  username: function() {
    return this.model.get('username');
  }
});

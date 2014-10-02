LocalyBackbone.Views.Map = LocalyBackbone.SocketView.extend({
  initialize: function(options){
    this.$containerEl = options.$containerEl;
    this.markers = {};
    this.socketInitialize();
  },

  events: {
  },

  socket_events: {
    'load map': 'loadMap',
    'load marker': 'loadMarker'
  },

  render: function () {
    window.map = L.map('map');
    Locator.baseMaps["Pencil"].addTo(window.map);
    L.control.layers(Locator.baseMaps).addTo(window.map);
    L.control.scale().addTo(window.map);

    window.map.on('click', this.remoteCircleClick);
  },

  loadMap: function(users) {
    _.each(users, function(user) {
      if (user.socket_id !== selfID) this.loadMarker(user);
    }.bind(this));
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

      var renderedContent = JST["map/popup-header"]({socketID: user.socket_id});
      var popup = L.popup().setContent(renderedContent);
      markerView.marker.bindPopup(popup);
      window.map.addLayer(markerView.marker);
    } 
  },

  deleteMarker: function(userID) {
    var mapView = this.markers[userID];
    window.map.removeLayer(mapView.marker);

    delete this.markers[userID];
    mapView.remove();
  },

  remoteCircleClick: function(event) {
    //Draw circle and join remote room on map click
    if (window.map.getZoom() > 14) {
      Localy.leaveAllRooms();

      var lat = event.latlng.lat;
      var lon = event.latlng.lng;

      Localy.joinRemote(lat, lon);
      Localy.addRemoteButton(lat, lon);
    }
  }
});

LocalyBackbone.Views.Marker = LocalyBackbone.SocketView.extend({
  initialize: function() {
    this.marker = L.marker([this.model.get('longitude'), this.model.get('latitude')]);
  }
});

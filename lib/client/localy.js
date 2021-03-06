'use strict';

/* Main Localy helper functions */

window.Localy = {
    /* Core launch functions */
    
  initialize: function(username, callback) {
   // Get current location, load your own marker and the map

    Locator.getLocation(function(position, placename) {
      window.user.set({
        socketID: window.socket.io.engine.id,
        username: username
      });
      window.lat = position[0];
      window.lon = position[1];
      window.place.set({currentLocation: placename});

      socket.emit('load marker', position, username, window.user.get("socketID"), placename);
      socket.emit('load map', window.user.get("socketID"));

      Localy.joinHood(placename);
      window.socket.emit('get chats from room', placename);
      callback();
    });
  },
  
  onConnection: function() {
    // Start Backbone only when connected to server
    LocalyBackbone.initialize(function() {
      if (window.testMode) eventManager.trigger("submitRandomName");
    });
  },
      
  /* Client-side room swapping */

  leaveAllRooms: function() {
    Localy.leaveLocal();
    Localy.leaveRemote();
    Localy.leaveHood();
    Localy.leaveIndividual();
  },
  
  leaveLocal: function() {
    eventManager.trigger("removeLayer", window.localCircle);
    window.localCircle = undefined;
  },
  
  joinLocal: function() {
    var $localbadge = $(".local-button #local-badge");
    eventManager.trigger("drawCircle", "local", window.lat, window.lon);
    window.place.set({currentRoomName: "Local"});
    eventManager.trigger("clearBadge", $localbadge);
    eventManager.trigger("swapActiveChat", "local");
  },
  
  leaveRemote: function() {
    eventManager.trigger("removeLayer", window.remoteCircle);
    window.remoteCircle = undefined;
  },
  
  joinRemote: function(lat, lon) {
    window.place.set({currentRoomName: lat.toFixed(7) + ", " + lon.toFixed(7)});
    eventManager.trigger("drawCircle", "remote", lat, lon);
    eventManager.trigger("swapActiveChat", "remote", {lat: lat, lon: lon});
  },

  leaveHood: function() {},

  joinHood: function(hood) {
    window.place.set({currentRoomName: hood});
    if (hood !== window.place.get("currentLocation")) {
      window.socket.emit('join room', hood);
    }
    eventManager.trigger("swapActiveChat", hood);
    eventManager.trigger('swapActiveHoodButton', hood);
  },

  joinIndividual: function(socketID, username) {
    eventManager.trigger("swapActiveChat", window.user.get("socketID") + ":" + socketID);
  },

  leaveIndividual: function() {},

  inLocal: function() {
    return window.localCircle !== undefined;
  },
  
  inHood: function() {
    return !(window.localCircle || window.remoteCircle);
  },

  inIndividual: function(socketID) {
    if ($("ul.active[type='" + socketID + ":" + window.user.get("socketID") + "']").length > 0) { return true; }
    if ($("ul.active[type='" + window.user.get("socketID") + ":" + socketID + "']").length > 0) { return true; }
    return false;
  },
  
  inRemote: function(lat, lon) {
    if (window.remoteCircle === undefined) { return false; }
    return window.remoteCircle.getLatLng().lat === lat && window.remoteCircle.getLatLng().lng === lon;
  },
          
  /* Useful helper functions */
  
  _myName: function(userID) {
    return userID === window.user.get("socketID") ? "my-username" : "";
  },
  
  _typeClass: function(type, options) {
    var className = type;

    if (type === "remote") {
      var lat = options.lat.toString().replace(/\./g, '');
      var lon = options.lon.toString().replace(/\./g, '');
      className = lat + lon;
    }

    return className;
  }   
}

'use strict';

/* Main Localy helper functions */

window.Localy = {
	/* Core launch functions */
	
	initialize: function(username, callback) {
		 // Get current location, load your own marker and the map

	  Locator.getLocation(function(position, placename) {
			selfID = window.socket.io.engine.id;
			window.lat = position[0];
			window.lon = position[1];
			window.placename = placename;
			
			socket.emit('load marker', position, username, selfID, placename);
			socket.emit('load map', selfID);

			Localy.joinHood(window.placename);
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
	},
	
	leaveLocal: function() {
		eventManager.trigger("removeLayer", window.localCircle);
		window.localCircle = undefined;
	},
	
	joinLocal: function() {
		var $localbadge = $(".local-button #local-badge");

		eventManager.trigger("drawCircle", "local", window.lat, window.lon);
		eventManager.trigger("swapChatTitle", "Local");
		eventManager.trigger("clearBadge", $localbadge);
		eventManager.trigger("swapActiveChat", "local");
	},
	
	leaveRemote: function() {
		eventManager.trigger("removeLayer", window.remoteCircle);
		window.remoteCircle = undefined;
	},
	
	joinRemote: function(lat, lon) {
		eventManager.trigger("swapChatTitle", lat.toFixed(7) + ", " + lon.toFixed(7));
		eventManager.trigger("drawCircle", "remote", lat, lon);
		eventManager.trigger("swapActiveChat", "remote", {"degree": {"lat": lat, "lon": lon} });
	},

	leaveHood: function() {},

	joinHood: function(hood) {
		eventManager.trigger("swapChatTitle", window.placename);
		eventManager.trigger("swapActiveChat", hood);
	},

	inLocal: function() {
		return window.localCircle !== undefined;
	},
	
	inHood: function() {
		return !(window.localCircle || window.remoteCircle);
	},
	
	inRemote: function(lat, lon) {
		if (window.remoteCircle === undefined) {
			return false;
		}
			return window.remoteCircle.getLatLng().lat === lat && window.remoteCircle.getLatLng().lng === lon;
	},
			
	/* Useful helper functions */
	
	_myName: function(userID) {
		return userID === selfID ? "my-username" : "";
	},
	
	_typeClass: function(type, bounds) {
		var className = type;

		if (type === "remote") {
			var lat = bounds.degree.lat.toString().replace(/\./g, '');
			var lon = bounds.degree.lon.toString().replace(/\./g, '');
			className = lat + lon;
		}

		return className;
	}	
}

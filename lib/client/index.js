'use strict';

/* Initialize socket.io on client side */
var socket = window.socket = io();

/* Basic data variables */
var geojson = L.geoJson(neighborhoods, {
  style: style,
  onEachFeature: onEachFeature
});

var username, selfID;
var markers = {};
var clusters = L.markerClusterGroup();
window.placename = "";

/* Test mode */
window.testMode = true;

/* Key element variables */
var $chatroom = $("div#chatroom");
var $chatbox = $("div#chatbox");
var $usercount = $("div#user-count");

var $localbutton = $('#chatbox .local-button');
var $hoodbutton = $('#chatbox .hood-button');

var $localbadge = $(".local-button #local-badge");
var $hoodbadge = $(".hood-button #hood-badge");

$(document).ready(function() {	
	/* Page listeners */

	//Emit message on form submit
  $('form#chat-form').submit(function(event) {
			event.preventDefault();

			var eventName, type;
			var msg = $('input#chat-input').val();
			var socketId = socket.io.engine.id;

			if (Localy.inLocal()) {
				var bounds = MathLib.radiusBounds(window.lat, window.lon);

				eventName = "radius message";
				type = "local";
			} else if (Localy.inHood()) {
				eventName = "chat message";
				type = window.placename;
			} else if (window.remoteCircle) {
				var lat = window.remoteCircle.getLatLng().lat;
				var lon = window.remoteCircle.getLatLng().lng;
				var bounds = MathLib.radiusBounds(lat, lon);

				eventName = "radius message";
				type = "remote";
			}

			Localy.emitMessage(eventName, msg, socketId, type, bounds);
			
			$('input#chat-input').val('');
  });
	
	//Join room
	$chatbox.on('click', '.chatroom-button', function(event) {
		var $button = $(this);

		Localy.leaveAllRooms();
		Localy._addBlue($button);

		if ($button.is(".local-button")){
			Localy.joinLocal();
		} else if ($button.is(".hood-button")) {
			Localy.joinHood(window.placename);
		} else if ($button.is(".remote-button")) {
			var lat = Number($(event.currentTarget).attr("lat"));
			var lon = Number($(event.currentTarget).attr("lon"));	

			Localy.joinRemote(lat, lon);
		}
	});

	/* Socket listeners */
	socket.on('connected', Localy.onConnection);
  socket.on('user count', Localy.setUserSize);
  socket.on('chat message', Localy.displayMessage);
  socket.on('load marker', Locator.loadMarker);
  socket.on('delete marker', Locator.deleteMarker);
});

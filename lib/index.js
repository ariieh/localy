'use strict';

/* Initialize socket.io on client side */
var socket = io();

/* Basic data variables */
var map = L.map('map');
	Locator.baseMaps["Pencil"].addTo(map);
	L.control.layers(Locator.baseMaps).addTo(map);
	L.control.scale().addTo(map);
	
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

var $localbutton = $('#chatbox #local-button');
var $hoodbutton = $('#chatbox #hood-button');

var $localbadge = $("#local-button #local-badge");
var $hoodbadge = $("#hood-button #hood-badge");

$(document).ready(function() {	
	/* Page listeners */
  $('form#chat-form').submit(function(event) {
			event.preventDefault();
			
			if (Localy._inLocal()) {
				console.log("sending local message");
				var bounds = MathLib.radiusBounds(window.lat, window.lon);
	    	socket.emit('radius message', $('input#chat-input').val(), socket.io.engine.id, "local", bounds);
				
			} else if (window.remoteCircle !== undefined) {
				console.log("sending remote message");
				var bounds = MathLib.radiusBounds(window.remoteCircle.getLatLng().lat, window.remoteCircle.getLatLng().lng);
	    	socket.emit('radius message', $('input#chat-input').val(), socket.io.engine.id, "remote", bounds);
				
			} else {
				console.log("sending hood message");
	    	socket.emit('chat message', $('input#chat-input').val(), socket.io.engine.id, window.placename);
			}
			
			$('input#chat-input').val('');
  });
	
	$localbutton.click(function(event) {
		if (Localy._inLocal()) {
			window.localCircle = undefined;
			Localy.leaveLocal();
			Localy.swapChatTitle(window.placename);
		} else {
			Localy.leaveRemote();
			Localy.joinLocal();
		}
	});
	
	$hoodbutton.click(function(event) {
		if (!Localy._inHood()) {
			Localy.leaveLocal();
			Localy.leaveRemote();
			Localy.swapChatTitle(window.placename);
		}
	});
	
	$chatbox.on('click', '.chatroom-button', function(event) {
		Localy._addBlue($(this));
	});
	
	$chatbox.on('click', '.remote-button', function(event) {
		Localy.leaveRemote();

		var lat = Number($(event.currentTarget).attr("lat"));
		var lon = Number($(event.currentTarget).attr("lon"));
		
		Localy.joinRemote(lat, lon);
	});
	
	map.on('click', function(event) {
		if (map.getZoom() > 14) {
			var lat = event.latlng.lat;
			var lon = event.latlng.lng;
		
			Localy.leaveLocal();
			Localy.leaveRemote();
			
			Localy.swapChatTitle(lat.toFixed(7) + ", " + lon.toFixed(7));
			window.remoteCircle = Locator.drawCircle(lat, lon).addTo(map);
		}
	});
		
	/* Socket listeners */
	socket.on('connected', Localy.onConnection);
	socket.on('load map', Localy.loadMap);
  socket.on('user count', Localy.setUserSize);
  socket.on('chat message', Localy.displayMessage);
  socket.on('load marker', Locator.loadMarker);
  socket.on('delete marker', Locator.deleteMarker);
});

'use strict';

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

/* Helper functions */
window.Localy = {
	initialize: function(){
		Localy.pageLoaderShow();
				
		username = $("#name-input").val();
		
	  Locator.getLocation(function(position, placename){
			selfID = socket.io.engine.id;
			window.lat = position[0];
			window.lon = position[1];
			window.placename = placename;
			
			socket.emit('load marker', position, username, selfID, placename);
			socket.emit('load map', selfID);
	  });
	},
	
	onConnection: function(){
		/* When connected to server, auto sign in in test mode or listen for user input */
		
		if (window.testMode){
			var randomName = Math.random().toString(36).substring(7);
			$("#name-input").val(randomName);
			Localy.initialize();
		} else {
			$("#name-input").keyup(function(event){
		    if(event.keyCode == 13) Localy.initialize();
			});
		}
	},
	
	pageLoaderShow: function(){
		var opts = {
		  lines: 13, // The number of lines to draw
		  length: 100, // The length of each line
		  width: 25, // The line thickness
		  radius: 70, // The radius of the inner circle
		  corners: 1, // Corner roundness (0..1)
		  rotate: 0, // The rotation offset
		  direction: 1, // 1: clockwise, -1: counterclockwise
		  color: '#ffffff', // #rgb or #rrggbb or array of colors
		  speed: 1, // Rounds per second
		  trail: 52, // Afterglow percentage
		  shadow: false, // Whether to render a shadow
		  hwaccel: false, // Whether to use hardware acceleration
		  className: 'spinner', // The CSS class to assign to the spinner
		  zIndex: 2e9, // The z-index (defaults to 2000000000)
		  top: '50%', // Top position relative to parent
		  left: '50%' // Left position relative to parent
		};
		
		$("#page-modal .modal-text").fadeOut();
		new Spinner(opts).spin(document.getElementById("page-modal"));
	},
	
	swapChatTitle: function(roomname){
		$("#chatroom-label").html("Chatroom: " + roomname);
		$chatroom.stop().animate({backgroundColor:'#e67e22'}, 400, function(){
		    $chatroom.animate({backgroundColor:'rgba(32, 32, 32, 0.8)'}, 400);
		});
	},
	
	setUserSize: function(size){
		$usercount.html("Users: " + size);
	},
	
	displayMessage: function(msg, userID, type, bounds){
		msg = Helper.replaceWithHTMLEntities(msg);
		
		var marker = markers[userID].marker;
		var username = markers[userID].username;
		var popup = marker.getPopup();
		
		var contentBody = $("span[id='popup-header-" + userID + "']").parent();
		var heightToScroll = contentBody.height();
		var contentWrapper = contentBody.parent();

		var content = "<li "
												+ (type === "local" ? "class='local'" : "")
												+ "><span class='username"
												+ Localy._myName(userID)
												+ "'>"
												+ username
												+ "</span>: <span class='message'>"
												+ msg
												+ "</span></li>";
		
		//Handle type-specific functions
		Localy.handleType(type, bounds);
		
		//Render message
		popup.setContent(popup._content + "<br>" + msg);
		$chatbox.children("ul").append(content);
		
		contentWrapper.animate({ scrollTop: heightToScroll }, "fast");
		$chatbox.animate({ scrollTop: $("ul#chatbody").height() }, "fast");
	},
	
	handleType: function(type, bounds){
		switch(type){
			case "local":
				console.log("receiving local message");
				
				if (!Localy._inLocal()) {
					Localy.showBadge($localbadge);
				}
				break;
			case window.placename:
				console.log("receiving hood message");

				if (!Localy._inHood()) {
					Localy.showBadge($hoodbadge);
				}
				break;
			case "remote":
				console.log("receiving remote message");

				var lat = bounds.degree.lat;
				var lon = bounds.degree.lon;

				var $remotebutton = Localy._$remoteButton(lat, lon);				
				
				if ($remotebutton.length === 0) {
					Localy.addRemoteButton(lat, lon);
				} else {
					if (!Localy._inRemote(lat, lon)){
						Localy.showBadge($remotebutton.children(".notification-badge"));
					}
				}
				break;
			}
	},
	
	loadMap: function(users){
		for (var i = 0; i < users.length; i++){
			var user = users[i];
			if (user.socket_id !== selfID) Locator.loadMarker(user);
		}

    $("#page-modal").fadeOut("slow");
		// map.addLayer(clusters);
	},
	
	toggleHoodLayer: function(){
		map.hasLayer(geojson) ? map.removeLayer(geojson) : geojson.addTo(map);
	},
	
	leaveLocal: function(){
		if (Localy._inLocal()) map.removeLayer(window.localCircle);
		window.localCircle = undefined;
		$chatbox.children('ul').removeClass('local');
	},
	
	joinLocal: function(){
		window.localCircle = Locator.drawCircle(window.lat, window.lon).addTo(map);
		Localy.swapChatTitle("Local");
		Localy.clearBadge($localbadge);

		$chatbox.children('ul').addClass('local');		
	},
	
	leaveRemote: function(){
		if (window.remoteCircle !== undefined) map.removeLayer(window.remoteCircle);
		window.remoteCircle = undefined;
	},
	
	joinRemote: function(lat, lon){
		window.remoteCircle = Locator.drawCircle(lat, lon).addTo(map);
	},
	
	clearBadge: function($badge){
		$badge.css({display: 'none'});
		$badge.html(0);
	},
	
	showBadge: function($badge){
		$badge.css({display: 'inline'});
		$badge.html(parseInt($badge.html()) + 1);				
	},
	
	addRemoteButton: function(lat, lon){
		var remoteButton = "<div "
												+ "class='nifty-box chatroom-button remote-button'"
												+ " lat=" + lat
												+ " lon=" + lon
												+ ">Remote: "
												+ lat.toFixed(2)
												+ ", "
												+ lon.toFixed(2)
												+ "<span style='display: inline' class='notification-badge'>1</span>"
												+ "</div>";
		
		$("#chatbox-button-wrapper").append(remoteButton);
		
		if (Localy._inRemote(lat, lon)){
			Localy._addBlue(Localy._$remoteButton(lat, lon));
		}
	},
	
	_myName: function(userID){
		return userID === selfID ? " my-username" : "";
	},
	
	_$remoteButton: function(lat, lon){
		return $(".remote-button[lat='" + lat + "'][lon='" + lon + "']");
	},
	
	_inLocal: function(){
		return (window.localCircle !== undefined);
	},
	
	_inHood: function(){
		return !(window.localCircle || window.remoteCircle);
	},
	
	_inRemote: function(lat, lon){
		if (window.remoteCircle === undefined){
			return false;
		}
			return window.remoteCircle.getLatLng().lat === lat && window.remoteCircle.getLatLng().lng === lon;
	},
	
	_addBlue: function($el){
		if (!$el.hasClass('blue')){
			$el.addClass('blue', 100);
			$el.siblings('.blue').removeClass('blue');
			Localy.clearBadge($el.children('.notification-badge'));
		}
	}
}

$(document).ready(function(){	
	/* Page listeners */
  $('form#chat-form').submit(function(event){
			event.preventDefault();
			
			if (Localy._inLocal()){
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
	
	$localbutton.click(function(event){
		if (Localy._inLocal()){
			window.localCircle = undefined;
			
			Localy.leaveLocal();
			Localy.swapChatTitle(window.placename);
		} else {
			Localy.leaveRemote();
			Localy.joinLocal();
		}
	});
	
	$hoodbutton.click(function(event){
		if (!Localy._inHood()){
			Localy.leaveLocal();
			Localy.leaveRemote();
		
			// Localy.toggleHoodLayer();
			// socket.emit('swap room', selfID, window.placename);
		
			Localy.swapChatTitle(window.placename);
		}
	});
	
	$chatbox.on('click', '.chatroom-button', function(event){
		Localy._addBlue($(this));
	});
	
	$chatbox.on('click', '.remote-button', function(event){
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
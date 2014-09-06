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

/* Key element variables */
var $chatroom = $("div#chatroom");
var $chatbox = $("div#chatbox");
var $usercount = $("div#user-count");

var $localbutton = $('#chatbox #local-button');
var $hoodbutton = $('#chatbox #hood-button');
var $localbadge = $("#local-button #local-badge");

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
	
	displayMessage: function(msg, userID, type){
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
		Localy.handleType(type);
		
		//Render message
		popup.setContent(popup._content + "<br>" + msg);
		$chatbox.children("ul").append(content);
		
		contentWrapper.animate({ scrollTop: heightToScroll }, "fast");
		$chatbox.animate({ scrollTop: $("ul#chatbody").height() }, "fast");
	},
	
	handleType: function(type){
		switch(type){
		case "local":
			if (!window.localCircle) {
				$localbadge.css({display: 'inline'});
				$localbadge.html(parseInt($localbadge.html()) + 1);				
			}
			break;
		case "remote":
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
		$localbutton.removeClass('blue', 100);
		$hoodbutton.toggleClass('blue', 100);
		map.hasLayer(geojson) ? map.removeLayer(geojson) : geojson.addTo(map);
	},
	
	leaveLocal: function(){
		if (window.localCircle !== undefined) map.removeLayer(window.localCircle);
		window.localCircle = undefined;
		$localbutton.removeClass('blue', 100);
		$chatbox.children('ul').removeClass('local');
	},
	
	joinLocal: function(){
		window.localCircle = Locator.drawCircle(window.lat, window.lon).addTo(map);
		Localy.swapChatTitle("Local");

		$chatbox.children('ul').addClass('local');		
		$localbutton.addClass('blue', 100);
		$localbadge.css({display: 'none'});
		$localbadge.html(0);
	},
	
	leaveRemote: function(){
		if (window.remoteCircle !== undefined) map.removeLayer(window.remoteCircle);
	},
	
	_myName: function(userID){
		if (userID === selfID){
			return " my-username";
		}
		return "";
	}
}

$(document).ready(function(){
	
	/* Page listeners */
	$("#name-input").keyup(function(event){
    if(event.keyCode == 13) Localy.initialize();
	});

  $('form#chat-form').submit(function(event){
			event.preventDefault();
			if (window.localCircle !== undefined){
				var bounds = MathLib.radiusBounds(window.lat, window.lon);
	    	socket.emit('radius message', $('input#chat-input').val(), socket.io.engine.id, "local", bounds);
			} else if (window.remoteCircle !== undefined) {
				var bounds = MathLib.radiusBounds(window.getLatLng().lat, window.getLatLng().lon);
	    	socket.emit('radius message', $('input#chat-input').val(), socket.io.engine.id, "remote", bounds);
			} else {
	    	socket.emit('chat message', $('input#chat-input').val(), socket.io.engine.id);
			}
			$('input#chat-input').val('');
  });
	
	$localbutton.click(function(event){
		if (window.localCircle !== undefined){
			Localy.leaveLocal();
			Localy.swapChatTitle(window.placename);
		} else {
			Localy.leaveRemote();
			Localy.joinLocal();
		}
	});
	
	$hoodbutton.click(function(event){
		Localy.leaveLocal();
		Localy.leaveRemote();
		Localy.toggleHoodLayer();
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
	socket.on('load map', Localy.loadMap);
  socket.on('user count', Localy.setUserSize);
  socket.on('chat message', Localy.displayMessage);
  socket.on('load marker', Locator.loadMarker);
  socket.on('delete marker', Locator.deleteMarker);

});
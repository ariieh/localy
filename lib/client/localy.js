'use strict';

/* Main Localy helper functions */

window.Localy = {
	/* Core launch functions */
	
	initialize: function(callback) {
		 // Show spinner, get current location, load your own marker and the map

		username = $("#name-input").val();
		
	  Locator.getLocation(function(position, placename) {
			selfID = socket.io.engine.id;
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
			if (window.testMode) {
				var randomName = Math.random().toString(36).substring(7);
				$("#name-input").val(randomName);
				$("#page-modal form").submit();
			}
	  });
	},

	/* Flash */

	flash: function(msg) {
		$("#main-flash #flash-content-wrapper").html(msg);
		$("#main-flash").fadeIn(400).delay(1600).fadeOut(400);
	},
	
	/* Map functions */
	
	toggleHoodLayer: function() {
		window.map.hasLayer(geojson) ? window.map.removeLayer(geojson) : geojson.addTo(window.map);
	},
	
	/* Legend box functions */
	
	swapChatTitle: function(roomname) {
		$("#chatroom-label").html("Chatroom: " + roomname);
		$chatroom.stop().animate({backgroundColor:'#e67e22'}, 400, function(){
		    $chatroom.animate({backgroundColor:'rgba(32, 32, 32, 0.8)'}, 400);
		});
	},
	
	setUserSize: function(size) {
		$usercount.html("Users: " + size);
	},
	
	/* Chatbox functions */

	emitMessage: function (eventName, msg, socketId, type, bounds) {
		socket.emit(eventName, msg, socketId, type, bounds);
	},
	
	displayMessage: function(msg, userID, type, bounds) {
		msg = Helper.replaceWithHTMLEntities(msg);

		var marker = markers[userID].marker;
		var username = markers[userID].username;
		var popup = marker.getPopup();
		
		var content = "<li><span class='username "
												+ Localy._myName(userID)
												+ "'>"
												+ username
												+ "</span>: <span class='message'>"
												+ msg
												+ "</span></li>";

		Localy.updateButtonBadge(type, bounds);

		//Set the correct chatbox
		var $chatboxUl = Localy._findOrCreateChatbox(type, bounds);

		//Render message
		popup.setContent(popup._content + "<br>" + msg);
		$chatboxUl.append(content);
		$chatbox.animate({ scrollTop: $chatboxUl.height() }, "fast");
	},
	
	updateButtonBadge: function(type, bounds) {
		switch(type) {
			case "local":
				if (!Localy.inLocal()) Localy.showBadge($localbadge);
				break;
				
			case window.placename:
				if (!Localy.inHood()) Localy.showBadge($hoodbadge);
				break;
				
			case "remote":
				var lat = bounds.degree.lat;
				var lon = bounds.degree.lon;
				
				var $remotebutton = Localy._$remoteButton(lat, lon);
				
				if ($remotebutton.length === 0) {
					Localy.addRemoteButton(lat, lon);
				} else {
					if (!Localy.inRemote(lat, lon)) {
						Localy.showBadge($remotebutton.children(".notification-badge"));
					}
				}
				break;
				
			}
	},
	
	clearBadge: function($badge) {
		$badge.css({display: 'none'});
		$badge.html(0);
	},
	
	showBadge: function($badge) {
		$badge.css({display: 'inline'});
		$badge.html(parseInt($badge.html()) + 1);				
	},
	
	addRemoteButton: function(lat, lon) {
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
		
		if (Localy.inRemote(lat, lon)) Localy._addBlue(Localy._$remoteButton(lat, lon));
	},
	
	/* Client-side room swapping */

	leaveAllRooms: function() {
		Localy.leaveLocal();
		Localy.leaveRemote();
		Localy.leaveHood();
	},
	
	leaveLocal: function() {
		if (Localy.inLocal()) window.map.removeLayer(window.localCircle);
		window.localCircle = undefined;
	},
	
	joinLocal: function() {
		window.localCircle = Locator.drawCircle(window.lat, window.lon).addTo(window.map);
		Localy.swapChatTitle("Local");
		Localy.clearBadge($localbadge);
		Localy._swapActiveUl("local");
	},
	
	leaveRemote: function() {
		if (window.remoteCircle !== undefined) window.map.removeLayer(window.remoteCircle);
		window.remoteCircle = undefined;
	},
	
	joinRemote: function(lat, lon) {
		Localy.swapChatTitle(lat.toFixed(7) + ", " + lon.toFixed(7));
		window.remoteCircle = Locator.drawCircle(lat, lon).addTo(window.map);
		Localy._swapActiveUl("remote", {"degree": {"lat": lat, "lon": lon} });
	},

	leaveHood: function() {},

	joinHood: function(hood) {
		Localy.swapChatTitle(window.placename);
		Localy._swapActiveUl(hood);
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
	},
	
	_$remoteButton: function(lat, lon) {
		return $(".remote-button[lat='" + lat + "'][lon='" + lon + "']");
	},
	
	_addBlue: function($el) {
		if (!$el.hasClass('blue')) {
			$el.addClass('blue', 100);
			$el.siblings('.blue').removeClass('blue');
			Localy.clearBadge($el.children('.notification-badge'));
		}
	},

	_swapActiveUl: function(type, bounds) {
		$chatbox.children('ul.active').removeClass("active");
		return Localy._findOrCreateChatbox(type, bounds).addClass("active");
	},

	_findOrCreateChatbox: function(type, bounds) {
		var ulType = Localy._typeClass(type, bounds);
		var $chatboxUl = $("#chatbox").children("ul." + ulType);

		if ($chatboxUl.length === 0) {
			$chatboxUl = $("<ul class='" + ulType + "'></ul>");
			$chatbox.append($chatboxUl);
		}

		return $chatboxUl;
	}
}

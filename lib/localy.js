'use strict';

/* Main Localy helper functions */

window.Localy = {
	/* Core launch functions */
	
	initialize: function() {
		 // Show spinner, get current location, load your own marker and the map
		
		Helper.pageLoaderShow();
				
		username = $("#name-input").val();
		
	  Locator.getLocation(function(position, placename) {
			selfID = socket.io.engine.id;
			window.lat = position[0];
			window.lon = position[1];
			window.placename = placename;
			
			socket.emit('load marker', position, username, selfID, placename);
			socket.emit('load map', selfID);
	  });
	},
	
	onConnection: function() {
		 // When connected to server, auto sign in in test mode or listen for user input
		
		if (window.testMode) {
			var randomName = Math.random().toString(36).substring(7);
			$("#name-input").val(randomName);
			Localy.initialize();
		} else {
			$("#name-input").keyup(function(event){
		    if(event.keyCode == 13) Localy.initialize();
			});
		}
	},
	
	/* Map functions */
	
	loadMap: function(users) {
		for (var i = 0; i < users.length; i++) {
			var user = users[i];
			if (user.socket_id !== selfID) Locator.loadMarker(user);
		}

    $("#page-modal").fadeOut("slow");
		// map.addLayer(clusters);
	},
	
	toggleHoodLayer: function() {
		map.hasLayer(geojson) ? map.removeLayer(geojson) : geojson.addTo(map);
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
	
	displayMessage: function(msg, userID, type, bounds) {
		msg = Helper.replaceWithHTMLEntities(msg);
		
		var marker = markers[userID].marker;
		var username = markers[userID].username;
		var popup = marker.getPopup();
		
		var contentBody = $("span[id='popup-header-" + userID + "']").parent();
		var heightToScroll = contentBody.height();
		var contentWrapper = contentBody.parent();

		var content = "<li class='"
												+ Localy._msgLiClass(type, bounds)
												+ "'><span class='username "
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
		$chatboxUl.append(content);
		
		contentWrapper.animate({ scrollTop: heightToScroll }, "fast");
		$chatbox.animate({ scrollTop: $("ul#chatbody").height() }, "fast");
	},
	
	handleType: function(type, bounds) {
		switch(type) {
			case "local":
				if (!Localy._inLocal()) Localy.showBadge($localbadge);
				break;
				
			case window.placename:
				if (!Localy._inHood()) Localy.showBadge($hoodbadge);
				break;
				
			case "remote":
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
		
		if (Localy._inRemote(lat, lon)) {
			Localy._addBlue(Localy._$remoteButton(lat, lon));
		}
	},
	
	/* Client-side room swapping */

	leaveAllRooms: function() {
		Localy.leaveLocal();
		Localy.leaveRemote();
		Localy.leaveHood();
	},
	
	leaveLocal: function() {
		if (Localy._inLocal()) map.removeLayer(window.localCircle);
		window.localCircle = undefined;
		$chatboxUl.removeClass();
	},
	
	joinLocal: function() {
		window.localCircle = Locator.drawCircle(window.lat, window.lon).addTo(map);
		Localy.swapChatTitle("Local");
		Localy.clearBadge($localbadge);
		$chatboxUl.addClass('local');
	},
	
	leaveRemote: function() {
		if (window.remoteCircle !== undefined) map.removeLayer(window.remoteCircle);
		window.remoteCircle = undefined;
		$chatboxUl.removeClass();
	},
	
	joinRemote: function(lat, lon) {
		window.remoteCircle = Locator.drawCircle(lat, lon).addTo(map);
		$chatboxUl.addClass(bounds.degree.lat + "-" + bounds.degree.lon);
	},

	leaveHood: function() {
		$chatboxUl.removeClass();
	},

	joinHood: function(hood) {
		$chatboxUl.addClass(hood);
	},
			
	/* Useful helper functions */
	
	_myName: function(userID) {
		return userID === selfID ? "my-username" : "";
	},
	
	_msgLiClass: function(type, bounds) {
		var liClass = "";
		
		if (type === "local" || type === window.placename) {
			liClass = type;
		} else if (type === "remote") {
			liClass = bounds.degree.lat + "-" + bounds.degree.lon;
		}

		return liClass;
	},
	
	_$remoteButton: function(lat, lon) {
		return $(".remote-button[lat='" + lat + "'][lon='" + lon + "']");
	},
	
	_inLocal: function() {
		return (window.localCircle !== undefined);
	},
	
	_inHood: function() {
		return !(window.localCircle || window.remoteCircle);
	},
	
	_inRemote: function(lat, lon) {
		if (window.remoteCircle === undefined) {
			return false;
		}
			return window.remoteCircle.getLatLng().lat === lat && window.remoteCircle.getLatLng().lng === lon;
	},
	
	_addBlue: function($el) {
		if (!$el.hasClass('blue')) {
			$el.addClass('blue', 100);
			$el.siblings('.blue').removeClass('blue');
			Localy.clearBadge($el.children('.notification-badge'));
		}
	}
}

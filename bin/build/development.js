'use strict';

/* Source, modified: https://www.mapbox.com/blog/neighborhood-mapping-with-dynamic-vector-data-layers/ */
/* Styles the neighborhood swapping */

// Set base style of vector data
function style(feature) {
  return {
    weight: 2,
    fillOpacity: 0,
    fillColor: '#ccc',
		color: '#ccc'
  };
}

// Set hover colors
function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 4,
    opacity: 1,
    color: '#000',
    dashArray: '3',
    fillOpacity: 0.5,
    fillColor: '#95a5a6'
  });
}

//Swap neighborhood room
function swapHoodRoom(feature) {
	Localy.leaveLocal();
	
	var placename = feature.properties.NTAName;
	
	Localy.toggleHoodLayer();
	window.socket.emit('swap room', selfID, placename);	
}

// A function to reset the colors when a neighborhood is not longer 'hovered'
function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

// Tell MapBox.js what functions to call when mousing over and out of a neighborhood
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
		click: function(event) { swapHoodRoom(feature) }
  });
}

'use strict';

/* Misc helper functions */

window.Helper = {
	replaceWithHTMLEntities: function(str) {
		return String(str)
									.replace(/&/g, '&amp;')
									.replace(/</g, '&lt;')
									.replace(/>/g, '&gt;')
									.replace(/"/g, '&quot;')
									.replace(/'/g,'&apos;');
	},
	
	pageLoaderShow: function() {
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
	}
}

'use strict';

/* Math library */

window.MathLib = {
	degToRad: function(deg) {
		return deg * (Math.PI / 180);
	},
	
	radToDeg: function(rad) {
		return rad * (180 / Math.PI);
	},
	
	radiusBounds: function(degLat, degLon) {
		var radLat = MathLib.degToRad(degLat);
		var radLon = MathLib.degToRad(degLon);
		
		var earthRadius = 3959;
		var localRadius = 0.02;
		
		var latDelta = localRadius / earthRadius;
		var lonDelta = Math.asin(Math.sin(latDelta) / Math.cos(radLat));
		
		var minLat = radLat - latDelta;
		var maxLat = radLat + latDelta;
		
		var minLon = radLon - lonDelta;
		var maxLon = radLon + lonDelta;
		
		return {radian: {
							lat: radLat,
							lon: radLon,
							minLat: minLat,
							maxLat: maxLat,
							minLon: minLon,
							maxLon: maxLon,
							latDelta: latDelta
						},
						degree: {
							lat: degLat,
							lon: degLon
						}
				};
	},
	
	distance: function(coords1, coords2) {
		//Haversine formula: http://andrew.hedges.name/experiments/haversine/

		var lat1 = MathLib.degToRad(coords1[0]);
		var lon1 = MathLib.degToRad(coords1[1]);
		var lat2 = MathLib.degToRad(coords2[0]);
		var lon2 = MathLib.degToRad(coords2[1]);
		
		var dlon = lon2 - lon1;
		var dlat = lat2 - lat1;
		
		var a = Math.pow((Math.sin(dlat / 2)), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow((Math.sin(dlon / 2)), 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		
		return 3959 * c;
	}
}

'use strict';

/* Leaflet interaction and geolocate library */

var userMarker = L.Marker.extend({
	options: {
		userID: ""
	}
});

window.Locator = {
	baseMaps: {Pencil: L.tileLayer("https://a.tiles.mapbox.com/v4/examples.a4c252ab/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Comic: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.bc17bb2a/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Pirate: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.a3cad6da/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Zombie: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.fb8f9523/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"),
	Jane: L.tileLayer("https://b.tiles.mapbox.com/v4/examples.c7d2024a/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q")},
	
	getLocation: function(callback) {
		if (navigator.onLine && !window.testMode) {
	    navigator.geolocation.getCurrentPosition(function(position) {
				Locator.retrieveLocation(position, callback);
	    });
		} else {
			Locator.retrieveLocation({coords: {latitude: 40.718428, longitude: -73.991319}}, callback);
		}
	},
	
	retrieveLocation: function(position, callback) {
		position = [position.coords.latitude, position.coords.longitude];
		var places = leafletPip.pointInLayer([position[1], position[0]], geojson);
		var placename = places.length > 0 ? places[0].feature.properties.NTAName : "";

		window.legendView.swapChatTitle(placename);
		
		window.map.setView(position, 17);
		callback(position, placename);
	},
		
	deleteMarker: function(userID) {
		window.map.removeLayer(markers[userID].marker);
		delete markers[userID];
	},
	
	drawCircle: function(lat, lon) {
		return L.circle([lat, lon], 32.1869, {
						weight: 1,
						opacity: 0.5,
						fillOpacity: 0.4,
						color: '#3498db'
		});
	}		
}

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
			var socketId = window.socket.io.engine.id;

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
	window.socket.on('connected', Localy.onConnection);
  window.socket.on('user count', Localy.setUserSize);
  window.socket.on('chat message', Localy.displayMessage);
  window.socket.on('delete marker', Locator.deleteMarker);
});

'use strict';

/* Main Localy helper functions */

window.Localy = {
	/* Core launch functions */
	
	initialize: function(callback) {
		 // Show spinner, get current location, load your own marker and the map

		username = $("#name-input").val();
		
	  Locator.getLocation(function(position, placename) {
			selfID = window.socket.io.engine.id;
			window.lat = position[0];
			window.lon = position[1];
			window.placename = placename;

			window.socket.emit('load marker', position, username, selfID, placename);
			window.socket.emit('load map', selfID);

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
		window.socket.emit(eventName, msg, socketId, type, bounds);
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
		window.legendView.swapChatTitle("Local");
		Localy.clearBadge($localbadge);
		Localy._swapActiveUl("local");
	},
	
	leaveRemote: function() {
		if (window.remoteCircle !== undefined) window.map.removeLayer(window.remoteCircle);
		window.remoteCircle = undefined;
	},
	
	joinRemote: function(lat, lon) {
		window.legendView.swapChatTitle(lat.toFixed(7) + ", " + lon.toFixed(7));
		window.remoteCircle = Locator.drawCircle(lat, lon).addTo(window.map);
		Localy._swapActiveUl("remote", {"degree": {"lat": lat, "lon": lon} });
	},

	leaveHood: function() {},

	joinHood: function(hood) {
		window.legendView.swapChatTitle(window.placename);
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

window.LocalyBackbone = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function(callback) {
    //Initialize users collection
    LocalyBackbone.Collections.users = new LocalyBackbone.Collections.Users();

    //Set up router
    LocalyBackbone.Routers.router = new LocalyBackbone.Routers.Router({
      $flashEl: $("div#main-flash"),
      $legendEl: $("div#legend-box"),
      $mapEl: $("div#map"),
      $chatboxEl: $('div#chatbox'),
      $pageModalEl: $("div#page-modal")
    });

    Backbone.history.start();
    callback();
  }
};

LocalyBackbone.SocketView = Backbone.View.extend({
  initialize: function () {
    this.socketInitialize();
  },

  socketInitialize: function () {
    if (this.socket_events && _.size(this.socket_events) > 0) {
      this.delegateSocketEvents(this.socket_events);
    }
  },

  delegateSocketEvents: function (events) {
    for (var key in events) {
      var method = events[key];
      if (!_.isFunction(method)) {
        method = this[events[key]];
      }

      if (!method) {
        throw new Error('Method "' + events[key] + '" does not exist');
      }

      method = _.bind(method, this);
      window.socket.on(key, method);
    };
  }
});

LocalyBackbone.Collections.Users = Backbone.Collection.extend({
  model: LocalyBackbone.Models.User,
  url: "/api/users"
});

LocalyBackbone.Models.User = Backbone.Model.extend({
  urlRoot: "/api/users",

  marker: function() {
    
  }
});

LocalyBackbone.Routers.Router = Backbone.Router.extend({
  initialize: function(options){
    this.$flashEl = options.$flashEl;
    this.$legendEl = options.$legendEl;
    this.$mapEl = options.$mapEl;
    this.$chatboxEl = options.$chatboxEl;
    this.$pageModalEl = options.$pageModalEl;

    this.views = {};
  },

  routes: {
    "": "main",
    "chat": "chat"
  },

  main: function () {
    var pageModalView = new LocalyBackbone.Views.PageModal({
      $containerEl: this.$pageModalEl
    });
    
    this._swapView(pageModalView);
  },

  chat: function() {
    var flashView = new LocalyBackbone.Views.MainFlash({
      $containerEl: this.$flashEl
    });

    var legendView = new LocalyBackbone.Views.Legend({
      $containerEl: this.$legendEl
    });

    var mapView = new LocalyBackbone.Views.Map({
      $containerEl: this.$mapEl
    });

    var chatboxView = new LocalyBackbone.Views.Chatbox({
      $containerEl: this.$chatboxEl
    });

    this._swapView(flashView);
    this._swapView(legendView);
    mapView.render();
    this._swapView(chatboxView);

    Localy.initialize(function() {
      $("#page-modal").fadeOut("slow");
    });
  },

  _swapView: function(view){
    var $el = view.$containerEl;

    if (this.views[$el]){
      this._removeSubviews(this.views[$el]);
      this.views[$el].remove();
    }

    $el.html(view.render().$el);
    this.views[$el] = view;
  },

  _removeSubviews: function(view) {
    if (view.subviews){
      _.each(view.subviews, function(subview){
        subview.remove();
      });
    }
  }
});

function hereDoc(f) {
  
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}

window.JST = {};

window.JST['page-modal'] = _.template(hereDoc(function() {/*!
  <form>
    Name. Plz?
    <input id='name-input' type='text'></input>
    <input type='submit'></input>
  </form>
*/}));

window.JST['map/popup-header'] = _.template(hereDoc(function() {/*!
  <span class='popup-header <%= Localy._myName(socketID) %>' id='popup-header-<%= socketID %>'>
    username
  </span>
*/}));

window.JST['legend-box'] = _.template(hereDoc(function() {/*!
  <div id="chatroom" class="nifty-box">
    <span id="chatroom-label"></span>
  </div>

  <div id="user-count" class="nifty-box"></div>
*/}));

window.JST['main-flash'] = _.template("");

window.JST['chatbox'] = _.template(hereDoc(function() {/*!
  <div id="chatbox-button-wrapper">
    <div class="nifty-box chatroom-button local-button">
      Local
      <span class="notification-badge" id="local-badge">0</span>
    </div>

    <div class="nifty-box blue chatroom-button hood-button">
      'Hood
      <span class="notification-badge" id="hood-badge">0</span>
      <span class="downward-select-triangle"></span>
    </div>
  </div>

  <ul class="active"></ul>

  <form id="chat-form">
    <input type="text" id="chat-input" autocomplete="off"></input>
    <button id="send-chat-message" class="nifty-box blue">Send</button>
  </form>
*/}));

LocalyBackbone.Views.Chatbox = LocalyBackbone.SocketView.extend({
  initialize: function(options){
    this.$containerEl = options.$containerEl;
  },

  events: {
  },

  id: "chatbox-wrapper",

  template: JST["chatbox"],

  render: function () {
    var renderedContent = this.template();
    this.$el.html(renderedContent);
    return this;
  }
});

LocalyBackbone.Views.Legend = LocalyBackbone.SocketView.extend({
  initialize: function(options){
    this.$containerEl = options.$containerEl;
  },

  events: {
  },

  id: "legend-box-wrapper",

  template: JST["legend-box"],

  render: function () {
    var renderedContent = this.template();
    this.$el.html(renderedContent);
    return this;
  }
});

LocalyBackbone.Views.MainFlash = LocalyBackbone.SocketView.extend({
  initialize: function(options){
    this.$containerEl = options.$containerEl;
  },

  events: {
  },

  id: "flash-content-wrapper",

  template: JST["main-flash"],

  render: function () {
    var renderedContent = this.template();
    this.$el.html(renderedContent);
    return this;
  }
});

LocalyBackbone.Views.Map = LocalyBackbone.SocketView.extend({
  initialize: function(options){
    this.$containerEl = options.$containerEl;
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

      var renderedContent = JST["map/popup-header"]({socketID: user.socket_id});
      var popup = L.popup().setContent(renderedContent);
      markerView.marker.bindPopup(popup);
      window.map.addLayer(markerView.marker);
    } 
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

LocalyBackbone.Views.PageModal = LocalyBackbone.SocketView.extend({
  initialize: function(options){
    this.$containerEl = options.$containerEl;
  },

  events: {
    "submit form": "submit"
  },

  className: "modal-text",

  template: JST["page-modal"],

  render: function () {
    var renderedContent = this.template();
    this.$el.html(renderedContent);
    return this;
  },

  submit: function(event) {
    event.preventDefault();

    Helper.pageLoaderShow();

    LocalyBackbone.Routers.router.navigate("chat", {trigger: true});    
  }
});

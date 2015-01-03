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
  var placename = feature.properties.NTAName;
	eventManager.trigger('removeLayer', nycNeighborhoodGeojson);
  eventManager.trigger('addHoodButton', placename);
	eventManager.trigger('swapRoom', 'hood', {hood: placename});
  socket.emit('join room', placename);
}

// A function to reset the colors when a neighborhood is not longer 'hovered'
function resetHighlight(e) {
  nycNeighborhoodGeojson.resetStyle(e.target);
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
	sanitizeMessage: function(str) {
		return String(str)
									.replace(/&/g, '&amp;')
									.replace(/</g, '&lt;')
									.replace(/>/g, '&gt;')
									.replace(/"/g, '&quot;')
									.replace(/'/g,'&apos;');
	},

	jqSelector: function(str) {
		return String(str).replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
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
		if (!window.testMode && navigator.onLine) {
	    navigator.geolocation.getCurrentPosition(function(position) {
				Locator.retrieveLocation(position, callback);
	    });
		} else {
			Locator.retrieveLocation({coords: {latitude: 40.718428, longitude: -73.991319}}, callback);
		}
	},
	
	retrieveLocation: function(position, callback) {
		position = [position.coords.latitude, position.coords.longitude];
		var places = leafletPip.pointInLayer([position[1], position[0]], nycNeighborhoodGeojson);
		var placename = places.length > 0 ? places[0].feature.properties.NTAName : "";

		eventManager.trigger("setView", position, 17);
		callback(position, placename);
	}

}

'use strict';

/* Initialize socket.io on client side */
var socket = window.socket = io();

var nycNeighborhoodGeojson = L.geoJson(neighborhoods, {
  style: style,
  onEachFeature: onEachFeature
});
// var clusters = L.markerClusterGroup();

/* Test mode */
window.testMode = true;

/* Initialize event manager */
var eventManager = _.extend({}, Backbone.Events);

$(document).ready(function(){
  /* Socket listeners */
  socket.on('connected', Localy.onConnection);
  socket.on('load map', function(users) { eventManager.trigger('loadMap', users); });
  socket.on('load marker', function(user) { eventManager.trigger('loadMarker', user); });
  socket.on('user count', function(count) { eventManager.trigger('setUserSize', count); });
  socket.on('chat message', function(msgType, msg, userSocketID, msgDestination, options) { eventManager.trigger('displayMessage', msgType, msg, userSocketID, msgDestination, options) });
  socket.on('delete marker', function(userID) { eventManager.trigger('deleteMarker', userID); });
});

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

			Localy.joinHood(window.place.get("currentLocation"));
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

window.LocalyBackbone = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function(callback) {
    //Initialize place model
    window.place = new LocalyBackbone.Models.Place({
      currentLocation: '',
      currentRoomName: ''
    });

    window.user = new LocalyBackbone.Models.Place({
      socketID: '',
      username: ''
    });

    //Initialize users collection
    LocalyBackbone.Collections.users = new LocalyBackbone.Collections.Users();

    //Set up router
    LocalyBackbone.Routers.router = new LocalyBackbone.Routers.Router({
      $flashEl: $("div#main-flash"),
      $legendEl: $("div#legend-box"),
      $mapEl: $("div#map"),
      $chatboxEl: $('div#chatbox'),
      $pageModalEl: $("div#page-modal"),
      eventManager: eventManager
    });

    Backbone.history.start();
    callback();
  }
};

LocalyBackbone.LocalyView = Backbone.View.extend({
  initialize: function(options) {
    this.init(options);
    this.eventManagerInitialize();
  },

  eventManagerInitialize: function() {
    if (this.global_events && _.size(this.global_events) > 0) {
      this.bindEvents(this.eventManager, this.global_events);
    }
  },

  bindEvents: function(boundObject, events) {
    for (var key in events) {
      var method = events[key];

      if (!_.isFunction(method)) method = this[events[key]];
      if (!method) throw new Error('Method "' + events[key] + '" does not exist');

      method = _.bind(method, this);
      boundObject.on(key, method);
    };
  }
});

LocalyBackbone.Collections.Users = Backbone.Collection.extend({
  model: LocalyBackbone.Models.User,
  url: "/api/users"
});

LocalyBackbone.Models.Place = Backbone.Model.extend({
});

LocalyBackbone.Models.User = Backbone.Model.extend({
  urlRoot: "/api/users"
});

LocalyBackbone.Routers.Router = Backbone.Router.extend({
  initialize: function(options){
    this.$flashEl = options.$flashEl;
    this.$legendEl = options.$legendEl;
    this.$mapEl = options.$mapEl;
    this.$chatboxEl = options.$chatboxEl;
    this.$pageModalEl = options.$pageModalEl;

    this.views = {};

    this.eventManager = options.eventManager;
  },

  routes: {
    "": "main",
    "chat": "chat"
  },

  main: function () {
    var pageModalView = new LocalyBackbone.Views.PageModal({
      $containerEl: this.$pageModalEl,
      eventManager: this.eventManager
    });
    
    this._swapView(pageModalView);
  },

  chat: function() {
    var flashView = new LocalyBackbone.Views.MainFlash({
      $containerEl: this.$flashEl,
      eventManager: this.eventManager
    });

    var legendView = new LocalyBackbone.Views.Legend({
      $containerEl: this.$legendEl,
      eventManager: this.eventManager
    });

    var mapView = new LocalyBackbone.Views.Map({
      $containerEl: this.$mapEl,
      eventManager: this.eventManager
    });

    var chatboxView = new LocalyBackbone.Views.Chatbox({
      $containerEl: this.$chatboxEl,
      eventManager: this.eventManager
    });

    mapView.render();
    this._swapView(flashView);
    this._swapView(legendView);
    this._swapView(chatboxView);

    Localy.initialize($("#name-input").val(), function() {
      $("#page-modal").fadeOut("slow");
    });
  },

  _swapView: function(view){
    var $el = view.$containerEl;
    var hashView = this.views[$el.selector];

    if (hashView !== undefined) {
      this._removeSubviews(hashView);
      hashView.remove();
    }

    $el.html(view.render().$el);
    this.views[$el.selector] = view;
  },

  _removeSubviews: function(view) {
    if (view.subviews) {
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

window.JST = {
  'page-modal': _.template(hereDoc(function() {/*!
  <form>
    Name. Plz?
    <input id='name-input' type='text'></input>
    <input type='submit'></input>
  </form>
*/})),

  'popup-header': _.template(hereDoc(function(username, socketID) {/*!
  <span class='popup-header <%= Localy._myName(socketID) %>' socket-id='<%= socketID %>' username='<%= username %>'>
    <%= username %>
  </span>
  <span class='icon-comment'></span>
*/})),

  'popup-content': _.template(hereDoc(function(username, msg, userSocketID) {/*!
  <li>
    <span class='username <%= Localy._myName(userSocketID)%>'><%= username %> </span>: <span class='message'><%= msg %></span>
  </li>
*/})),

  'legend-box': _.template(hereDoc(function() {/*!
  <div id="chatroom" class="nifty-box">
    <span id="chatroom-label"></span>
  </div>

  <div id="user-count" class="nifty-box"></div>
*/})),

  'main-flash': _.template(""),

  'chatbox': _.template(hereDoc(function() {/*!
  <div id="chatbox-button-wrapper">
    <div class="nifty-box chatroom-button local-button" type='local'>
      Local
      <span class="notification-badge" id="local-badge">0</span>
    </div>

    <div class="nifty-box blue chatroom-button hood-button" hood='<%= window.place.get("currentLocation") %>' type='hood'>
      'Hood
      <span class="notification-badge" id="hood-badge">0</span>
    </div>
  </div>

  <ul class="active"></ul>

  <form id="chat-form">
    <input type="text" id="chat-input" autocomplete="off"></input>
    <button id="send-chat-message" class="nifty-box blue">Send</button>
  </form>
*/})),

  'remote-button': _.template(hereDoc(function(lat, lon) {/*!
    <div class='nifty-box chatroom-button remote-button' lat=<%= lat %> lon=<%= lon %> type='remote'>
      Remote: <%= lat.toFixed(2) + ", " + lon.toFixed(2) %>
      <span style='display: inline' class='notification-badge'>1</span>
      <span class='close-button'>&#10006;</span>
    </div>
  */})),

  'other-hood-button': _.template(hereDoc(function(hood) {/*!
    <div class='nifty-box chatroom-button other-hood-button' hood='<%= hood %>' type='hood'>
      <%= hood %>
      <span style='display: inline' class='notification-badge'>0</span>
      <span class='close-button'>&#10006;</span>
    </div>
  */})),

  'individual-button': _.template(hereDoc(function(socketID, username) {/*!
    <div class='nifty-box chatroom-button individual-button' socket-id='<%= socketID %>' username='<%= username %>' type='individual'>
      <%= username %>
      <span style='display: inline' class='notification-badge'>1</span>
      <span class='close-button'>&#10006;</span>
    </div>
  */}))

};

LocalyBackbone.Views.Chatbox = LocalyBackbone.LocalyView.extend({
  init: function(options){
    this.$containerEl = options.$containerEl;
    this.eventManager = options.eventManager;
    this.listenTo(window.place, "change:currentLocation", this.setCurrentHoodAttributes);
    this.listenTo(window.place, "change:currentRoomName", this.swapChatTitle);
  },

  events: {
    "submit #chat-form": "submitMessage",
    "click .chatroom-button": "clickChatroomButton",
    "click .close-button": "clickCloseButton"
  },

  global_events: {
    "displayMessage": "displayMessage",
    "swapActiveChat": "_swapActiveUl",
    "clearBadge": "clearBadge",
    "addRemoteButton": "addRemoteButton",
    "addIndividualButton": "addIndividualButton",
    "addHoodButton": "addHoodButton",
    "swapRoom": "swapRoom"
  },

  id: "chatbox-wrapper",

  template: JST["chatbox"],

  render: function () {
    var renderedContent = this.template();
    this.$el.html(renderedContent);
    return this;
  },

  submitMessage: function(event) {
    event.preventDefault();

    var eventName, msgDestination;
    var options = {
      lat: window.lat,
      lon: window.lon
    };
    var msg = $('input#chat-input').val();
    var socketID = socket.io.engine.id;
    var roomType = this._getActiveRoomButton().attr("type");

    switch(roomType) {
      case "local":
        eventName = "radius message";
        msgDestination = "local";
        break;
      case "remote":
        options.lat = window.remoteCircle.getLatLng().lat;
        options.lon = window.remoteCircle.getLatLng().lng;
        eventName = "radius message";
        msgDestination = "remote";
        break;
      case "hood":
        eventName = "hood message";
        msgDestination = window.place.get("currentRoomName");
        break;
      case "individual":
        eventName = "individual message";
        msgDestination = this._getActiveRoomButton().attr("socket-id");
        options.fromUsername = window.user.get("username");
        options.toUsername = this._getActiveRoomButton().attr("username");
        break;
    }

    this.emitMessage(eventName, msg, socketID, msgDestination, options);
    
    $('input#chat-input').val('');
  },

  clickCloseButton: function(event) {
    event.stopPropagation();
    var $button = $(event.currentTarget).parent();
    if ($button.is(".hood-button,.other-hood-button")) {
      window.socket.emit("leave room", $button.attr("hood"));
    }
    $button.fadeOut(150, function(){
      $button.remove();
    });
  },

  clickChatroomButton: function(event) {
    var $button = $(event.currentTarget);
    var type = $button.attr("type");
    var options = {};

    this._addBlue($button);

    switch(type){
      case "hood":
        options.hood = $button.attr("hood");
        break;
      case "remote":
        options.lat = Number($button.attr("lat"));
        options.lon = Number($button.attr("lon"));
        break;
      case "individual":
        options.socketID = $button.attr("socket-id");
        options.username = $button.attr("username");
        break;
    }

    this.swapRoom(type, options);
  },

  swapRoom: function(type, options) {
    Localy.leaveAllRooms();

    switch(type){
      case "local":
        Localy.joinLocal();
        break;
      case "hood":
        Localy.joinHood(options.hood);
        break;
      case "remote":
        Localy.joinRemote(options.lat, options.lon);
        break;
      case "individual":
        Localy.joinIndividual(options.socketID, options.username);
        break;
    }
  },

  setCurrentHoodAttributes: function() {
    var hood = window.place.get("currentLocation");
    eventManager.trigger("swapChatTitle", hood);
    $(".hood-button").attr("hood", hood);
  },

  swapChatTitle: function() {
    eventManager.trigger("swapChatTitle", window.place.get("currentRoomName"));
  },

  emitMessage: function (eventName, msg, socketId, msgDestination, options) {
    window.socket.emit(eventName, msg, socketId, msgDestination, options);
  },

  displayMessage: function(msgType, msg, userSocketID, msgDestination, options) {
    msg = Helper.sanitizeMessage(msg);

    var markerView;
    eventManager.trigger("getUserMarker", userSocketID, function(marker){
      markerView = marker;
    });
    var marker = markerView.marker;
    var username = markerView.username();
    var popup = marker.getPopup();
    var content = JST["popup-content"]({username: username, msg: msg, userSocketID: userSocketID});
    var $chatbox = $("div#chatbox");

    this.updateButton(msgType, msgDestination, options);

    //Set the correct chatbox list
    var $chatboxUl = this._findOrCreateChatbox(msgDestination, options);

    //Render message
    popup.setContent(popup._content + "<br>" + msg);
    $chatboxUl.append(content);
    $chatbox.animate({ scrollTop: $chatboxUl.height() }, "fast");
  },

  updateButton: function(msgType, msgDestination, options) {
    var $localbadge = $(".local-button #local-badge");
    var $hoodbadge = $(".hood-button #hood-badge");
    
    switch(msgType) {
      case "radius":
        switch(msgDestination) {
          case "local":
            if (!Localy.inLocal()) this.showBadge($localbadge);
            break;
          case "remote":
            var lat = options.lat;
            var lon = options.lon;
            var $remoteButton = this._$remoteButton(lat, lon);
            if ($remoteButton.length === 0) {
              this.addRemoteButton(lat, lon);
            } else {
              if (!Localy.inRemote(lat, lon)) {
                this.showBadge($remoteButton.children(".notification-badge"));
              }
            }
            break;
        }
        break;
      case "hood":
        if (msgDestination !== window.place.get("currentRoomName")) this.showBadge(this._$hoodBadge(msgDestination));
        break;
      case "individual":
        var fromSocketID = msgDestination.split(":")[0];
        var toSocketID = msgDestination.split(":")[1];
        var otherSocketID = fromSocketID == window.user.get("socketID") ? toSocketID : fromSocketID;
        var otherUsername = options.fromUsername == window.user.get("username") ? options.toUsername : options.fromUsername;
        var $individualButton = this._$individualButton(otherSocketID);

        if ($individualButton.length === 0) {
          this.addIndividualButton(otherSocketID, otherUsername);
        } else {
          if (!Localy.inIndividual(otherSocketID)) {
            this.showBadge($individualButton.children(".notification-badge"));
          }
        }
        break;
      }
  },

  addRemoteButton: function(lat, lon) {
    var remoteButton = window.JST['remote-button']({lat: lat, lon: lon});
    $("#chatbox-button-wrapper").append(remoteButton);
    if (Localy.inRemote(lat, lon)) this._addBlue(this._$remoteButton(lat, lon));
  },

  addIndividualButton: function(socketID, username) {
    var individualButton = window.JST['individual-button']({socketID: socketID, username: username});
    $("#chatbox-button-wrapper").append(individualButton);
    if (Localy.inIndividual(socketID)) this._addBlue(this._$individualButton(socketID));
  },

  addHoodButton: function(hood) {
    var hoodButton = window.JST['other-hood-button']({hood: hood});
    $("#chatbox-button-wrapper").append(hoodButton);
    this._addBlue(this._$hoodButton(hood));
  },

  clearBadge: function($badge) {
    $badge.css({display: 'none'});
    $badge.html(0);
  },
  
  showBadge: function($badge) {
    $badge.css({display: 'inline'});
    $badge.html(parseInt($badge.html()) + 1);
  },

  _findOrCreateChatbox: function(type, options) {
    var ulType = Localy._typeClass(type, options);
    var $chatboxUl = this.$containerEl.find("ul[type='" + ulType + "']");

    if ($chatboxUl.length === 0) {
      $chatboxUl = $("<ul type='" + ulType + "'></ul>");
      this.$containerEl.find("#chatbox-wrapper").append($chatboxUl);
    }

    return $chatboxUl;
  },

  _swapActiveUl: function(type, options) {
    $("#chatbox-wrapper").children('ul.active').removeClass("active");
    return this._findOrCreateChatbox(type, options).addClass("active");
  },

  _getActiveRoomButton: function() {
    return $("#chatbox").find('.chatroom-button.blue');
  },

  _addBlue: function($el) {
    if (!$el.hasClass('blue')) {
      $el.addClass('blue', 100);
      $el.siblings('.blue').removeClass('blue');
      this.clearBadge($el.children('.notification-badge'));
    }
  },

  _$remoteButton: function(lat, lon) {
    return $(".remote-button[lat='" + lat + "'][lon='" + lon + "']");
  },

  _$individualButton: function(socketID) {
    return $(".individual-button[socket-id='" + socketID + "']");
  },

  _$hoodButton: function(hood) {
    return $("div[hood='" + hood + "']");
  },

  _$hoodBadge: function(hood) {
    return this._$hoodButton(hood).find(".notification-badge");
  }
});

LocalyBackbone.Views.Legend = LocalyBackbone.LocalyView.extend({
  init: function(options){
    this.$containerEl = options.$containerEl;
    this.eventManager = options.eventManager;
    this.listenTo(window.place, "change", this.swapChatTitle(window.place.currentLocation));
  },

  global_events: {
    "swapChatTitle": "swapChatTitle",
    "setUserSize": "setUserSize"
  },

  id: "legend-box-wrapper",

  template: JST["legend-box"],

  render: function () {
    var renderedContent = this.template();
    this.$el.html(renderedContent);
    return this;
  },

  swapChatTitle: function(roomname) {
    var $chatroom = $("div#chatroom");
    window.place.set({currentRoomName: roomname});
    $("#chatroom-label").html("Chatroom: " + roomname);
    $chatroom.stop().animate({backgroundColor:'#e67e22'}, 400, function(){
        $chatroom.animate({backgroundColor:'rgba(32, 32, 32, 0.8)'}, 400);
    });
  },

  setUserSize: function(size) {
    var $usercount = $("div#user-count");

    $usercount.html("Users: " + size);
  }
});

LocalyBackbone.Views.MainFlash = LocalyBackbone.LocalyView.extend({
  init: function(options){
    this.$containerEl = options.$containerEl;
    this.eventManager = options.eventManager;
  },

  id: "flash-content-wrapper",

  template: JST["main-flash"],

  render: function () {
    var renderedContent = this.template();
    this.$el.html(renderedContent);
    return this;
  },

  flash: function(msg) {
    this.$el.find("#flash-content-wrapper").html(msg);
    this.$el.fadeIn(400).delay(1600).fadeOut(400);
  }
});

LocalyBackbone.Views.Map = LocalyBackbone.LocalyView.extend({
  init: function(options){
    this.$containerEl = options.$containerEl;
    this.markers = {};
    this.map = L.map('map');
    this.eventManager = options.eventManager;
  },

  global_events: {
    'loadMap': 'loadMap',
    'loadMarker': 'loadMarker',
    'setView': 'setView',
    'getUserMarker': 'getUserMarker',
    'deleteMarker': 'deleteMarker',
    'removeLayer': 'removeLayer',
    'drawCircle': 'drawCircle'
  },

  render: function () {
    Locator.baseMaps["Pencil"].addTo(this.map);
    L.control.layers(Locator.baseMaps).addTo(this.map);
    L.control.scale().addTo(this.map);
    this.map.on("zoomend", this.toggleZoomStates.bind(this));
    $("#map").on("click", ".icon-comment", function(event){
      this.startIndividualConversation(event);
    }.bind(this));
  },

  loadMap: function(users) {
    if (_.size(users) > 0) {
      _.each(users, function(user) {
        if (user.socket_id !== window.user.get("socketID")) this.loadMarker(user);
      }.bind(this));      
    }
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

      var renderedContent = JST["popup-header"]({username: user.username, socketID: user.socket_id});
      var popup = L.popup({minWidth: 100}).setContent(renderedContent);
      markerView.marker.bindPopup(popup);
      this.addLayer(markerView.marker);
    }
  },

  getUserMarker: function(userSocketID, callback) {
    callback(this.markers[userSocketID]);
  },

  deleteMarker: function(userSocketID) {
    var mapView = this.markers[userSocketID];
    this.map.removeLayer(mapView.marker);

    delete this.markers[userSocketID];
    mapView.remove();
  },

  toggleZoomStates: function() {
    var zoomLevel = this.map.getZoom();
    this.map.off("click");

    if (zoomLevel > 14) {
      this.removeLayer(nycNeighborhoodGeojson);
      this.map.on("click", this.remoteCircleClick.bind(this));
    } else if (zoomLevel > 10) {
      this.addLayer(nycNeighborhoodGeojson);
    } else {
      this.removeLayer(nycNeighborhoodGeojson);
    }
  },

  remoteCircleClick: function(event) {
    //drawCircle and join remote room on map click
    Localy.leaveAllRooms();

    var lat = event.latlng.lat;
    var lon = event.latlng.lng;

    Localy.joinRemote(lat, lon);
    eventManager.trigger("addRemoteButton", lat, lon);
  },

  drawCircle: function(type, lat, lon) {
    var circle = L.circle([lat, lon], 32.1869, {
            weight: 1,
            opacity: 0.5,
            fillOpacity: 0.4,
            color: '#3498db'
    });

    circle.addTo(this.map);

    switch(type) {
      case "local":
        window.localCircle = circle;
        break;
      case "remote":
        window.remoteCircle = circle;
        break;
    }
  },

  toggleHoodLayer: function(geojson) {
    this.map.hasLayer(geojson) ? this.removeLayer(geojson) : geojson.addTo(this.map);
  },

  setView: function(position, zoom) {
    this.map.setView(position, zoom);
  },

  addLayer: function(layer) {
    this.map.addLayer(layer);
  },

  removeLayer: function(layer) {
    if (layer !== undefined) this.map.removeLayer(layer);
  },

  startIndividualConversation: function(event) {
    var popupHeader = $(event.currentTarget).siblings(".popup-header");
    var username = popupHeader.attr("username");
    var socketID = popupHeader.attr("socket-id");

    Localy.leaveAllRooms();
    Localy.joinIndividual(socketID, username);
    eventManager.trigger("addIndividualButton", socketID, username);
  }

});

LocalyBackbone.Views.Marker = LocalyBackbone.LocalyView.extend({
  init: function() {
    this.marker = L.marker([this.model.get('latitude'), this.model.get('longitude')]);
  },

  username: function() {
    return this.model.get('username');
  }
});

LocalyBackbone.Views.PageModal = LocalyBackbone.LocalyView.extend({
  init: function(options){
    this.$containerEl = options.$containerEl;
    this.eventManager = options.eventManager;
  },

  events: {
    "submit form": "submit"
  },

  global_events: {
    "submitRandomName": "submitRandomName"
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
  },

  submitRandomName: function() {
    var randomName = Math.random().toString(36).substring(7);
    $("#name-input").val(randomName);
    $("#page-modal form").submit();
  }
});

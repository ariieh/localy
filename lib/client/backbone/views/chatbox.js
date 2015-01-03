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
    var $chatbox = $("div#chatbox");
    var markerView;
    eventManager.trigger("getUserMarker", userSocketID, function(marker) { 
      markerView = marker;
    });
    var username = (options && options.username) || markerView.username();

    // Update popup if user has a marker
    if (markerView) {
      var popup = markerView.marker.getPopup();
      popup.setContent(popup._content + "<br>" + msg);
    }

    var $chatboxUl = this._findOrCreateChatbox(msgDestination, options);
    var content = JST["popup-content"]({username: username, msg: msg, userSocketID: userSocketID});

    this.updateButton(msgType, msgDestination, options);

    //Render message
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

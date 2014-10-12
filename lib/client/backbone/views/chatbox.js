LocalyBackbone.Views.Chatbox = LocalyBackbone.LocalyView.extend({
  init: function(options){
    this.$containerEl = options.$containerEl;
    this.eventManager = options.eventManager;
  },

  events: {
    "submit #chat-form": "submitMessage",
    "click .chatroom-button": "swapRoom"
  },

  global_events: {
    "displayMessage": "displayMessage",
    "swapActiveChat": "_swapActiveUl",
    "clearBadge": "clearBadge",
    "addRemoteButton": "addRemoteButton",
    "addHoodButton": "addHoodButton"
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

    var eventName, type;
    var lat = window.lat;
    var lon = window.lon;
    var msg = $('input#chat-input').val();
    var socketId = socket.io.engine.id;

    if (Localy.inLocal()) {
      eventName = "radius message";
      type = "local";
    } else if (window.remoteCircle) {
      lat = window.remoteCircle.getLatLng().lat;
      lon = window.remoteCircle.getLatLng().lng;
      eventName = "radius message";
      type = "remote";
    } else {
      eventName = "chat message";
      type = window.currentRoomName;
    }

    this.emitMessage(eventName, msg, socketId, type, lat, lon);
    
    $('input#chat-input').val('');
  },

  swapRoom: function(event) {
    var $button = $(event.currentTarget);

    Localy.leaveAllRooms();
    this._addBlue($button);

    if ($button.is(".local-button")){
      Localy.joinLocal();
    } else if ($button.is(".hood-button")) {
      Localy.joinHood($button.attr("hood"));
    } else if ($button.is(".remote-button")) {
      var lat = Number($button.attr("lat"));
      var lon = Number($button.attr("lon")); 

      Localy.joinRemote(lat, lon);
    }
  },

  emitMessage: function (eventName, msg, socketId, type, lat, lon) {
    window.socket.emit(eventName, msg, socketId, type, lat, lon);
  },

  displayMessage: function(msg, userSocketID, type, lat, lon) {
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

    this.updateButtonBadge(type, lat, lon);

    //Set the correct chatbox
    var $chatboxUl = this._findOrCreateChatbox(type, lat, lon);

    //Render message
    popup.setContent(popup._content + "<br>" + msg);
    $chatboxUl.append(content);
    $chatbox.animate({ scrollTop: $chatboxUl.height() }, "fast");
  },

  updateButtonBadge: function(type, lat, lon) {
    var $localbadge = $(".local-button #local-badge");
    var $hoodbadge = $(".hood-button #hood-badge");
    
    switch(type) {
      case "local":
        if (!Localy.inLocal()) this.showBadge($localbadge);
        break;
        
      case "remote":
        var $remotebutton = this._$remoteButton(lat, lon);
        
        if ($remotebutton.length === 0) {
          this.addRemoteButton(lat, lon);
        } else {
          if (!Localy.inRemote(lat, lon)) {
            this.showBadge($remotebutton.children(".notification-badge"));
          }
        }
        break;

      default:
        if (type !== window.currentRoomName) this.showBadge(this._$hoodbadge(type));
        break;
      }
  },

  addRemoteButton: function(lat, lon) {
    var remoteButton = window.JST['remote-button']({lat: lat, lon: lon});

    $("#chatbox-button-wrapper").append(remoteButton);

    if (Localy.inRemote(lat, lon)) this._addBlue(this._$remoteButton(lat, lon));
  },

  addHoodButton: function(hood) {
    var hoodButton = window.JST['hood-button']({hood: hood});

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

  _findOrCreateChatbox: function(type, lat, lon) {
    var ulType = Localy._typeClass(type, lat, lon);
    var $chatboxUl = this.$containerEl.find("ul." + ulType);

    if ($chatboxUl.length === 0) {
      $chatboxUl = $("<ul class='" + ulType + "'></ul>");
      this.$containerEl.find("#chatbox-wrapper").append($chatboxUl);
    }

    return $chatboxUl;
  },

  _swapActiveUl: function(type, lat, lon) {
    $("#chatbox-wrapper").children('ul.active').removeClass("active");
    return this._findOrCreateChatbox(type, lat, lon).addClass("active");
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

  _$hoodButton: function(hood) {
    return $(".hood-button[hood='" + hood + "']");
  }
});

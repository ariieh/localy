LocalyBackbone.Views.Chatbox = LocalyBackbone.SocketView.extend({
  initialize: function(options){
    this.$containerEl = options.$containerEl;
  },

  events: {
    "submit #chat-form": "submitMessage"
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
  }
});

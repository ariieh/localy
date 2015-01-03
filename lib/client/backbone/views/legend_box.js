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
    $("div#user-count").html("Users: " + size);
  }
});

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
  },

  swapChatTitle: function(roomname) {
    $("#chatroom-label").html("Chatroom: " + roomname);
    $chatroom.stop().animate({backgroundColor:'#e67e22'}, 400, function(){
        $chatroom.animate({backgroundColor:'rgba(32, 32, 32, 0.8)'}, 400);
    });
  }
});

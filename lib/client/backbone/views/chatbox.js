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

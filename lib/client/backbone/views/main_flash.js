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
  },

  flash: function(msg) {
    this.$el.find("#flash-content-wrapper").html(msg);
    this.$el.fadeIn(400).delay(1600).fadeOut(400);
  }
});

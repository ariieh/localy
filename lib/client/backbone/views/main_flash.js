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

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

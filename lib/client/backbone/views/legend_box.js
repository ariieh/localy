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
  }
});

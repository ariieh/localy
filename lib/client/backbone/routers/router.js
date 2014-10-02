LocalyBackbone.Routers.Router = Backbone.Router.extend({
  initialize: function(options){
    this.$flashEl = options.$flashEl;
    this.$legendEl = options.$legendEl;
    this.$mapEl = options.$mapEl;
    this.$chatboxEl = options.$chatboxEl;
    this.$pageModalEl = options.$pageModalEl;

    this.views = {};
  },

  routes: {
    "": "main",
    "chat": "chat"
  },

  main: function () {
    var pageModalView = new LocalyBackbone.Views.PageModal({
      $containerEl: this.$pageModalEl
    });
    
    this._swapView(pageModalView);
  },

  chat: function() {
    var flashView = new LocalyBackbone.Views.MainFlash({
      $containerEl: this.$flashEl
    });

    var legendView = window.legendView = new LocalyBackbone.Views.Legend({
      $containerEl: this.$legendEl
    });

    var mapView = new LocalyBackbone.Views.Map({
      $containerEl: this.$mapEl
    });

    var chatboxView = new LocalyBackbone.Views.Chatbox({
      $containerEl: this.$chatboxEl
    });

    this._swapView(flashView);
    this._swapView(legendView);
    mapView.render();
    this._swapView(chatboxView);

    Localy.initialize(function() {
      $("#page-modal").fadeOut("slow");
    });
  },

  _swapView: function(view){
    var $el = view.$containerEl;

    if (this.views[$el]){
      this._removeSubviews(this.views[$el]);
      this.views[$el].remove();
    }

    $el.html(view.render().$el);
    this.views[$el] = view;
  },

  _removeSubviews: function(view) {
    if (view.subviews){
      _.each(view.subviews, function(subview){
        subview.remove();
      });
    }
  }
});

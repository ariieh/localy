LocalyBackbone.Routers.Router = Backbone.Router.extend({
  initialize: function(options){
    this.$flashEl = options.$flashEl;
    this.$legendEl = options.$legendEl;
    this.$mapEl = options.$mapEl;
    this.$chatboxEl = options.$chatboxEl;
    this.$pageModalEl = options.$pageModalEl;

    this.views = {};

    this.eventManager = options.eventManager;
  },

  routes: {
    "": "main",
    "chat": "chat"
  },

  main: function () {
    var pageModalView = new LocalyBackbone.Views.PageModal({
      $containerEl: this.$pageModalEl,
      eventManager: this.eventManager
    });
    
    this._swapView(pageModalView);
  },

  chat: function() {
    var flashView = new LocalyBackbone.Views.MainFlash({
      $containerEl: this.$flashEl,
      eventManager: this.eventManager
    });

    var legendView = new LocalyBackbone.Views.Legend({
      $containerEl: this.$legendEl,
      eventManager: this.eventManager
    });

    var mapView = new LocalyBackbone.Views.Map({
      $containerEl: this.$mapEl,
      eventManager: this.eventManager
    });

    var chatboxView = new LocalyBackbone.Views.Chatbox({
      $containerEl: this.$chatboxEl,
      eventManager: this.eventManager
    });

    mapView.render();
    this._swapView(flashView);
    this._swapView(legendView);
    this._swapView(chatboxView);

    Localy.initialize($("#name-input").val(), function() {
      $("#page-modal").fadeOut("slow");
    });
  },

  _swapView: function(view){
    var $el = view.$containerEl;
    var hashView = this.views[$el.selector];

    if (hashView !== undefined) {
      this._removeSubviews(hashView);
      hashView.remove();
    }

    $el.html(view.render().$el);
    this.views[$el.selector] = view;
  },

  _removeSubviews: function(view) {
    if (view.subviews) {
      _.each(view.subviews, function(subview){
        subview.remove();
      });
    }
  }
});

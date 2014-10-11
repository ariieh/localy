LocalyBackbone.LocalyView = Backbone.View.extend({
  initialize: function(options) {
    this.init(options);
    this.eventManagerInitialize();
  },

  eventManagerInitialize: function() {
    if (this.global_events && _.size(this.global_events) > 0) {
      this.bindEvents(this.eventManager, this.global_events);
    }
  },

  bindEvents: function(boundObject, events) {
    for (var key in events) {
      var method = events[key];

      if (!_.isFunction(method)) method = this[events[key]];
      if (!method) throw new Error('Method "' + events[key] + '" does not exist');

      method = _.bind(method, this);
      boundObject.on(key, method);
    };
  }
});

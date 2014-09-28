LocalyBackbone.SocketView = Backbone.View.extend({
  initialize: function () {
    this.socketInitialize();
  },

  socketInitialize: function () {
    if (this.socket_events && _.size(this.socket_events) > 0) {
      this.delegateSocketEvents(this.socket_events);
    }
  },

  delegateSocketEvents: function (events) {
    for (var key in events) {
      var method = events[key];
      if (!_.isFunction(method)) {
        method = this[events[key]];
      }

      if (!method) {
        throw new Error('Method "' + events[key] + '" does not exist');
      }

      method = _.bind(method, this);
      window.socket.on(key, method);
    };
  }
});

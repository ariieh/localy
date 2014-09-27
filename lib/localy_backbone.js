var Backbone = require('Backbone');

window.Localy = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    Backbone.history.start();
  }
};

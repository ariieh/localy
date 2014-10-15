window.LocalyBackbone = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function(callback) {
    //Initialize place model
    window.place = new LocalyBackbone.Models.Place({
      currentLocation: '',
      currentRoomName: ''
    });

    //Initialize users collection
    LocalyBackbone.Collections.users = new LocalyBackbone.Collections.Users();

    //Set up router
    LocalyBackbone.Routers.router = new LocalyBackbone.Routers.Router({
      $flashEl: $("div#main-flash"),
      $legendEl: $("div#legend-box"),
      $mapEl: $("div#map"),
      $chatboxEl: $('div#chatbox'),
      $pageModalEl: $("div#page-modal"),
      eventManager: eventManager
    });

    Backbone.history.start();
    callback();
  }
};

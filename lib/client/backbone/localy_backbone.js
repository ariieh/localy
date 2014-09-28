window.LocalyBackbone = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function(callback) {
    //Initialize users collection
    LocalyBackbone.Collections.users = new LocalyBackbone.Collections.Users();

    //Initialize map
    window.map = L.map('map');
    Locator.baseMaps["Pencil"].addTo(window.map);
    L.control.layers(Locator.baseMaps).addTo(window.map);
    L.control.scale().addTo(window.map);

    //Set up router
    LocalyBackbone.Routers.router = new LocalyBackbone.Routers.Router({
      $flashEl: $("div#main-flash"),
      $legendEl: $("div#legend-box"),
      $mapEl: $("div#map"),
      $chatboxEl: $('div#chatbox'),
      $pageModalEl: $("div#page-modal")
    });

    Backbone.history.start();
    callback();
  }
};

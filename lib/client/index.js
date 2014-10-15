'use strict';

/* Initialize socket.io on client side */
var socket = window.socket = io();

var nycNeighborhoodGeojson = L.geoJson(neighborhoods, {
  style: style,
  onEachFeature: onEachFeature
});
var username, selfID;
// var clusters = L.markerClusterGroup();

/* Test mode */
window.testMode = true;

/* Initialize event manager */
var eventManager = _.extend({}, Backbone.Events);

$(document).ready(function(){
  /* Socket listeners */
  socket.on('connected', Localy.onConnection);
  socket.on('load map', function(users) { eventManager.trigger('loadMap', users); });
  socket.on('load marker', function(user) { eventManager.trigger('loadMarker', user); });
  socket.on('user count', function(count) { eventManager.trigger('setUserSize', count); });
  socket.on('chat message', function(msg, userSocketID, type, lat, lon) { eventManager.trigger('displayMessage', msg, userSocketID, type, lat, lon) });
  socket.on('delete marker', function(userID) { eventManager.trigger('deleteMarker', userID); });
});

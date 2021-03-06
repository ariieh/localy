'use strict';

/* Source, modified: https://www.mapbox.com/blog/neighborhood-mapping-with-dynamic-vector-data-layers/ */
/* Styles the neighborhood swapping */

// Set base style of vector data
function style(feature) {
  return {
    weight: 2,
    fillOpacity: 0,
    fillColor: '#ccc',
		color: '#ccc'
  };
}

// Set hover colors
function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 4,
    opacity: 1,
    color: '#000',
    dashArray: '3',
    fillOpacity: 0.5,
    fillColor: '#95a5a6'
  });
}

//Swap neighborhood room
function swapHoodRoom(feature) {
  var placename = feature.properties.NTAName;
  if (placename) {
    eventManager.trigger('removeLayer', nycNeighborhoodGeojson);
    eventManager.trigger('swapRoom', 'hood', {hood: placename});
    socket.emit('join room', placename);    
  }
}

// A function to reset the colors when a neighborhood is not longer 'hovered'
function resetHighlight(e) {
  nycNeighborhoodGeojson.resetStyle(e.target);
}

// Tell MapBox.js what functions to call when mousing over and out of a neighborhood
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
		click: function(event) { swapHoodRoom(feature) }
  });
}

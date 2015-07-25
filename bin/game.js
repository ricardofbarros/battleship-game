// Dependencies
var Board = require('Board');
var Units = require('Units');

var board = new Board() // dimensions
var units = new Units() // must specify how many units and which

units.export().forEach(function (unit) {
  board.addUnit(unit);
});

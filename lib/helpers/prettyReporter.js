// Dependencies
var units = require('../../units.json');

var emojis = {
  water: '💧',
  bombed: '💣',
  units: units
};

module.exports = function (board) {
  var replaceCharUnits = function (unit) {
    var regex = new RegExp(unit.cellRepresentation, 'gm');
    return board.replace(regex, unit.emoji);
  };

  for (var i = 0; i < units.length; i++) {
    board = replaceCharUnits(units[i]);
  }

  return board
    .replace(/0/gm, emojis.water)
    .replace(/X/gm, emojis.bombed);
};

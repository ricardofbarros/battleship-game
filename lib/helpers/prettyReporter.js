// Dependencies
var metadata = require('./metadata');

var unitEmojis = {};
metadata.units.forEach(function (obj, key) {
  unitEmojis[key] = obj.emoji;
});

var emojis = {
  water: '💧',
  bombed: '💣',
  units: unitEmojis
};

module.exports = function (board, units) {
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

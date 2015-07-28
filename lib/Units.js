// Dependencies
var metadata = require('./helpers/metadata');

function Units () {
  var unitsQuantity = metadata.settings.get('unitsQuantity');
  var units = {};

  metadata.units.forEach(function (obj, key) {
    units[key] = obj;
  });

  this.gameUnits = [];

  for (var id in unitsQuantity) {
    var qty = unitsQuantity[id];
    var c = 0;

    while (c < qty) {
      this.gameUnits.push({
        id: id,
        label: units[id].label,
        size: units[id].size,
        cellRepresentation: units[id].cellRepresentation,
        coords: {
          start: {
            x: 0,
            y: 0
          },
          end: {
            x: 0,
            y: 0
          }
        },
        emoji: units[id].emoji
      });
      c++;
    }
  }
}

Units.prototype.export = function () {
  return this.gameUnits;
};

module.exports = Units;

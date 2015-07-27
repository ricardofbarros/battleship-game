var metadata = require('./helpers/metadata');

function Units () {
  var unitsQuantity = metadata.settings.get('unitsQuantity');
  var units;

  metadata.units.forEach(function (obj, key) {
    units[key] = obj;
  });

  this.gameUnits = [];

  for (var id in unitsQuantity) {
    var qty = unitsQuantity[id];
    var c = 1;

    while (c < qty) {
      this.gameUnits.push({
        'id': id,
        'label': units[id]
      });
      c++;
    }
  }
}

Units.prototype.create = function () {
  return [].concat(this.gameUnits);
};

module.exports = Units;

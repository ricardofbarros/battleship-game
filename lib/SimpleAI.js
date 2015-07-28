// Dependencies
var metadata = require('./helpers/metadata');
var util = require('./helpers/util');

function SimpleAI (gameSettings) {
  var self = this;

  this.boardDimensions = gameSettings.boardDimensions;
  this.minUnitSize = 999;
  this.maxUnitSize = 1;

  // Get max unit size
  // and min unit size
  var units = Object.keys(gameSettings.unitsQuantity);
  units.forEach(function (unit) {
    var unitSpec = metadata.units.get(unit);

    if (unitSpec.size < self.minUnitSize) {
      self.minUnitSize = unitSpec.size;
    }

    if (unitSpec.size > self.maxUnitSize) {
      self.maxUnitSize = unitSpec.size;
    }
  });
}

SimpleAI.prototype.play = function () {
  var randomX = util.getRandomInt(0, this.boardDimensions.x - 1);
  var randomY = util.getRandomInt(0, this.boardDimensions.y - 1);

  return {
    x: randomX,
    y: randomY
  };
};

module.exports = SimpleAI;

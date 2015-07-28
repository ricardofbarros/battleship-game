// Dependencies
var metadata = require('./helpers/metadata');
var util = require('./helpers/util');

function SimpleAI (gameSettings) {
  this.boardDimensions = gameSettings.boardDimensions;
  this.unitsQty = gameSettings.unitsQuantity;
  this.minUnitSize = Infinity;
  this.maxUnitSize = 1;

  // Get min & max size of units
  this.__checkPossibleSizeOfUnits();

  // get all coords
  this.coordsToHit = getAllCoords();
}

SimpleAI.prototype.play = function () {
  // Get a random position on array of coords
  var randomPos = util.getRandomInt(0, this.coordsToHit.length - 1);

  // create coordinates object
  var coords = {
    x: this.coordsToHit[randomPos].x,
    y: this.coordsToHit[randomPos].y
  };

  // remove this position
  this.coordsToHit.splice(randomPos, 1);

  return coords;
};

SimpleAI.prototype.__checkPossibleSizeOfUnits = function () {
  var self = this;

  // Get max unit size
  // and min unit size
  var units = Object.keys(this.unitsQty);
  units.forEach(function (unit) {
    var unitSpec = metadata.units.get(unit);

    if (unitSpec.size < self.minUnitSize) {
      self.minUnitSize = unitSpec.size;
    }

    if (unitSpec.size > self.maxUnitSize) {
      self.maxUnitSize = unitSpec.size;
    }
  });
};

function getAllCoords (xAxisLimit, yAxisLimit) {
  var arr = [];

  for (var coordX = 0; coordX < xAxisLimit; coordX++) {
    for (var coordY = 0; coordY < yAxisLimit; coordY++) {
      arr.push({
        x: coordX,
        y: coordY
      });
    }
  }

  return arr;
}

module.exports = SimpleAI;

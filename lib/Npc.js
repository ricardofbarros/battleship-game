// Dependencies
var util = require('./helpers/util');
var metadata = require('./helpers/metadata');
var Unit = require('./npc/Unit');
var move = require('./npc/move');

function Npc (gameSettings, gameHistory) {
  var self = this;

  this.boardDimensions = gameSettings.boardDimensions;
  this.gameHistory = gameHistory;
  this.unitsQty = gameSettings.unitsQuantity;
  this.unitsSize = {};
  this.maxSizeUnit = 0;
  this.minSizeUnit = 999999;
  this.unitsInSight = [];
  this.currentUnitInSight = false;

  metadata.units.forEach(function (obj, key) {
    if (self.unitsQty[key] > 0) {
      if (self.maxSizeUnit < obj.size) {
        self.maxSizeUnit = obj.size;
      }

      if (self.minSizeUnit > obj.size) {
        self.minSizeUnit = obj.size;
      }

      self.unitsSize[key] = obj.size;
    }
  });

  // get all coords to hit
  this.coordsToBomb = getAllCoords(this.boardDimensions.x, this.boardDimensions.y);

  // keep track of everything we hit
  this.coordsBombed = [];
}

// Private method
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

Npc.prototype.play = function () {
  // First round
  if (this.gameHistory.length <= 1) {
    return this.getRandomCoords();
  }

  var lastAttack = this.getLastAttack();
  var unit = this.currentUnitInSight;

  // update coords
  if (lastAttack.hit && unit) {
    unit.updateCoords(lastAttack);
  }
  // Keep in track coords
  this.trackCoords(lastAttack);

  // If we destroyed a unit in the last attack
  // Confirm the kill!
  if (lastAttack.destroyed) {
    if (this.unitsSize[lastAttack.destroyed] < unit.coords.length) {
      return this.solvePerpendicularRiddle(lastAttack.destroyed);
    }

    this.currentUnitInSight = false;

    if (this.unitsInSight.length > 0) {
      this.currentUnitInSight = this.unitsInSight.pop();
      unit = this.currentUnitInSight;

      // Mock last attack
      lastAttack = {
        target: 'human',
        coords: this.currentUnitInSight.coords[0],
        hit: true,
        destroyed: false
      };
    } else {
      return this.getRandomCoords();
    }
  }

  if (lastAttack.hit) {
    // First hit!
    // Track this unit
    if (!unit) {
      // Create new unit in sight
      this.currentUnitInSight = this.newUnitInSight(lastAttack);
      unit = this.currentUnitInSight;
    }

    unit.search();

    return unit.getCoords();
  } else {
    if (!unit) {
      return this.getRandomCoords();
    }

    // If we didnt got a second hit
    // It's an edge case
    if (unit.coords.length <= 1) {
      // Invert axis & direction
      unit.invertAxis();
      unit.invertDirection();
      unit.search();

      return unit.getCoords();
    } else {
      unit.mishit++;

      if (unit.mishit <= 1 && unit.edgeCoords === '?') {
        var lastCoords = unit.coords.slice(-1);

        unit.edgeCoords = {
          x: lastCoords.x,
          y: lastCoords.y
        };

        unit.invertDirection();
        if (!unit.saneCoords()) {
          return this.solveParallelRiddle();
        }

        return unit.getCoords();
      } else {
        return this.solveParallelRiddle();
      }
    }
  }
};

Npc.prototype.getRandomCoords = function () {
  // Get a random position on array of coords
  var randomPos = util.getRandomInt(0, this.coordsToBomb.length - 1);

  var coords = {
    x: this.coordsToBomb[randomPos].x,
    y: this.coordsToBomb[randomPos].y
  };

  return coords;
};

Npc.prototype.getLastAttack = function () {
  var lastAttack = this.gameHistory.slice(-2);
  lastAttack = lastAttack.filter(function (attack) {
    return attack.target === 'human';
  });

  return lastAttack[0];
};

Npc.prototype.solveParallelRiddle = function () {
  var self = this;
  var unit = this.currentUnitInSight;

  var axis = unit.axis === 'x' ? 'y' : 'x';

  unit.coords.forEach(function (coords) {
    var newUnit = self.newUnitInSight({ coords: coords }, axis);
    self.unitsInSight.push(newUnit);
  });

  this.currentUnitInSight = this.unitsInSight.pop();

  this.currentUnitInSight.search();
  return this.currentUnitInSight.getCoords();
};

Npc.prototype.solvePerpendicularRiddle = function (unitName) {
  var unit = this.currentUnitInSight;
  var unitDestroyedCoords = [];

  var lastDestroyCoords = unit.coords[unit.coords.length - 1];
  unitDestroyedCoords.push(lastDestroyCoords);

  var unitSize = this.unitsSize[unitName];

  unit.invertDirection();

  for (var i = 1; i < unitSize; i++) {
    var lastCoords = unitDestroyedCoords[i - 1];
    unitDestroyedCoords.push(move[unit.direction](lastCoords));
  }

  var cleanCoords = unit.coords.filter(function (coords) {
    return !unitDestroyedCoords.some(function (destroyedCoords) {
      return coords.x === destroyedCoords.x && coords.y === destroyedCoords.y;
    });
  });

  var startingPoint = cleanCoords.splice(0, 1);
  startingPoint = startingPoint[0];

  var newUnit = this.newUnitInSight({ coords: startingPoint });

  cleanCoords.forEach(function (clean) {
    newUnit.updateCoords({coords: clean });
  });

  this.currentUnitInSight = newUnit;
  this.currentUnitInSight.search();
  return this.currentUnitInSight.getCoords();
};

Npc.prototype.trackCoords = function (lastAttack) {
  var removePos;
  for (var i = 0; i < this.coordsToBomb.length; i++) {
    var checkX = (this.coordsToBomb[i].x === lastAttack.coords.x);
    var checkY = (this.coordsToBomb[i].y === lastAttack.coords.y);

    if (checkX && checkY) {
      removePos = i;
      break;
    }
  }

  // Track & remove stuff
  this.coordsToBomb.splice(removePos, 1);
  this.coordsBombed.push(lastAttack.coords);
  this.removeImpossibleCoords();
};

Npc.prototype.removeImpossibleCoords = function () {
  var self = this;
  var indexesToBeRemoved = [];

  var options = {
    coordsBombed: this.coordsBombed,
    boardDimensions: this.boardDimensions,
    minSizeUnit: this.minSizeUnit
  };

  this.coordsToBomb.forEach(function (coords, index) {
    var mock = new Unit(options);

    mock.updateCoords({ coords: coords });

    if (!mock.testAll()) {
      indexesToBeRemoved.push(index);
    }
  });

  // Sort in a descending order
  indexesToBeRemoved.sort(function (a, b) { return b - a; });

  indexesToBeRemoved.forEach(function (index) {
    // remove impossible coord
    self.coordsToBomb.splice(index, 1);
  });
};

Npc.prototype.newUnitInSight = function (lastAttack, axis) {
  var options = {
    coordsBombed: this.coordsBombed,
    boardDimensions: this.boardDimensions
  };

  if (axis) {
    options.axis = axis;
  }

  var unit = new Unit(options);
  unit.updateCoords(lastAttack);

  return unit;
};

module.exports = Npc;

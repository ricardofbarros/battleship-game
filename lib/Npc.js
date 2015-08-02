// Dependencies
var util = require('./helpers/util');
var metadata = require('./helpers/metadata');
var UnitInSight = require('./npc/UnitInSight');

// TODO remove
var jsonfile = require('jsonfile');
var path = require('path');

function Npc (gameSettings, gameHistory) {
  var self = this;

  this.boardDimensions = gameSettings.boardDimensions;
  this.gameHistory = gameHistory;
  this.unitsQty = gameSettings.unitsQuantity;
  this.unitsSize = {};
  this.maxSizeUnit = 0;
  this.minSizeUnit = 999999;

  metadata.units.forEach(function (obj, key) {
    if (self.maxSizeUnit < obj.size) {
      self.maxSizeUnit = obj.size;
    }

    if (self.minSizeUnit > obj.size) {
      self.minSizeUnit = obj.size;
    }

    self.unitsSize[key] = obj.size;
  });

  this.resetContextKnowledge();

  // get all coords to hit
  this.coordsToBomb = getAllCoords(this.boardDimensions.x, this.boardDimensions.y);

  // keep track of everything we hit
  this.coordsBombed = [];

  this.riddle = false;
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

  if (unit && unit.coords.length > 1) {
    if (!lastAttack.hit && !this.riddle && unit.mishit > 1) {
      this.riddle = 'parallel';
    }

    if (unit.coords.length > this.maxSizeUnit) {
      this.riddle = 'perpendicular';
    }
  }

  // If we destroyed a unit in the last attack
  // Confirm the kill!
  if (lastAttack.destroyed) {
    if (this.unitsSize[lastAttack.destroyed] < unit.coords) {
      this.riddle = 'perpendicular';
    }

    if (this.riddle) {
      this.solveRiddle();
    }

    if (this.unitsInSight.length > 1) {
      this.currentUnitInSight = this.unitsInSight.pop();

      // TODO Fix last attack
    } else {
      this.resetContextKnowledge();
      return this.getRandomCoords();
    }
  }

  if (lastAttack.hit) {
    // First hit!
    // Track this unit
    if (!unit) {
      var options = {
        coordsBombed: this.coordsBombed,
        boardDimensions: this.boardDimensions,
        minSizeUnit: this.minSizeUnit
      };

      this.currentUnitInSight = new UnitInSight(options);
      unit = this.currentUnitInSight;
    }

    unit.saneDirection();

    return unit.getCoords();
  } else {
    if (!unit) {
      return this.getRandomCoords();
    }

    unit.mishit++;

    // if (this.riddle) {
    //   return this.solveRiddle();
    // }

    // If we didnt got a second hit
    // It's an edge case
    if (unit.coords.length <= 1) {
      // Invert axis & direction
      unit.invertAxis();
      unit.invertDirection();
      unit.saneDirection();

      return unit.getCoords();
    } else {
      // TODO maybe move to upper statement
      if (unit.edgeCoords === '?') {
        var lastCoords = unit.coords.splice(-1);

        unit.edgeCoords = {
          x: lastCoords.x,
          y: lastCoords.y
        };

        unit.invertDirection();
        unit.saneDirection();

        return unit.getCoords();
      }
    }
  }
};

Npc.prototype.getRandomCoords = function () {
  // Get a random position on array of coords
  var randomPos = util.getRandomInt(0, this.coordsToBomb.length - 1);

  if (!this.coordsToBomb[randomPos]) {
    console.log(randomPos);
    console.log(this.coordsToBomb.length);
    console.log('something');
  }

  var coords = {
    x: this.coordsToBomb[randomPos].x,
    y: this.coordsToBomb[randomPos].y
  };

  // remove this position
  this.coordsToBomb.splice(randomPos, 1);

  return coords;
};

Npc.prototype.getLastAttack = function () {
  var lastAttack = this.gameHistory.slice(-2);
  lastAttack = lastAttack.filter(function (attack) {
    if (attack.target === 'human') return true;
  });

  return lastAttack[0];
};

Npc.prototype.resetContextKnowledge = function () {
  // volatile data
  // act as context knowledge
  this.unitsInSight = [];
  this.currentUnitInSight = false;
  this.riddle = false;
};

Npc.prototype.solveRiddle = function () {
  console.log(this.riddle);

  // throw new Error();
  //
  // switch (this.riddle) {
  //   case 'parallel':
  //     return this.__solveParallelRiddle();
  //
  //   case 'perpendicular':
  //     return this.__solvePerpendicularRiddle();
  // }
};

Npc.prototype.__solveParallelRiddle = function () {

};

Npc.prototype.__solvePerpendicularRiddle = function () {

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

  // Track stuff
  this.coordsToBomb.splice(removePos, 1);
  this.coordsBombed.push(lastAttack.coords);

  jsonfile.writeFile(__dirname + '/tmpHistory.json', this.gameHistory, {spaces: 2}, function (err) {
    if (err) {
      console.log(err);
    }
  });

  var pathz = path.resolve(__dirname, '..', 'tmp', Date.now() + '.json')

  jsonfile.writeFile(pathz, this.currentUnitInSight, {spaces: 2}, function (err) {
    if (err) {
      console.log(err)
    }
  });
};

module.exports = Npc;

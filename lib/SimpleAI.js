// Dependencies
var util = require('./helpers/util');
var gridHelper = require('./helpers/grid');
var metadata = require('./helpers/metadata');

function SimpleAI (gameSettings, gameHistory) {
  var self = this;

  this.boardDimensions = gameSettings.boardDimensions;
  this.gameHistory = gameHistory;
  this.unitsQty = gameSettings.unitsQuantity;
  this.unitsSize = {};
  this.maxSizeOfUnit = 0;

  metadata.units.forEach(function (obj, key) {
    if (self.maxSizeOfUnit < obj.size) {
      self.maxSizeOfUnit = obj.size;
    }

    self.unitsSize[key] = obj.size;
  });

  this.resetContextKnowledge();

  // get all coords to hit
  this.coordsToHit = getAllCoords(this.boardDimensions.x, this.boardDimensions.y);

  // keep track of everything we hit
  this.coordsHit = [];
}

SimpleAI.prototype.play = function () {
  // Default vars
  var coords = false;
  var lastAttack = {
    hit: null,
    destroyed: null
  };

  var unit = this.currentUnitInSight;

  if (this.gameHistory.length > 1) {
    lastAttack = this.gameHistory.slice(-2);

    lastAttack = lastAttack.filter(function (attack) {
      if (attack.target === 'human') return true;
    });

    lastAttack = lastAttack[0];
  }

  if (lastAttack.hit) {
    this.coordsHit.push(lastAttack.coords);
  }

  // If we destroyed a unit in the last attack
  // Confirm the kill!
  if (lastAttack.destroyed) {
    if (this.unitsInSight.length > 1) {
      unit = this.unitsInSight.pop();
    } else {
      this.resetContextKnowledge();
    }
  }

  // If we failed an attack while we had a unit on sight
  if (lastAttack.hit === false && unit && unit.direction.length > 1) {
    console.log('enter');
    console.log(unit);
    // Wrong direction
    if (unit.direction[0] === '?') {
      // Push wrong direction to tried directions
      unit.triedDirections.push(unit.direction.substr(1));

      // Remove last coords
      unit.coords.pop();

      // set last valid coords
      lastAttack.coords = unit.coords[unit.coords.length - 1];

      // We still dont know the direction
      unit.direction = '?';
    } else {
      // Now we know the direction
      // so Why did we miss ??

      // Increment target miss
      this.targetMiss++;

      // Something is wrong
      // Rely on vertical riddle
      // algorithm to find units and
      // uncorrupt data
      if (this.targetMiss > 1) {
        return this.solveRiddle('parallel');
      }

      // We could be on the edge
      if (this.targetMiss === 1) {
        this.__edgeBoard(lastAttack);
      }
    }
  }

  // If we hit a unit but didnt destroy it while it was on sight
  if (lastAttack.hit && lastAttack.destroyed === false && unit) {
    this.hit++;

    // Something is wrong
    // Rely on horizontal riddle
    // algorithm to find units and
    // uncorrupt data
    if (this.hit >= this.maxSizeOfUnit) {
      return this.solveRiddle('perpendicular');
    }

    // If we didnt know the direction
    if (unit.direction[0] === '?') {
      // now we know !
      unit.direction = unit.direction.substr(1);
    }
  }

  return this.evaluateCoords(coords, lastAttack);
};

SimpleAI.prototype.getCoordsToAttack = function (lastAttack, options) {
  var coords;

  if (this.currentUnitInSight || (lastAttack.hit && lastAttack.destroyed === false)) {
    // get coords
    coords = this.search(lastAttack);

    // remove this position
    this.__removeCoordsFromArr(coords);
  } else {
    // Get a random position on array of coords
    var randomPos = util.getRandomInt(0, this.coordsToHit.length - 1);

    coords = {
      x: this.coordsToHit[randomPos].x,
      y: this.coordsToHit[randomPos].y
    };

    // remove this position
    this.coordsToHit.splice(randomPos, 1);
  }

  return coords;
};

SimpleAI.prototype.search = function (lastAttack) {
  var unit = this.currentUnitInSight;
  var randomDirection;
  var pos;
  var reverseDirection = false;

  // First hit
  if (!unit) {
    this.currentUnitInSight = this.__constructUnitInSight(lastAttack);
    unit = this.currentUnitInSight;
  }

  // Do we know the direction ?
  if (unit.direction[0] === '?') {
    if (unit.possibleDirections.length === 1) {
      // Set direction
      unit.direction = unit.possibleDirections[0];

      // Remove this direction from possible directions
      unit.possibleDirections = [];

      return move[unit.direction](lastAttack.coords);
    } else {
      if (unit.triedDirections.length !== 1) {
        // First time trying a direction or after
        // the second time
        pos = util.getRandomInt(0, unit.possibleDirections.length - 1);
        randomDirection = unit.possibleDirections[pos];
      } else if (unit.triedDirections.length === 1) {
        reverseDirection = this.__getReverseDirection(unit.triedDirections[0]);

        // Reverse direction exists
        if (unit.possibleDirections.indexOf(reverseDirection) >= 0) {
          // So return it
          randomDirection = reverseDirection;
          pos = unit.possibleDirections.indexOf(randomDirection);

          // Remove the rest of the possible directions
        } else {
          // Get randomly a opposite direction
          //  up: left/right
          //  left: up/down
          //  etc..
          randomDirection = this.__getDirectionRandomly(unit.triedDirections[0]);
          pos = unit.possibleDirections.indexOf(randomDirection);

          // First edge case
          if (pos < 0) {
            randomDirection = this.__getReverseDirection(randomDirection);
            pos = unit.possibleDirections.indexOf(randomDirection);
          }
        }
      }

      // Reset direction
      unit.direction = '';

      if (!reverseDirection) {
        unit.direction += '?';
      }
      unit.direction += randomDirection;

      // Remove this direction from possible directions
      unit.possibleDirections.splice(pos, 1);

      return move[randomDirection](lastAttack.coords);
    }
  } else {
    return move[unit.direction](lastAttack.coords);
  }
};

SimpleAI.prototype.__removeCoordsFromArr = function (coords) {
  for (var i = 0; i < this.coordsToHit.length; i++) {
    var checkCoords = this.coordsToHit[i];

    if (checkCoords.x === coords.x && checkCoords.y === coords.y) {
      return this.coordsToHit.splice(i, 1);
    }
  }
};

SimpleAI.prototype.__getDirectionRandomly = function (direction) {
  switch (direction) {
    case 'up':
    case 'down':
      return util.getRandomInt(0, 1) === 0 ? 'left' : 'right';

    case 'left':
    case 'right':
      return util.getRandomInt(0, 1) === 0 ? 'up' : 'down';
  }
};

SimpleAI.prototype.__getReverseDirection = function (direction) {
  switch (direction) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
};

SimpleAI.prototype.__constructUnitInSight = function (lastAttack) {
  var possibleDirections = [];
  var coords = lastAttack.coords;
  var boardDimensions = this.boardDimensions;

  // Get possible directions
  if (coords.y !== 0) {
    possibleDirections.push('left');
  }
  if (coords.x !== 0) {
    possibleDirections.push('up');
  }
  if (boardDimensions.y !== coords.y + 1) {
    possibleDirections.push('right');
  }
  if (boardDimensions.x !== coords.x + 1) {
    possibleDirections.push('down');
  }

  // Check if we already hit some of the possible directions
  // if we did remove them
  //
  // Get coords for each direction
  var check = {};
  possibleDirections.forEach(function (direction, i) {
    check[direction] = {
      pos: i,
      coords: move[direction](coords)
    };
  });
  for (var k in check) {
    var collisionCheck = this.coordsHit.some(function (c) {
      return (c.x === check[k].x && c.y === check[k].y);
    });

    if (collisionCheck) {
      // remove direction
      possibleDirections.splice(check[k].pos, 1);
    }
  }

  return {
    direction: '?',
    possibleDirections: possibleDirections,
    triedDirections: [],
    edgeCoords: '?',
    coords: [ coords ]
  };
};

SimpleAI.prototype.solveRiddle = function (type) {
  if (type === 'parallel') {
    return this.__parallelRiddle();
  }

  return this.__perpendiculaRiddle();
};

SimpleAI.prototype.__parallelRiddle = function () {
  var self = this;
  var successfulHits = this.gameHistory.filter(function (history) {
    return (history.hit);
  });

  var lastHits = successfulHits.slice(-(this.hits));

  lastHits.forEach(function (unit) {
    self.unitsInSight.push(self.__constructUnitInSight(unit));
  });

  // get a unit
  this.currentUnitInSight = this.unitsInSight.pop();

  // Reset
  this.targetMiss = 0;
  this.hit = 1;

  return this.play();
};

SimpleAI.prototype.__perpendiculaRiddle = function () {
  // TODO
};

SimpleAI.prototype.resetContextKnowledge = function () {
  // volatile data
  // act as context knowledge
  this.unitsInSight = [];
  this.currentUnitInSight = false;
  this.targetMiss = 0;
  this.hit = 0;
  this.riddle = false;
};

SimpleAI.prototype.evaluateCoords = function (coords, lastAttack) {
  var finalCoords = false;

  if (coords) {
    // Coords are inside the board
    if (gridHelper.checkInsideBoard(this.boardDimensions.x, this.boardDimensions.y, coords)) {
      finalCoords = coords;
    } else {
      // We hit a wall time to change direction
      this.__edgeBoard(lastAttack);
    }
  }

  if (!finalCoords || !coords) {
    finalCoords = this.getCoordsToAttack(lastAttack);
  }

  // check if final coords are inside board
  if (!gridHelper.checkInsideBoard(this.boardDimensions.x, this.boardDimensions.y, finalCoords)) {
    return this.evaluateCoords(finalCoords, lastAttack);
  }

  if (this.currentUnitInSight) {
    // Push coords to current Unit
    this.currentUnitInSight.coords.push(finalCoords);
  }
  return finalCoords;
};

SimpleAI.prototype.__edgeBoard = function (lastAttack) {
  var unit = this.currentUnitInSight;

  console.log('edge');

  // get last coords and add it to edgeCoords
  unit.edgeCoords = unit.coords[unit.coords.length - 1];



  // get first cords and add it like it
  // was from the last attack
  lastAttack.coords = unit.coords[0];

  console.log(unit.coords);

  var direction = unit.direction[0] === '?' ?
    unit.direction.substr(1) :
    unit.direction;

  unit.triedDirections.push(direction);

  // reverse direction
  unit.direction = this.__getReverseDirection(direction);

  // remove current direction from possible directions
  var pos = unit.possibleDirections.indexOf(unit.direction);
  unit.possibleDirections.splice(pos, 1);
};

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

var move = {
  right: function (coords) {
    return {
      x: coords.x,
      y: coords.y + 1
    };
  },
  left: function (coords) {
    return {
      x: coords.x,
      y: coords.y - 1
    };
  },
  up: function (coords) {
    return {
      x: coords.x - 1,
      y: coords.y
    };
  },
  down: function (coords) {
    return {
      x: coords.x + 1,
      y: coords.y
    };
  }
};

module.exports = SimpleAI;

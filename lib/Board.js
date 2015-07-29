// Dependencies
var gridHelper = require('./helpers/grid');
var prettyReport = require('./helpers/prettyReporter');
var util = require('./helpers/util');
var metadata = require('./helpers/metadata');

function Board (options, isPhony) {
  this.phonyBoard = (isPhony);
  this.settings = options;
  this.fastAlgorithmCollisions = 0;
  this.grid = gridHelper.generate(this.settings.boardDimensions);
  this.units = [];
  this.__availablePositions = {};
}

Board.prototype.addUnit = function (unit) {
  var coords;

  if (this.fastAlgorithmCollisions < 3) {
    // Fast algorithm
    coords = this.__getNewUnitCoordsRandomly(unit);

    // Failed getting the coordinates
    // because of a collision
    // re-try again
    if (!coords) {
      return this.addUnit(unit);
    }
  } else {
    // Slow, but bulletproof algorithm
    coords = this.__getNewUnitCoords(unit);
  }

  unit.coords = coords;

  // Store it!
  this.units.push(unit);

  // Draw the unit on the board
  this.__drawUnit(unit);
};

Board.prototype.export = function () {
  var board = JSON.stringify(this.grid);

  board = board
    .replace(/\],/gm, '\n')
    .replace(/\[/gm, '')
    .replace(/"/gm, '')
    .replace(/\]\]/, '')
    .replace(/,/gm, '  ');

  if (this.phonyBoard) {
    metadata.units.forEach(function (unit) {
      var regex = new RegExp(unit.cellRepresentation, 'gm');
      board = board.replace(regex, '0');
    });
  }

  if (this.settings.prettyBoard) {
    board = prettyReport(board, this.units);
  }

  return board.split(/\r?\n/);
};

Board.prototype.__getNewUnitCoordsRandomly = function (unit) {
  var boardDimensions = this.settings.boardDimensions;

  // Get a cell position randomly
  var randomUnitPos = {
    x: util.getRandomInt(0, boardDimensions.x - 1),
    y: util.getRandomInt(0, boardDimensions.y - 1)
  };

  // Pick a axis randomly
  var axis = util.getRandomInt(0, 1) === 1 ? 'x' : 'y';

  var unitPos = gridHelper.getUnitCoordinates(axis, randomUnitPos, unit.size, boardDimensions[axis] - 1);

  // Collision detected
  if (gridHelper.checkUnitsCollision(this.units, unitPos)) {
    // Increment the collisions detected
    this.fastAlgorithmCollisions++;

    return false;
  }

  // return unit position
  return unitPos;
};

Board.prototype.__getNewUnitCoords = function (unit) {
  var self = this;

  if (!this.__availablePositions[unit.size]) {
    this.__availablePositions[unit.size] = this.__getAllAvailablePositions(unit.size);
  }

  var allPositions = this.__availablePositions;
  var positions = allPositions[unit.size];

  // Pick a axis randomly
  // Pick an array element randomly
  // and get the final unit positions
  var randomAxis = util.getRandomInt(0, 1) === 1 ? 'x' : 'y';
  var randomPos = util.getRandomInt(0, positions[randomAxis].length - 1);

  var position = {
    start: positions[randomAxis][randomPos].start,
    end: positions[randomAxis][randomPos].end
  };

  // Remove this position
  positions[randomAxis].splice(randomPos, 1);

  // NOTE: This operation can be very expensive
  for (var unitSizes in allPositions) {
    for (var axis in allPositions[unitSizes]) {
      allPositions[unitSizes][axis].filter(function (coord) {
        return !gridHelper.checkUnitsCollision(self.units, coord);
      });
    }
  }

  return position;
};

Board.prototype.addBombLocation = function (coord) {
  var sanitizeCoord = {
    start: {
      x: coord.x,
      y: coord.y
    },
    end: {
      x: coord.x,
      y: coord.y
    }
  };

  var report = {
    hit: false,
    destroyed: false
  };

  // Get a extensive report of collision
  var collisionObj = gridHelper.checkUnitsCollision(this.units, sanitizeCoord, true);

  // A unit was hit
  if (collisionObj.collision) {
    this.grid[coord.x][coord.y] = 'H';
    report.hit = true;

    var checkUnitCoords = collisionObj.unit.coords;

    // Check if every coords were hit
    if (gridHelper.checkEveryCoordsHit(this.grid, checkUnitCoords)) {

      // Put unit state to false
      for (var i = 0; i < this.units.length; i++) {
        var unitCoords = this.units[i].coords;
        var checkStartCoords = (unitCoords.start.x === checkUnitCoords.start.x &&
                                unitCoords.start.y === checkUnitCoords.start.y);
        var checkEndCoords = (unitCoords.end.x === checkUnitCoords.end.x &&
                              unitCoords.end.y === checkUnitCoords.end.y);
        if (checkStartCoords && checkEndCoords) {
          this.units[i].state = false;
          break;
        }
      }

      report.destroyed = true;
    }
  } else {
    // Mark the spot bombed
    this.grid[coord.x][coord.y] = 'X';
  }

  // return the report of
  // the attack
  return report;
};

Board.prototype.__drawUnit = function (unit) {
  var self = this;
  var coords = gridHelper.completeCoords(unit.coords.start, unit.coords.end);

  coords.forEach(function (coord) {
    // Set the cell representation of the unit in the
    // following position
    self.grid[coord.x][coord.y] = unit.cellRepresentation;
  });
};

Board.prototype.__getAllAvailablePositions = function (unitSize) {
  var self = this;
  var xAxisLimit = this.grid.length;
  var yAxisLimit = this.grid[0].length;

  var coords = {
    x: gridHelper.generateDefaultCoordinates(xAxisLimit, yAxisLimit, 'x', unitSize),
    y: gridHelper.generateDefaultCoordinates(xAxisLimit, yAxisLimit, 'y', unitSize)
  };

  for (var axis in coords) {
    // Remove collisions
    coords[axis] = coords[axis].filter(function (coord) {
      return !gridHelper.checkUnitsCollision(self.units, coord);
    });
  }

  return coords;
};

module.exports = Board;

// Dependencies
var util = require('../helpers/util');
var gridHelper = require('../helpers/grid');

// Private methods
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

function UnitInSight (options) {
  this.coordsBombed = options.coordsBombed;
  this.boardDimensions = options.boardDimensions;
  this.minSizeUnit = options.minSizeUnit;

  this.startingCords = '?';
  this.edgeCoords = '?';
  this.axis = util.getRandomInt(0, 1) === 0 ? 'x' : 'y';
  this.axisDirection = {
    x: util.shuffle(['left', 'right']),
    y: util.shuffle(['up', 'down'])
  };
  this.direction = this.axisDirection[this.axis][0];
  this.coords = [];
  this.mishit = 0;
}

UnitInSight.prototype.getCoords = function () {
  var coords = this.coords.slice(-1);
  coords = coords[0];

  return move[this.direction](coords);
};

UnitInSight.prototype.updateCoords = function (lastAttack) {
  var coords = lastAttack.coords;

  if (this.startingCords === '?') {
    this.startingCords = coords;
  }

  this.coords.push(coords);
};

UnitInSight.prototype.invertDirection = function () {
  // reverse axisDirection[axis] array
  this.axisDirection[this.axis].reverse();

  // Set direction
  this.direction = this.axisDirection[this.axis][0];

  // Check if startingCords is in
  // the end of coords array
  var lastCoords = this.coords.slice(-1);
  if (lastCoords.x !== this.startingCords.x || lastCoords.y !== this.startingCords.y) {
    // if it isn't we need to reverse the coords array
    this.coords.reverse();
  }
};

UnitInSight.prototype.invertAxis = function () {
  this.axis = this.axis === 'x' ? 'y' : 'x';
};

UnitInSight.prototype.saneDirection = function () {
  var self = this;
  var boardDimensions = this.boardDimensions;

  var revolver = function (revolvingCylinder) {
    revolvingCylinder++;

    // Parallel riddle
    if (revolvingCylinder > 4 || isNaN(revolvingCylinder)) {
      return false;
    }

    if (revolvingCylinder !== 1) {
      self.invertDirection();
    }
    if (revolvingCylinder === 3) {
      self.invertAxis();
    }

    var checkCoords = self.getCoords();

    // First sane check - inside the board
    if (!gridHelper.checkInsideBoard(boardDimensions.x, boardDimensions.y, checkCoords)) {
      return revolver(revolvingCylinder);
    }

    // Second sane check - coords already hit
    var checkCollision = self.coordsBombed.some(function (c) {
      return (c.x === checkCoords.x && c.y === checkCoords.y);
    });
    if (checkCollision) {
      return revolver(revolvingCylinder);
    }
  };

  if (revolver(0) === false) {
    this.riddle = 'parallel';
  }
};

module.exports = UnitInSight;

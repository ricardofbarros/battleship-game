// Dependencies
var util = require('../helpers/util');
var gridHelper = require('../helpers/grid');
var move = require('./move');

function Unit (options) {
  this.coordsBombed = options.coordsBombed;
  this.boardDimensions = options.boardDimensions;
  this.minSizeUnit = options.minSizeUnit - 1;

  this.reset(options.axis);
}

Unit.prototype.reset = function (axis) {
  if (!this.startingCords) {
    this.startingCords = '?';
    this.coords = [];
  } else {
    this.coords = [this.startingCords];
  }

  this.edgeCoords = '?';
  this.axis = util.getRandomInt(0, 1) === 0 ? 'x' : 'y';
  this.axisDirection = {
    x: util.shuffle(['left', 'right']),
    y: util.shuffle(['up', 'down'])
  };
  this.axisLock = false;
  this.direction = this.axisDirection[this.axis][0];
  this.mishit = 0;

  if (axis) {
    this.axisLock = true;
    this.axis = axis;
  }
};

Unit.prototype.getCoords = function () {
  var coords = this.coords.slice(-1);
  coords = coords[0];

  return move[this.direction](coords);
};

Unit.prototype.updateCoords = function (lastAttack) {
  var coords = lastAttack.coords;

  if (this.startingCords === '?') {
    this.startingCords = coords;
  }

  this.coords.push(coords);
};

Unit.prototype.invertDirection = function () {
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

Unit.prototype.invertAxis = function () {
  if (!this.axisLock) {
    this.axis = this.axis === 'x' ? 'y' : 'x';
  }
};

Unit.prototype.saneCoords = function () {
  var self = this;
  var boardDimensions = this.boardDimensions;

  var revolver = function (revolvingCylinder) {
    revolvingCylinder++;

    if (revolvingCylinder > 2) {
      return false;
    }
    if (revolvingCylinder !== 1) {
      self.invertDirection();
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

    return true;
  };

  return revolver(0);
};

Unit.prototype.search = function () {
  var sane = this.saneCoords();

  if (!sane && !this.axisLock) {
    this.invertAxis();
    return this.saneCoords();
  }

  return true;
};

Unit.prototype.testAll = function () {
  var self = this;

  return ['x', 'y'].some(function (axis) {
    self.reset(axis);
    return self.test();
  });
};

Unit.prototype.test = function () {
  var minSizeUnit = this.minSizeUnit;

  // Fix direction
  this.invertDirection();

  for (var i = 0; i < minSizeUnit; i++) {
    if (!this.saneCoords()) {
      return false;
    }

    // Advance unit's position
    this.updateCoords({ coords: this.getCoords() });
  }

  return true;
};
module.exports = Unit;

// Dependencies
var UnitInSight = require('./UnitInSight');
var gridHelper = require('../helpers/grid');

function UnitMock (startingCords, options) {
  this.minSizeUnit = options.minSizeUnit;

  // Create a unit's mock
  this.unit = new UnitInSight(options);
  this.unit.saneCoords = mockSaneCoords.bind(this.unit);
  this.unit.updateCoords({ coords: startingCords });
}

function mockSaneCoords () {
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
}

UnitMock.prototype.test = function () {
  var unit = this.unit;
  var minSizeUnit = this.miniSizeUnit;

  return ['x', 'y'].some(function (axis) {
    unit.axis = axis;

    // Fix direction
    unit.invertDirection();

    for (var i = 0; i < minSizeUnit; i++) {
      if (!unit.saneCoords()) {
        return false;
      }

      // Advance unit's position
      unit.getCoords();
    }
  });
};

module.exports = UnitMock;

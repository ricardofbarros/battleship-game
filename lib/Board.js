// Dependencies
var gridHelper = require('./helpers/grid');
var prettyReport = require('./helpers.prettyReport');
var Options = require('./Options');

function Board (dimensions, opts) {
  // Default grid 10x10
  dimensions = dimensions || {};
  dimensions.x = dimensions.x || 10;
  dimensions.y = dimensions.y || 10;

  this.grid = gridHelper.generate(dimensions);
  this.options = new Options(opts);

  this.units = [];
}

Board.prototype.addUnit = function (unit) {
  this.units.push(unit);
};

Board.prototype.show = function () {
  var board = JSON.stringify(this.grid);

  board = board
    .replace(/\],/gm, '\n')
    .replace(/\[/gm, '')
    .replace(/"/gm, '')
    .replace(/\]\]/, '')
    .replace(/,/gm, '  ');

  if (this.options.pretty) {
    board = prettyReport(board);
  }

  return board;
};

Board.prototype.__getAvailablePositions = function (unitSize) {
  var allCoords = {
    down: gridHelper.generateDefaultCoordinates({
      x: 0,
      y: 0
    }, {
      x: this.grid.length - 1,
      y: this.grid[0].length
    }, 'x', true),

    up: gridHelper.generateDefaultCoordinates({
      x: 1,
      y: 0
    }, {
      x: this.grid.length,
      y: this.grid[0].length
    }, 'x'),

    left: gridHelper.generateDefaultCoordinates({
      x: 0,
      y: 1
    }, {
      x: this.grid.length,
      y: this.grid[0].length
    }, 'y'),

    right: gridHelper.generateDefaultCoordinates({
      x: 0,
      y: 0
    }, {
      x: this.grid.length,
      y: this.grid[0].length - 1
    }, 'y', true)
  };

  var coordsFiltered = {
    down: [],
    up: [],
    left: [],
    right: []
  };
  var baseReduction, coords;

  for (var direction in allCoords) {
    for (baseReduction in allCoords[direction]) {
      if (baseReduction >= unitSize) {
        coords = gridHelper.sanitizeCoords(direction, allCoords[direction][baseReduction], unitSize);

        // Chech collision here
        coords = coords.filter(function (coord) {
          return !gridHelper.checkUnitCollision(this.units, coord);
        });

        coordsFiltered[direction] = coordsFiltered[direction]
        .concat(coords);
      }
    }
  }

  return coordsFiltered;
};

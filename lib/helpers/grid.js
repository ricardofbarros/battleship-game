// Dependencies
var util = require('./util');

var grid = {};

grid.generate = function (dimensions) {
  var generateRow = function (size) {
    var row = [];
    for (var i = 0; i < size; i++) {
      row.push(0);
    }

    return row;
  };

  var arr = [];
  for (var y = 0; y < dimensions.y; y++) {
    arr.push(generateRow(dimensions.x));
  }

  return arr;
};

grid.completeCoords = function (start, end) {
  var coordsArr = [];

  // Start coords
  coordsArr.push({x: start.x, y: start.y});

  var axis = start.x === end.x ? 'y' : 'x';

  var axisCoords = util.count(start[axis], end[axis] - (start[axis] + 1));

  // Middle ones
  axisCoords.forEach(function (coord) {
    coordsArr.push({
      x: axis === 'x' ? coord : start.x,
      y: axis === 'y' ? coord : start.y
    });
  });

  // End coords
  coordsArr.push({x: end.x, y: end.y});

  return coordsArr;
};

grid.getUnitCoordinates = function (axis, position, unitSize, maxAxis) {
  // Starting point to do the calculus
  var startingPoint = position[axis];
  var getCoords = [];

  var startPoint = {
    x: position.x,
    y: position.y
  };
  var endPoint = {
    x: position.x,
    y: position.y
  };

  // Reset axis positions
  startPoint[axis] = 0;
  endPoint[axis] = 0;

  // Reduce the unit size since we already got a
  // valid position of the unit -> startingPoint
  unitSize--;

  if (maxAxis === startingPoint) {
    endPoint[axis] = startingPoint;
  } else {
    getCoords = util.count(startingPoint, unitSize, maxAxis);
    endPoint[axis] = getCoords[getCoords.length - 1];
  }

  if (getCoords.length === unitSize) {
    startPoint[axis] = startingPoint;
  } else {
    // reduce unit size
    unitSize -= getCoords.length;

    var getReverseCoords = util.countBackwards(startingPoint, unitSize);
    startPoint[axis] = getReverseCoords[getReverseCoords.length - 1];
  }

  return {
    start: startPoint,
    end: endPoint
  };
};

grid.checkUnitsCollision = function (units, coords) {
  var unitCoords;

  for (var i = 0; i < units.length; i++) {
    unitCoords = units[i].coords;

    var rangeX = (unitCoords.start.x <= coords.start.x && unitCoords.end.x >= coords.end.x);
    var rangeY = (unitCoords.start.y <= coords.start.y && unitCoords.end.y >= coords.end.y);
    var invertedRangeX = (unitCoords.start.x <= coords.end.x && unitCoords.end.x >= coords.start.x);
    var invertedRangeY = (unitCoords.start.y <= coords.end.y && unitCoords.end.y >= coords.start.y);

    if ((rangeX && rangeY) || (invertedRangeX && invertedRangeY)) {
      return true;
    }
  }

  return false;
};

grid.generateDefaultCoordinates = function (xAxisLimit, yAxisLimit, axis, unitSize) {
  // Base reduction
  unitSize -= 1;

  var coordsArr = [];
  var coords = {
    x: 0,
    y: 0
  };

  if (axis === 'x') {
    xAxisLimit -= unitSize;
  } else {
    yAxisLimit -= unitSize;
  }

  for (coords.x = 0; coords.x < xAxisLimit; coords.x++) {
    for (coords.y = 0; coords.y < yAxisLimit; coords.y++) {
      coordsArr.push({
        start: {
          x: coords.x,
          y: coords.y
        },
        end: {
          x: axis === 'x' ? coords.x + unitSize : coords.x,
          y: axis === 'y' ? coords.y + unitSize : coords.y
        }
      });
    }
  }

  return coordsArr;
};

grid.checkInsideBoard = function (xAxisLimit, yAxisLimit, coords) {
  return (coords.x >= 0 && (xAxisLimit - 1) >= coords.x && coords.y >= 0 && (yAxisLimit - 1) >= coords.y);
};

module.exports = grid;

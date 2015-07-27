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

grid.getCoords = function (direction, start, len) {
  switch (direction) {
    case 'right':
    case 'down':
      return util.count(start, len);
    case 'left':
    case 'up':
      return util.reverseCount(util.count(start, len));
  }
};

grid.generateDefaultCoordinates = function (position1, position2, direction, invertKeysFlag) {
  var obj = {};
  var coords = {
    x: 0,
    y: 0
  };

  for (coords.x = position1.x; coords.x < position2.x; coords.x++) {
    for (coords.y = position1.y; coords.y < position2.y; coords.y++) {
      if (!obj[coords[direction] + 1]) {
        obj[coords[direction] + 1] = [];
      }

      obj[coords[direction] + 1].push({x: coords.x, y: coords.y});
    }
  }

  if (invertKeysFlag) {
    var keys = Object.keys(obj);
    var keysReversed = Object.keys(obj).reverse();
    var tmp = obj;
    obj = {};

    keys.forEach(function (key, i) {
      obj[keysReversed[i]] = tmp[key];
    });
  }

  return obj;
};

grid.sanitizeCoords = function (direction, coords, size) {
  var operator, axis;

  switch (direction) {
    case 'left':
      operator = '-';
      axis = 'y';
      break;

    case 'right':
      operator = '+';
      axis = 'y';
      break;

    case 'up':
      operator = '-';
      axis = 'x';
      break;

    case 'down':
      operator = '+';
      axis = 'x';
      break;
  }

  return coords.map(function (coord) {
    var endObj = {
      x: coord.x,
      y: coord.y
    };

    if (operator === '+') {
      endObj[axis] = coord[axis] + size - 1;
    } else {
      endObj[axis] = coord[axis] - size + 1;
    }

    return {
      start: coord,
      end: endObj
    };
  });
};

grid.getUnitCoordinates = function (axis, position, unitSize, maxAxis) {
  // Starting point to do the calculus
  var startingPoint = position[axis];

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
  unitSize -= 1;

  var getCoords = util.count(startingPoint, unitSize, maxAxis);
  endPoint[axis] = getCoords[getCoords.length - 1];

  if (getCoords.length === unitSize) {
    startPoint[axis] = startingPoint;
  } else {
    // reduce unit size
    unitSize -= getCoords.length;

    var getReverseCoords = util.reverseCount(util.count(startingPoint, unitSize));

    startPoint[axis] = getReverseCoords[getReverseCoords.length - 1];
  }

  return {
    start: startPoint,
    end: endPoint
  };
};

grid.checkUnitsCollision = function (units, unit2) {
  var unit1;

  for (var i = 0; i < units.length; i++) {
    unit1 = units[i];

    var rangeX = (unit1.start.x <= unit2.start.x && unit1.end.x >= unit2.end.x);
    var rangeY = (unit1.start.y <= unit2.start.y && unit1.end.y >= unit2.end.y);
    var invertedRangeX = (unit1.start.x <= unit2.end.x && unit1.end.x >= unit2.start.x);
    var invertedRangeY = (unit1.start.y <= unit2.end.y && unit1.end.y >= unit2.start.y);

    if ((rangeX && rangeY) || (invertedRangeX && invertedRangeY)) {
      return true;
    }
  }

  return false;
};

module.exports = grid;

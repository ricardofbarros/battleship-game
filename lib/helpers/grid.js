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

// Private
var move = {
  right: function (start, len) {
    var arr = [];

    start = start + 1;
    len = start + len;

    for (var i = start; i < len; i++) {
      arr.push(i);
    }

    return arr;
  },
  left: function (start, len) {
    var arr = [];

    start = start - 1;
    len = start - len;

    for (var i = start; i > len; i--) {
      arr.push(i);
    }

    return arr;
  },
  up: function () { return this.left.apply(this, arguments); },
  down: function () { return this.right.apply(this, arguments); }
};

grid.moveFromCell = function (direction, start, len) {
  return move[direction](start, len);
};

module.exports = grid;

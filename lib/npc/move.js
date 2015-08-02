module.exports = {
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

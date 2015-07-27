var util = {};

util.count = function (start, len) {
  var arr = [];
  len = start + len;

  while (start < len) {
    arr.push(start++);
  }

  return arr;
};

util.reverseCount = function (arr) {
  var c = 0;

  return arr.map(function (num) {
    c++;

    return num - (c * 2) + 1;
  }).reverse();
};

util.getRandomInt = function  (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = util;

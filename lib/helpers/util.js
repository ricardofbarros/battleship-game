var nodeUtil = require('util');

var util = {};

util.count = function (start, len, max) {
  var arr = [];
  len = start + len;

  while (start < len) {
    if (max && start >= max) {
      break;
    }
    start++;
    arr.push(start);
  }

  return arr;
};

util.countBackwards = function (start, len) {
  var arr = [];
  len = start - len;

  while (start > len) {
    start--;
    arr.push(start);
  }

  return arr;
};

util.getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

util.convertLetterToNumber = function (letter) {
  var baseReduce = 'A'.charCodeAt(0);

  return letter.charCodeAt(0) - baseReduce;
};

// Extend util.inherits method
util.inherits = nodeUtil.inherits;

util.generateBoxHeader = function (text, boardDimensions) {
  var finalText = '';
  var size = parseInt(((boardDimensions.x * 3) - (text.length + 2)) / 2, 10);
  size = util.count(0, size);

  size.forEach(function (s) {
    finalText += '_';
  });

  finalText += ' ' + text + ' ';

  size.forEach(function (s) {
    finalText += '_';
  });

  return finalText;
};

util.generateBoxFooter = function (boardDimensions) {
  var finalText = '';
  var size = boardDimensions.x * 3;
  size = util.count(0, size);

  size.forEach(function (s) {
    finalText += '¯';
  });

  return finalText;
};

module.exports = util;

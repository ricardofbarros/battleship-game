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

util.generateBoxHeader = function (text, xAxisSize) {
  var finalText = '';
  xAxisSize = xAxisSize * 3;
  var size = parseInt(((xAxisSize) - (text.length + 2)) / 2, 10);
  size = util.count(0, size);

  size.forEach(function (s) {
    finalText += '_';
  });

  finalText += ' ' + text + ' ';

  size.forEach(function (s) {
    finalText += '_';
  });

  xAxisSize--;
  if (finalText.length > xAxisSize) {
    finalText = finalText.slice(0, -1);
  }

  return finalText;
};

util.generateBoxFooter = function (xAxisSize) {
  var finalText = '';
  var size = xAxisSize * 3;
  size = util.count(0, size);

  size.forEach(function (s) {
    finalText += '¯';
  });

  return finalText;
};

util.generateNumsHeader = function (xAxisSize) {
  var finalText = ' ';
  var c = 1;

  while (xAxisSize + 1 > c) {
    var cStr = c + '';

    if (cStr.length === 1) {
      finalText += '0';
    }

    finalText += c + ' ';

    c++;
  }

  return finalText;
};

util.spacePadText = function (text, lineLength) {
  var finaLineLength = lineLength - text.length;

  finaLineLength = parseInt(finaLineLength / 2, 10);

  var str = Array(finaLineLength).join(' ') + text + Array(finaLineLength).join(' ');

  var diff = lineLength - str.length;

  // if number is odd and last character is a space
  if (diff % 2 && str[str.length - 1] === ' ') {
    str += ' ';
  }

  return str;
};

util.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports = util;

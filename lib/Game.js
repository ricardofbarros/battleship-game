// Dependencies
var util = require('./helpers/util');
var EventEmitter = require('events').EventEmitter;
var InteractiveMenu = require('./InteractiveMenu');
var Board = require('./Board');
var SimpleAI = require('./SimpleAI');
var Units = require('./Units');
var metadata = require('./helpers/metadata');
var charm = require('charm');

function Game () {
  var self = this;
  var human;
  var cp;

  this.menu = new InteractiveMenu();

  // Keep track on how many rounds
  // were played
  this.roundCount = 0;
  this.on('newRound', function () {
    self.roundCount++;
  });

  this.menu.on('startGame', function () {
    self.settings = {};
    metadata.settings.forEach(function (obj, key) {
      self.settings[key] = obj;
    });

    human = {
      units: new Units(self.settings),
      board: new Board(self.settings)
    };
    cp = {
      units: new Units(self.settings),
      board: new Board(self.settings, true)
    };

    // Insert units in boards
    human.units.export().map(function (unit) {
      return human.board.addUnit(unit);
    });
    cp.units.export().map(function (unit) {
      return cp.board.addUnit(unit);
    });

    self.human = human;
    self.cp = cp;

    self.emit('ready');
  });
}

util.inherits(Game, EventEmitter);

Game.prototype.showBoard = function () {
  var self = this;

  var gameScreen = charm();
  gameScreen.pipe(process.stdout);
  gameScreen
    .reset()
    .move(0, 2);

  var cpBoard = this.cp.board.export();
  var humanBoard = this.human.board.export();

  var generateBoxHeader = function (text) {
    var finalText = '';
    var size = parseInt(((self.settings.boardDimensions.x * 3) - (text.length + 2)) / 2, 10);
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

  var generateBoxFooter = function () {
    var finalText = '';
    var size = self.settings.boardDimensions.x * 3;
    size = util.count(0, size);

    size.forEach(function (s) {
      finalText += '¯';
    });

    return finalText;
  };

  // Enemy board
  gameScreen
    .move(5, 0)
    .write(generateBoxHeader('Enemy board'));

  // Your board
  gameScreen
    .right(3)
    .write(generateBoxHeader('Your board') + '\n');

  cpBoard.forEach(function (line, i) {
    // Enemy board
    gameScreen
      .move(4, 0)
      .write('|' + line + ' |');

    // Your board
    gameScreen
      .right(2)
      .write('|' + humanBoard[i] + ' |\r');

    // New line
    gameScreen
      .down(1)
      .move(0, 0);
  });

  // Enemy board
  gameScreen
    .move(5, 0)
    .write(generateBoxFooter());

  // Your board
  gameScreen
    .right(3)
    .write(generateBoxFooter() + '\n');
};

Game.prototype.bombPosition = function () {

};

Game.prototype.computerMove = function () {

};

module.exports = Game;

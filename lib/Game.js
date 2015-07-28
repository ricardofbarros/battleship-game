// Dependencies
var util = require('util');
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
    var settings = {};
    metadata.settings.forEach(function (obj, key) {
      settings[key] = obj;
    });

    human = {
      units: new Units(settings),
      board: new Board(settings)
    };
    cp = {
      units: new Units(settings),
      board: new Board(settings)
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
  var newScreen = charm();
  newScreen.pipe(process.stdout);
  newScreen
    .reset()
    .move(0, 2);

  var cpBoard = this.cp.board.export();
  var humanBoard = this.human.board.export();

  cpBoard.forEach(function (line) {
    newScreen
      .move(4, 0)
      .write(line + '\r')
      .down(1)
      .move(0, 0);
  });

  humanBoard.forEach(function (line) {
    newScreen
      .move(4, 0)
      .write(line + '\r')
      .down(1)
      .move(0, 0);
  });
};

Game.prototype.bombPosition = function () {

};

Game.prototype.computerMove = function () {

};

module.exports = Game;

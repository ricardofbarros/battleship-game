// Dependencies
var util = require('./helpers/util');
var EventEmitter = require('events').EventEmitter;
var InteractiveMenu = require('./InteractiveMenu');
var Board = require('./Board');
var Units = require('./Units');
var metadata = require('./helpers/metadata');
var charm = require('charm');
var gridHelper = require('./helpers/grid');

function Game () {
  var self = this;
  var human;
  var cp;

  this.menu = new InteractiveMenu();

  // Whose turn is it?
  // keep track of it
  // NOTE: At the start of the game pick
  // who's first
  this.turn = util.getRandomInt(0, 1) === 0 ? 'human' : 'cp';

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

    // Keep track of all
    // coords that you bombed
    self.human.coordsHit = [];

    // Create a game screen
    self.gameScreen = charm();
    self.gameScreen.pipe(process.stdout);

    self.emit('ready');
  });
}

util.inherits(Game, EventEmitter);

Game.prototype.drawBoards = function () {
  var self = this;
  var gameScreen = this.gameScreen;

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

Game.prototype.bombPosition = function (coords) {
  var target;

  // Get target
  if (this.turn === 'human') {
    target = 'cp';
  } else {
    target = 'human';
  }

  // Add bomb location
  // if true a unit was hit
  if (this[target].board.addBombLocation(coords)) {
    // notify user somehow
  }

  // emit event that turn has changed
  this.emit('changeTurn', target);
};

Game.prototype.promptPlayerMove = function () {
  var self = this;

  var coords = {};

  var schema = {
    properties: {
      attackPosition: {
        pattern: /^[a-zA-Z]{1}[0-9]{1,2}$/,
        message: '',
        required: true,
        conform: function (value) {
          var regex = new RegExp('[a-zA-Z]{1}[0-9]{1,2}');

          if (!regex.test(value)) {
            schema.properties.attackPosition.message = 'Please use a valid position, such as "A1"';
            return false;
          }

          coords = {
            x: value.slice(0, 1).toUpperCase(),
            y: parseInt(value.slice(1), 10) - 1
          };
          coords.x = parseInt(util.convertLetterToNumber(coords.x), 10);

          var coordsAlreadyUsed = false;
          for (var i = 0; i < self.human.coordsHit.length; i++) {
            var coordsHit = self.human.coordsHit[i];

            if (coordsHit.x === coords.x && coordsHit.y === coords.y) {
              coordsAlreadyUsed = true;
              break;
            }
          }

          if (coordsAlreadyUsed) {
            schema.properties.attackPosition.message = 'You already bombed that position';
            return false;
          }

          if (!gridHelper.checkInsideBoard(self.settings.boardDimensions.x, self.settings.boardDimensions.y, coords)) {
            schema.properties.attackPosition.message = 'Please use a position that is inside the board';
            return false;
          }

          return true;
        }
      }
    }
  };

  this.prompt.get(schema, function (err) {
    if (err) {
      throw new Error('Unexpected error, please restart the app');
    }

    // Yeah this is stupid-proof ;)
    // you can't use the same coords
    // twice
    self.human.coordsHit.push(coords);

    self.bombPosition(coords);
  });
};

module.exports = Game;

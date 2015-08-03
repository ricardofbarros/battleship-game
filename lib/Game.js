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
  var npc;

  this.menu = new InteractiveMenu();

  // Whose turn is it?
  // keep track of it
  // NOTE: At the start of the game pick
  // who's first
  this.turn = util.getRandomInt(0, 1) === 0 ? 'human' : 'npc';

  this.menu.on('startGame', function () {
    self.settings = {};
    metadata.settings.forEach(function (obj, key) {
      self.settings[key] = obj;
    });

    human = {
      units: new Units(self.settings),
      board: new Board(self.settings)
    };
    npc = {
      units: new Units(self.settings),
      board: new Board(self.settings, true)
    };

    // Insert units in boards
    human.units.export().map(function (unit) {
      return human.board.addUnit(unit);
    });
    npc.units.export().map(function (unit) {
      return npc.board.addUnit(unit);
    });

    self.human = human;
    self.npc = npc;

    // Keep track of all
    // coords that you bombed
    self.human.coordsHit = [];

    // Create a game screen
    self.gameScreen = charm();
    self.gameScreen.pipe(process.stdout);

    // Game history
    self.history = [];

    // Keep track of rounds played
    self.roundsCounter = 0;

    self.emit('ready');
  });
}

util.inherits(Game, EventEmitter);

Game.prototype.cleanScreen = function () {
  this.gameScreen
    .reset()
    .move(0, 2);
};

Game.prototype.__generateBattleReportText = function () {
  var textArr = [];
  var units = this.__countAliveUnits();

  var lineSize = units.lineSize;
  var humanUnits = units.human;
  var npcUnits = units.npc;

  textArr.push('|' + util.spacePadText('== Your units ==', lineSize) + '|');

  for (var k in humanUnits) {
    textArr.push('|' + util.spacePadText(humanUnits[k].label + ' x ' + humanUnits[k].qty, lineSize) + '|');
  }

  textArr.push('|' + util.spacePadText('', lineSize) + '|');

  textArr.push('|' + util.spacePadText('== Enemy\'s units ==', lineSize) + '|');

  for (var i in npcUnits) {
    textArr.push('|' + util.spacePadText(npcUnits[i].label + ' x ' + npcUnits[i].qty, lineSize) + '|');
  }

  textArr.push(util.generateBoxFooter(lineSize / 3));

  return {
    textArr: textArr,
    lineSize: lineSize
  };
};

Game.prototype.__countAliveUnits = function () {
  var humanUnits = {};
  var npcUnits = {};
  // Medium size of battleReport
  var lineSize = 25;

  this.human.units.gameUnits.forEach(function (unit) {
    if (!humanUnits[unit.id]) {
      if (lineSize < unit.label.length) {
        lineSize = unit.label.length;
      }

      humanUnits[unit.id] = {
        label: unit.label,
        qty: 0
      };
    }

    if (unit.state) {
      humanUnits[unit.id].qty++;
    }
  });

  this.npc.units.gameUnits.forEach(function (unit) {
    if (!npcUnits[unit.id]) {
      npcUnits[unit.id] = {
        label: unit.label,
        qty: 0
      };
    }

    if (unit.state) {
      npcUnits[unit.id].qty++;
    }
  });

  return {
    human: humanUnits,
    npc: npcUnits,
    lineSize: lineSize
  };
};

Game.prototype.drawBoards = function () {
  var gameScreen = this.gameScreen;
  var npcBoard = this.npc.board.export();
  var humanBoard = this.human.board.export();
  var battleReport = this.__generateBattleReportText();

  // Enemy board
  gameScreen
    .move(6, 0)
    .write(util.generateNumsHeader(this.settings.boardDimensions.x));

  // Your board
  gameScreen
    .right(4)
    .write(util.generateNumsHeader(this.settings.boardDimensions.x) + '\r');

  gameScreen.down(1);

  // Enemy board
  gameScreen
    .move(7, 0)
    .write(util.generateBoxHeader('Enemy\'s board', this.settings.boardDimensions.x));

  // Your board
  gameScreen
    .right(6)
    .write(util.generateBoxHeader('Your board', this.settings.boardDimensions.x));

  // Battle report board
  gameScreen
    .right(4)
    .write(util.generateBoxHeader('Battle report', battleReport.lineSize / 3).slice(0, -1) + '\n');

  npcBoard.forEach(function (line, i) {
    // Enemy board
    gameScreen
      .move(4, 0)
      .write(util.alphabet[i] + ' |' + line + ' |');

    // Your board
    gameScreen
      .right(2)
      .write(util.alphabet[i] + ' |' + humanBoard[i] + ' |');

    // Battle report
    if (battleReport.textArr[i]) {
      gameScreen
        .right(2)
        .write(battleReport.textArr[i]);
    }

    // New line
    gameScreen
      .write('\r')
      .down(1)
      .move(0, 0);
  });

  // Enemy board
  gameScreen
    .move(7, 0)
    .write(util.generateBoxFooter(this.settings.boardDimensions.x).slice(0, -1));

  // Your board
  gameScreen
    .right(6)
    .write(util.generateBoxFooter(this.settings.boardDimensions.x).slice(0, -1));
};

Game.prototype.drawNewLine = function () {
  this.gameScreen.write('\n');
};

Game.prototype.announceWinner = function (winner) {
  this.gameScreen
    .move(4, 0)
    .write(winner.toUpperCase() + ' WINS');

  this.drawNewLine();
  this.drawNewLine();
  this.drawNewLine();
};

Game.prototype.drawLastAttackReport = function () {
  var self = this;
  var lastAttacks = this.history.slice(this.history.length - 2);

  lastAttacks.forEach(function (attack) {
    var msg;

    if (attack.target === 'npc') {
      msg = 'PLAYER: ';
    } else {
      msg = 'COMPUTER: ';
    }

    if (attack.hit) {
      msg += 'Attack was successfully';
      if (attack.destroyed) {
        msg += ', a unit was destroyed';
      } else {
        msg += ', a unit was hit';
      }
    } else {
      msg += 'Attack missed';
    }

    self.gameScreen
      .move(4, 0)
      .write(msg + '\r')
      .down(1)
      .move(0, 0);
  });

  this.gameScreen.down(1);
};

Game.prototype.bombPosition = function (coords) {
  var target;

  // Get target
  if (this.turn === 'human') {
    target = 'npc';
  } else {
    target = 'human';
  }

  // Add bomb location
  // and return a report
  var report = this[target].board.addBombLocation(coords);

  // Push attack to game history
  this.history.push({ target: target, coords: coords, hit: report.hit, destroyed: report.destroyed});

  // If odd
  if (this.history.length % 2) {
    // emit event that turn has changed
    this.emit('changeTurn', target);
  } else {
    this.emit('newRound', target);
  }
};

Game.prototype.promptPlayerMove = function () {
  var self = this;

  var coords = {};

  var schema = {
    properties: {
      attackPosition: {
        message: '',
        required: true,
        conform: function (value) {
          var regex = new RegExp('^[a-zA-Z]{1}[0-9]{1,2}$');

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
            schema.properties.attackPosition.message = 'Please use a position within the board\'s range';
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

// Dependencies
var figlet = require('figlet');
var createMenu = require('simple-terminal-menu');
var pkg = require('../package.json');
var util = require('./helpers/util');
var EventEmitter = require('events').EventEmitter;
var inquirer = require('inquirer');
var metadata = require('./helpers/metadata');

var menuDefaultOpts = { width: 90, x: 4, y: 2 };

function InteractiveMenu () {
  var self = this;

  this.__generateLogo(function (err) {
    if (err) {
      throw err;
    }

    self.__drawLobby();
  });
}

util.inherits(InteractiveMenu, EventEmitter);

InteractiveMenu.prototype.__drawLobby = function () {
  var self = this;

  this.interface = createMenu(menuDefaultOpts);
  this.greetings.forEach(function (greeting) {
    self.interface.writeLine(greeting);
  });
  this.interface.writeLine(' ');
  this.interface.writeLine('READY TO BOMB THE HELLOUT OF YOUR OPPONENT?');
  this.interface.writeSeparator();
  this.interface.add('START', this.emit.bind(this, 'startGame'));
  this.interface.add('SETTINGS', this.__drawOptions.bind(this));
  this.interface.writeSeparator();
  this.interface.add('EXIT', this.interface.close);

};

InteractiveMenu.prototype.__drawOptions = function () {
  var self = this;

  var boardDimensions = metadata.settings.get('boardDimensions');
  boardDimensions = boardDimensions.x + 'x' + boardDimensions.y;
  var prettyBoard = metadata.settings.get('prettyBoard');
  var trackEnemyMisses = metadata.settings.get('trackEnemyMisses');

  var unitsQuantity = metadata.settings.get('unitsQuantity');

  this.interface = createMenu(menuDefaultOpts);
  this.greetings.forEach(function (greeting) {
    self.interface.writeLine(greeting);
  });

  // Header - Board Settings
  this.interface.writeLine(' ');
  this.interface.writeLine('BOARD SETTINGS');
  this.interface.writeSeparator();

  // Board Settings
  this.interface.add('Dimensions', boardDimensions, this.__inquireBoardDimension.bind(this, boardDimensions));
  this.interface.add('Pretty Board', prettyBoard + '', this.__inquirePrettyBoard.bind(this));
  this.interface.add('Track Enemy Misses', trackEnemyMisses + '', this.__inquireTrackEnemyMisses.bind(this));

  // Header - Units Settings
  this.interface.writeLine(' ');
  this.interface.writeLine('UNITS QUANTITY SETTINGS');
  this.interface.writeSeparator();

  metadata.units.forEach(function (obj, key) {
    // NOTE: the second argument needs to be a string
    self.interface.add(
      obj.label,
      unitsQuantity[key] + '',
      self.__inquireUnitQuantity.bind(self, key, unitsQuantity)
    );
  });

  this.interface.writeLine(' ');
  this.interface.writeSeparator();
  this.interface.add('BACK', this.__drawLobby.bind(this));
};

InteractiveMenu.prototype.__generateLogo = function (cb) {
  var self = this;

  return figlet('Battleship', { font: 'Larry 3D 2', horizontalLayout: 'fitted'}, function (err, data) {
    if (err) {
      return cb(err);
    }

    self.greetings = data + 'v' + pkg.version;
    self.greetings = self.greetings.split(/\r?\n/);
    return cb();
  });
};

InteractiveMenu.prototype.__inquireBoardDimension = function (currentBoardDimensions) {
  var self = this;

  var question = {
    type: 'input',
    name: 'boardDimensions',
    message: 'What board size you want',
    default: currentBoardDimensions,
    validate: function (value) {
      var check = value.match(/^[0-9]{1,}x[0-9]{1,}$/);

      if (!check) {
        return 'Please enter a valid dimension by following this format "10x10".';
      }

      // Maximum board size 26x26
      value = value.split('x');
      if (parseInt(value[0], 10) > 26 || parseInt(value[1], 10) > 26) {
        return 'The maximum board size is 26x26, please enter a lower dimension.';
      }

      if (value[0] !== value[1]) {
        return 'The board needs to be a square (10x10, 11x11, 12x12, etc.)';
      }

      return true;
    }
  };

  return inquirer.prompt(question, function (answer) {
    answer = answer.boardDimensions || false;

    if (!answer) {
      throw new Error('Something went wrong, please restart the app');
    }

    answer = answer.split('x');
    metadata.settings.set('boardDimensions', {
      x: parseInt(answer[0], 10),
      y: parseInt(answer[1], 10)
    });
    metadata.settings.save();

    return self.__drawOptions();
  });
};

InteractiveMenu.prototype.__inquireUnitQuantity = function (unitId, unitsQuantity) {
  var self = this;
  var unit = metadata.units.get(unitId);

  var question = {
    type: 'input',
    name: 'unitQuantity',
    message: 'How many ' + unit.label + 's you want',
    default: unitsQuantity[unitId],
    validate: function (value) {
      var check = value.match(/^[0-9]{1,}$/);

      if (check) {
        return true;
      }

      return 'Please enter a valid number.';
    }
  };

  return inquirer.prompt(question, function (answer) {
    answer = answer.unitQuantity || false;

    if (!answer) {
      throw new Error('Something went wrong, please restart the app');
    }

    unitsQuantity[unitId] = parseInt(answer, 10);
    metadata.settings.set('unitsQuantity', unitsQuantity);
    metadata.settings.save();

    return self.__drawOptions();
  });
};

InteractiveMenu.prototype.__inquirePrettyBoard = function (currentValue) {
  var self = this;

  var question = {
    type: 'confirm',
    name: 'prettyBoard',
    message: 'Do you want a pretty board',
    default: currentValue
  };

  return inquirer.prompt(question, function (answer) {
    answer = typeof answer.prettyBoard !== 'undefined' ? answer.prettyBoard : null;

    if (typeof answer === 'object' && !answer) {
      throw new Error('Something went wrong, please restart the app');
    }

    metadata.settings.set('prettyBoard', answer);
    metadata.settings.save();

    return self.__drawOptions();
  });
};

InteractiveMenu.prototype.__inquireTrackEnemyMisses = function (currentValue) {
  var self = this;

  var question = {
    type: 'confirm',
    name: 'trackEnemyMisses',
    message: 'Do you want to track the enemy misses',
    default: currentValue
  };

  return inquirer.prompt(question, function (answer) {
    answer = typeof answer.trackEnemyMisses !== 'undefined' ? answer.trackEnemyMisses : null;

    if (typeof answer === 'object' && !answer) {
      throw new Error('Something went wrong, please restart the app');
    }

    metadata.settings.set('trackEnemyMisses', answer);
    metadata.settings.save();

    return self.__drawOptions();
  });
};

module.exports = InteractiveMenu;

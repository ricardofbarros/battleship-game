// Dependencies
var figlet = require('figlet');
var createMenu = require('simple-terminal-menu');
var pkg = require('../package.json');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var menuOpts = { width: 90, x: 4, y: 2 };

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

  this.interface = createMenu(menuOpts);
  this.greetings.forEach(function (greeting) {
    self.interface.writeLine(greeting);
  });
  this.interface.writeLine(' ');
  this.interface.writeLine('READY TO BOMB THE HELLOUT OF YOUR OPPONENT?');
  this.interface.writeSeparator();
  this.interface.add('START');
  this.interface.add('OPTIONS', this.__drawOptions.bind(this));
  this.interface.writeSeparator();
  this.interface.add('EXIT', this.interface.close);

};

InteractiveMenu.prototype.__drawOptions = function () {
  var self = this;

  this.interface = createMenu(menuOpts);
  this.greetings.forEach(function (greeting) {
    self.interface.writeLine(greeting);
  });
  this.interface.writeLine(' ');
  this.interface.writeLine('OPTIONS');
  this.interface.writeSeparator();
  this.interface.add('Dimension', '10x10');
  this.interface.add('Units');
  this.interface.writeSeparator();
  this.interface.add('BACK', this.__drawLobby.bind(this));
};

InteractiveMenu.prototype.__generateLogo = function (cb) {
  var self = this;

  return figlet('Battleship', { font: 'Larry 3D 2', horizontalLayout: 'fitted'}, function (err, data) {
    if (err) {
      console.log(err);
      return cb(err);
    }

    self.greetings = data + 'v' + pkg.version;
    self.greetings = self.greetings.split(/\r?\n/);
    return cb();
  });
};

module.exports = InteractiveMenu;

// Dependencies
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var InteractiveMenu = require('./InteractiveMenu');

function Game () {
  var self = this;

  this.menu = new InteractiveMenu();

  this.menu.on('startGame', function () {
    self.emit('start');
  });
}

util.inherits(Game, EventEmitter);

module.exports = Game;

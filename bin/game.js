#!/usr/bin/env node

// Dependencies
var Game = require('../lib/Game');
var prompt = require('prompt');

var game = new Game();

game.on('ready', function () {
  // Start prompt
  prompt.start();

  // Start new round
  game.emit('newRound');
});

game.on('newRound', function () {
  var schema = {
    properties: {
      attackPosition: {
        pattern: /^[A-Z]{1}[0-9]{1,2}$/,
        message: 'The position you want to bomb, of course!',
        required: true
      }
    }
  };

  game.showBoard();
  prompt.get(schema, function (err, result) {
    if (err) {
      throw new Error('Unexpected error, please restart the app');
    }

    game.bombPosition(result);

    // Time to computer make its move
    game.computerMove();
  });
});

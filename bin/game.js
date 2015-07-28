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
        pattern: /^[a-zA-Z]{1}[0-9]{1,2}$/,
        message: 'The position you want to bomb, of course!',
        required: true
      }
    }
  };

  game.drawBoards();
  prompt.get(schema, function (err, result) {
    if (err || !result.attackPosition) {
      throw new Error('Unexpected error, please restart the app');
    }

    game.bombPosition(result.attackPosition);

    // Time to computer make its move
    game.computerMove();
  });
});

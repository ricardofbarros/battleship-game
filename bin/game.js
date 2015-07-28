#!/usr/bin/env node

// Dependencies
var Game = require('../lib/Game');
var SimpleAI = require('../lib/SimpleAI');
var prompt = require('prompt');

var game = new Game();
var opponent;

game.on('ready', function () {
  // Start prompt
  prompt.start();

  // Pass prompt instance to game instance
  game.prompt = prompt;

  // Create your opponent
  opponent = new SimpleAI(game.settings);

  // lets get ready to rumbleeee!!
  game.emit('changeTurn', game.turn);
});

game.on('changeTurn', function (turn) {
  // Change the turn in
  // the game instance
  game.turn = turn;

  // draw/re-draw boards
  game.drawBoards();

  if (turn === 'human') {
    game.promptPlayerMove();
  } else {
    game.bombPosition(opponent.play());
  }
});

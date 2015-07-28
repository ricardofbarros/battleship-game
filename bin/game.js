#!/usr/bin/env node

// Dependencies
var Game = require('../lib/Game');
var SimpleAI = require('../lib/SimpleAI');
var prompt = require('prompt');

var game = new Game();
var opponent = new SimpleAI();

game.on('ready', function () {
  // Start prompt
  prompt.start();

  // Pass prompt instance to game instance
  game.prompt = prompt;

  // Start new round
  game.emit('newRound');
});

game.on('newRound', function () {
  // Increment round count
  game.roundCount++;
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
    opponent.play();
  }
});

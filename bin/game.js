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
  opponent = new SimpleAI(game.settings, game.history);

  // lets get ready to rumbleeee!!
  game.emit('newRound', game.turn);
});

game.on('newRound', function (turn) {
  // Keep track of rounds played
  game.roundsCounter++;

  // First clean the screen
  game.cleanScreen();

  // draw/re-draw game stuff
  game.drawBoards();
  game.drawNewLine();

  // If the game is already in play
  if (game.roundsCounter > 1) {
    game.drawLastAttackReport();
  }

  game.emit('changeTurn', turn);
});

game.on('changeTurn', function (turn) {
  // Change the turn in
  // the game instance
  game.turn = turn;

  if (turn === 'human') {
    game.promptPlayerMove();
  } else {
    game.bombPosition(opponent.play());
  }
});

game.on('finish', function () {
  // Clean screen
  game.cleanScreen();

  // Announce the winner!!
  game.announceWinner();
});

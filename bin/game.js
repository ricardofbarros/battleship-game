#!/usr/bin/env node

// Dependencies
// var Board = require('../lib/Board');
// var Units = require('../lib/Units');
var Game = require('../lib/Game');
var prompt = require('prompt');

var game = new Game();

game.on('start', function () {
  // Start prompt
  prompt.start();

  prompt.get(['username', 'email'], function (err, result) {
    //
    // Log the results.
    //
    console.log('Command-line input received:');
    console.log('  username: ' + result.username);
    console.log('  email: ' + result.email);
  });

});


// var board = new Board() // dimensions
// var units = new Units() // must specify how many units and which
//
// units.export().forEach(function (unit) {
//   board.addUnit(unit);
// });

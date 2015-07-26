#!/usr/bin/env node

// Dependencies
// var Board = require('../lib/Board');
// var Units = require('../lib/Units');
var inquirer = require('inquirer');
var figlet = require('figlet');
var pkg = require('../package.json');
var Menu = require('terminal-menu');

figlet('Battleship', { font: 'Larry 3D 2', horizontalLayout: 'fitted'}, function (err, data) {
  if (err) {
    console.log(err);
    return;
  }

  var greetings = data + 'v' + pkg.version;
  greetings = greetings.split(/\r?\n/);

  var menu = Menu({ width: 100, x: 1, y: 2 });
  menu.reset();

  greetings.forEach(function (greeting) {
    menu.write(greeting + '\n');
  });
  menu.write('\n');
  menu.write('READY TO BOMB THE HELLOUT OF YOUR OPPONENT?\n');
  menu.write('-------------------------------------------\n');

  menu.add('START');
  menu.add('OPTIONS');
  menu.write('-------------------------------------------\n');
  menu.add('EXIT');

  menu.on('select', function (label) {
    if (label === 'EXIT') {
      menu.close();
    }
  });

  process.stdin
    .pipe(menu.createStream())
    .pipe(process.stdout);

  process.stdin.setRawMode(true);
  menu.on('close', function () {
    process.stdin.setRawMode(false);
    process.stdin.end();
  });
});


// var board = new Board() // dimensions
// var units = new Units() // must specify how many units and which
//
// units.export().forEach(function (unit) {
//   board.addUnit(unit);
// });

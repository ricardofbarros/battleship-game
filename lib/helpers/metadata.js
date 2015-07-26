// Dependencies
var path = require('path');
var jsonfile = require('jsonfile');

// Where metadata is stored
var folderPath = path.resolve(__dirname, '..', '..', 'metadata');

// Valid metadata files
var metadataFiles = {
  settings: path.resolve(folderPath, 'settings.json'),
  units: path.resolve(folderPath, 'units.json')
};

// General save function
function save () {
  var obj = {};

  this.forEach(function (value, key) {
    obj[key] = value;
  });

  return jsonfile.writeFileSync(this.path, obj, {spaces: 2});
}

function metadataHelper () {
  var files = Object.keys(metadataFiles);
  var obj = {};

  files.forEach(function (file) {
    // Create a Map
    obj[file] = new Map();

    var data = jsonfile.readFileSync(metadataFiles[file]);

    // Fill the Map with JSON data
    for (var k in data) {
      if (data.hasOwnProperty(k)) {
        obj[file].set(k, data[k]);
      }
    }

    // Store in proto the file's absolute path
    obj[file].path = metadataFiles[file];

    // Add a new function to the map
    obj[file].save = save.bind(obj[file]);
  });

  return obj;
}

module.exports = metadataHelper();

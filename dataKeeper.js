const fs = require('fs');
const { dataKeeperFile: fileName } = require('./options');

module.exports.add = (obj, callback) => {
  fs.appendFile(fileName, JSON.stringify(obj) + '\n', callback);
}

module.exports.get = (callback) => {
  fs.readFile(fileName, 'utf8', (err, data) => {//rewrite!
    if (err || !(data.indexOf('{') < data.indexOf('}'))) {
      if (!err) { fs.unlink(fileName); }
      callback(err || new Error('file in broken 1, deleting'));
    } else {
      let returnErr = null;
      let returnObj = null;
      try {
        returnObj = JSON.parse(data.substring(data.lastIndexOf('\n', data.length - 2), data.length - 1));
      } catch (e) {
        returnErr = new Error('file is broken 2, deleting');
        fs.unlink(fileName);
      }
      callback(returnErr, returnObj);
    }
  });
}

module.exports.dataAvailable = (callback) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    if ((!err) && (data.indexOf('{') < data.indexOf('}')) && (data[data.length - 1] === '\n')) {
      callback(true);
    } else {
      callback(false);
    }
  });
}

module.exports.del = (callback) => {
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) { callback(err); } else {
      fs.writeFile(fileName, data.substring(0, data.lastIndexOf('\n', data.length - 2) + 1), (err) => {
        if (err) { callback(err); } else {
          callback(null);
        }
      });
    }
  });
}

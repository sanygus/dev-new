const fs = require('fs');
let errCount = 0;

module.exports = (obj) => {
  if (obj) {
    const prefix = (new Date).toISOString() + '    ';
    let out = '';
    if (typeof obj === 'string') {
      out = obj.slice();
    } else if (typeof obj === 'object') {
      if (obj instanceof Error) {
        errCount++;
        out = 'Error: ' + obj.message;
      } else {
        out = JSON.stringify(obj);
      }
    }
    //console.log(prefix + out);
    fs.appendFile("cam.log", prefix + out + '\n', (err) => {
      if (err) { console.log(err); }
    });
  }
}

module.exports.errCount = () => errCount;

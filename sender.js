const http = require('http');
const options = require('./options');
const dataKeeper = require('./dataKeeper');
const log = require('./log');

const sendToServer = (values, callback) => {//values in JSON { par1: 'value' }
  let getQuery = `iddev=${options.id}&`;
  let isValues = false;
  let srvPath = options.server.path;
  for(key in values) {
    getQuery += `${encodeURI(key)}=${encodeURI(values[key])}&`;
    isValues = true;
    if (key === "type" && values[key] === "info") {
      srvPath = "/log";
    }
  }
  if (isValues) {
    http.get({
      hostname: options.server.host,
      port: options.server.port,
      path: srvPath + '?' + getQuery,
      agent: false
    }, (res) => {
      let error = null;
      res.on('data', (data) => {
        if(res.statusCode !== 202 || JSON.parse(data).status !== 'ok') {
          error = new Error('err in answ');
        }
      });
      res.on('end', () => {
        callback(error);
      })
    }).on('error', (e) => {
      callback(e);
    })
  }
}

const sendFromFile = () => {
  dataKeeper.dataAvailable((available) => {
    if (available) {
      dataKeeper.get((err, data) => {
        if (err) { log(err); } else {
          send(data, 1);
        }
      })
    }
  });
}

const send = (values, fromFile = 0) => {
  sendToServer(values, (err) => {
    if (err) {
      log(err);
      if (!fromFile) {
        dataKeeper.add(values, (err) => {
          if (err) { log(err); }
        });
      }
    } else {
      if (fromFile) {
        dataKeeper.del((err) => {
          if (err) { log(err); } else {
            sendFromFile();
          }
        });
      } else {
        sendFromFile();
      }
    }
  });
}

module.exports = send;

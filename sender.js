const http = require('http');
const options = require('./options');
const log = require('./log');

module.exports.sendWakeup = () => {
  sendToServer(`/event/${options.devid}/wakeup?devdate=${new Date().toJSON()}`);
}

module.exports.sendSleep = (sleeptime) => {
  sendToServer(`/event/${options.devid}/sleep?devdate=${new Date().toJSON()}&time=${sleeptime}`);
}

module.exports.sendError = (msg) => {
  sendToServer(`/event/${options.devid}/error?devdate=${new Date().toJSON()}&msg=${encodeURI(msg)}`);
}

module.exports.sendHB = (charge) => {
  sendToServer(`/heartbeat/${options.devid}/rpi&charge=${charge}`);
}

const sendToServer = (path) => {
  console.log(path);
  http.get({
    hostname: options.server.host,
    port: options.server.port,
    path,
    agent: false
  }, (res) => {
    res.on('data', (data) => {
      if (!(res.statusCode == 200 && JSON.parse(data).ok)) {
        log('err in answ');
      }
    });
    res.on('end', () => {});
  }).on('error', (e) => {
    log(e);
    setTimeout(() => {
      sendToServer(path);
      console.log(`repeat sender ${path}`);
    }, 10 * 1000);
  });
}


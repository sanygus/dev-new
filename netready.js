const { spawn } = require('child_process');

const onePing = (callback) => {
  spawn('ping', ['-c', '1', '-W', '1', '8.8.8.8']).on('close', (code) => {
    callback(code === 0);
  });
}

const pingAll = (callback) => {
  onePing((alive) => {
    if (alive) {

      onePing((alive) => {
        if (alive) {

          onePing((alive) => {
            if (alive) {
              callback();
            } else { pingAll(callback) }
          });

        } else { pingAll(callback) }
      });

    } else { pingAll(callback) }
  });
}

module.exports = pingAll;
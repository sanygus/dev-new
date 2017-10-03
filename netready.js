const { spawn } = require('child_process');

const check = (callback) => {
  spawn('ping', ['-c', '1', '-W', '1', '8.8.8.8']).on('close', (code) => {
    callback(code === 0);
  });
}


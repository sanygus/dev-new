const exec = require('child_process').exec;
const log = require('./log');
const { power: powerOptions } = require('./options');

let camBusy = false;
let state = 'wait';
const hwPath = '../sens-dev-hw';

module.exports.shootPhoto = (callback) => {
  if (!camBusy) {
    camBusy = true;
    state = 'shooting Photo';
    exec(`raspistill -n -w 640 -h 480 -q 50 -o /tmpvid/storage/photo.jpg`, (error, stdout, stderr) => {
      camBusy = false;
      state = 'wait';
      if (error || stderr) {
        callback(error || new Error(stderr));
      } else {
        callback(null, '/tmpvid/storage/photo.jpg');
      }
    });
  } else {
    callback(new Error('cam is busy'));
  }
}

module.exports.shootVideo = (duration, callback) => {
  if (!camBusy && (duration > 0)) {
    camBusy = true;
    state = 'shooting Video';
    exec(`raspivid -t ${duration * 1000} -w 320 -h 240 -o /tmpvid/storage/video.h264`, (error, stdout, stderr) => {
      camBusy = false;
      state = 'wait';
      if (error || stderr) {
        callback(error || new Error(stderr));
      } else {
        callback(null, '/tmpvid/storage/video.h264');
      }
    });
  } else {
    callback(new Error('cam is busy'));
  }
}

module.exports.stream = {
  start: (callback) => {
    if (!camBusy) {
      //const cmd = `uv4l -nopreview --auto-video_nr --driver raspicam --encoding mjpeg --width 640 --height 480 --framerate 5`;
      const cmd = `v4l2rtspserver -P 8080 -F 10 -S > /dev/null 2>&1 &`;
      exec(cmd, (error, stdout, stderr) => {
        camBusy = true;
        state = 'streaming Video';
        callback(error);
      });
    } else {
      callback(new Error('cam is busy'));
    }
  },
  stop: (callback) => {
    if (camBusy) {
      exec(`pkill v4l2rtspserver`, () => {
        camBusy = false;
        state = 'wait';
        callback();
      });
    } else {
      callback(new Error('stream has not been started yet'));
    }
  }
}

module.exports.measureSensors = (callback) => {
  exec(`python3 ${hwPath}/ardsens.py`, (error, stdout, stderr) => {
    if (error || stderr) {
      return callback(error || new Error(stderr));
    }
    const sensors = JSON.parse(stdout);
    if (sensors.error1 && sensors.error2) {
      callback(new Error('both sensors not connected to I2C'));
    } else {
      if (sensors.error1) { log(`sensors.error1 ${sensors.error1}`); delete sensors.error1; }
      if (sensors.error2) { log(`sensors.error2 ${sensors.error2}`); delete sensors.error2; }
      if (Object.keys(sensors).length > 0) {
        sensors.date = (new Date).toISOString();
        callback(null, sensors);
      } else {
        callback(new Error('sensors values count is 0'));
      }
    }
  });
}

module.exports.shutdown = (sleepTime, callback) => {
  const time = Math.round(sleepTime);//min
  if (time > 0) {
    exec(`python3 ${hwPath}/ardsleep.py ${time}`, (error, stdout, stderr) => {
      if (error) { return callback(error); }
      if (stderr) { return callback(new Error(stderr)); }
      if (JSON.parse(stdout).success) {
        exec(`sudo shutdown -h now`, (errorShut, stdoutShut, stderrShut) => {
          if (errorShut) { return callback(errorShut); }
          if (stderrShut) { return callback(new Error(stderrShut)); }
          state = 'shutdown';
          callback(null);
        });
      } else { return callback(new Error("ardsleep fail")); }
    });
  } else {
    return callback(new Error("time must be > 0"));
  }
}

module.exports.getSleepStat = (callback) => {
  exec(`python3 ${hwPath}/ardGetStat.py`, (error, stdout, stderr) => {
    if (error) { return callback(error); }
    if (stderr) { return callback(new Error(stderr)); }
    const stat = JSON.parse(stdout);
    if (stat.error) { return callback(new Error(stat.error)); }
    callback(null, stat);
  });
}

module.exports.state = () => state;

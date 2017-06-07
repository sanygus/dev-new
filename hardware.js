const exec = require('child_process').exec;
const fs = require('fs');
const log = require('./log');

let camBusy = false;
const hwPath = '../sensprod/sens-dev-hw';

module.exports.shootPhoto = (callback) => {
  if (!camBusy) {
    callback(null);
    camBusy = true;
    exec(`rm /tmpvid/storage/photo.jpg;raspistill -w 320 -h 240 -q 50 -o /tmpvid/storage/photo.jpg`, (error, stdout, stderr) => {
      camBusy = false;
      if (error || stderr) { log(error || new Error(stderr)); }
    });
  } else {
    callback(new Error('cam is busy'));
  }
}

module.exports.shootVideo = (duration, callback) => {
  if (!camBusy && (duration > 0)) {
    callback(null);
    camBusy = true;
    exec(`rm /tmpvid/storage/video.h264;raspivid -t ${duration * 1000} -w 320 -h 240 -o /tmpvid/storage/video.h264`, (error, stdout, stderr) => {
      camBusy = false;
      if (error || stderr) { log(error || new Error(stderr)); }
    });
  } else {
    callback(new Error('cam is busy or duration <= 0'));
  }
}

module.exports.stream = {
  start: (callback) => {
    if (!camBusy) {
      //camBusy = true;
      exec(`uv4l -nopreview --auto-video_nr --driver raspicam --encoding mjpeg --width 640 --height 480 --framerate 5`, (error, stdout, stderr) => {
        callback(error);
      });
    } else {
      callback(new Error('cam is busy'));
    }
  },
  stop: (callback) => {
    exec(`sudo pkill uv4l`, () => {
      callback();
    });
  }
}

module.exports.measureSensors = (callback) => {
  exec(`python3 ${hwPath}/ardsens.py`, (error, stdout, stderr) => {
    if (error || stderr) {
      log(error || new Error(stderr));
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
        fs.writeFile('/tmpvid/storage/sensors', JSON.stringify(sensors), callback);
      } else {
        callback(new Error('sensors values count is 0'));
      }
    }
  });
}

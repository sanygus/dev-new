const exec = require('child_process').exec;

let camBusy = false;
let state = 'wait';
const hwPath = '../sensprod/sens-dev-hw';

module.exports.shootPhoto = (callback) => {
  if (!camBusy) {
    camBusy = true;
    state = 'shooting Photo';
    exec(`raspistill -w 320 -h 240 -q 50 -o /tmpvid/storage/photo.jpg`, (error, stdout, stderr) => {
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
      exec(`uv4l -nopreview --auto-video_nr --driver raspicam --encoding mjpeg --width 640 --height 480 --framerate 5`, (error, stdout, stderr) => {
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
      exec(`sudo pkill uv4l`, () => {
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

module.exports.state = () => state;

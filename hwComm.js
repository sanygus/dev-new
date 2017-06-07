const { hwPath, idDev } = require('./options');
const exec = require('child_process').exec;
const sender = require('./sender');
const log = require('./log');
const { taskConfig, taskParams } = require('./taskConfig');

let noSleep = false;
let noShot = false;

module.exports.sensRead = (params, callback) => {
  exec(`python3 ${hwPath}/ardsens.py`, (error, stdout, stderr) => {
    if (error) {
      return callback(error);
    }
    if (stderr) {
      return callback(new Error(stderr));
    }
    const sensors = JSON.parse(stdout);
    let sensErr = null;
    if (sensors.error1 || sensors.error2) {
      sensErr = {};
      if (sensors.error1) {
        sensErr.error1 = sensors.error1;
        delete sensors.error1;
        sender({ "type": "info", "event": "warn", "message": "sensRead fail 1", "date": (new Date).toISOString() });
      }
      if (sensors.error2) {
        sensErr.error2 = sensors.error2;
        delete sensors.error2;
        sender({ "type": "info", "event": "warn", "message": "sensRead fail 2", "date": (new Date).toISOString() });
      }
    }
    if (sensors.volt || sensors.mic || sensors.press) {
      sensors.date = (new Date).toISOString();
    }
    callback(sensErr, sensors);
  });
}

module.exports.getSleepStat = (params, callback) => {
  exec(`python3 ${hwPath}/ardGetStat.py`, (error, stdout, stderr) => {
    if (error) {
      return callback(error);
    }
    if (stderr) {
      return callback(new Error(stderr));
    }
    const stat = JSON.parse(stdout);
    if (stat.error) {
      sender({ "type": "info", "event": "warn", "message": `getStatError ${stat.error}`, "date": (new Date).toISOString() });
      return callback(stat.error);
    }
    callback(null, stat);
  });
}

const sigSleep = (time, callback) => {
  if (time > 0) {
    exec(`python3 ${hwPath}/ardsleep.py ${time}`, (error, stdout, stderr) => {
      if (error) {
        return callback(error);
      }
      if (stderr) {
        return callback(new Error(stderr));
      }
      callback(null, JSON.parse(stdout).success);
    });
  } else {
    callback(new Error('time sleep must be > 0'))
  }
}

const shutdown = (sleepMin) => {
  const sleepTime = Math.round(sleepMin);
  if (sleepTime > 0) {
    noShot = true;
    if (noSleep) {
      setTimeout(()=> {
        shutdown(sleepMin);
      }, 5000);
    } else {
      sigSleep(sleepTime, (err, success) => {
        if (err) { log(err); } else {
          if (success) {
            exec('sudo shutdown -h now', (error, stdout, stderr) => {
              if (error || stderr) {
                log('error in shutdown, but ardsleep success'); // !WARN
                log(error || stderr);
              }
            });
          } else {
            log('ardsleep fail'); // !WARN
            sender({ "type": "info", "event": "warn", "message": "ardsleep fail", "date": (new Date).toISOString() });
            setTimeout(()=> {
              shutdown(sleepMin);
            }, 5000);
          }
        }
      });
    }
  } else {
    log('sleepTime is ' + sleepTime);
  }
}

module.exports.shutdown = shutdown;

module.exports.goShutdown = (params, callback) => {
  let sleepMin = 1;
  if (params[2] !== undefined) {
    sleepMin = params[2];
  } else {
    sleepMin = taskParams[2].default;
  }
  shutdown(sleepMin);
  callback(null);
}

module.exports.shotAndSendPhoto = (params, callback) => {
  if (!noShot && !noSleep) {
    noSleep = true;
    exec(`raspistill -w 320 -h 240 -q 50 -o /tmpvid/cam/${idDev}.jpg && scp /tmpvid/cam/${idDev}.jpg pi@geoworks.pro:/home/pi/camphotos/${idDev}.jpg.tmp && ssh pi@geoworks.pro 'rm /home/pi/camphotos/${idDev}.jpg;mv /home/pi/camphotos/${idDev}.jpg.tmp /home/pi/camphotos/${idDev}.jpg';rm /tmpvid/cam/${idDev}.jpg`, () => {
      noSleep = false;
      callback();
    });
  } else {
    callback(true);
  }
}

module.exports.startStream = (duration) => {
  if (!noShot && !noSleep) {
    exec(`uv4l -nopreview --auto-video_nr --driver raspicam --encoding mjpeg --width 640 --height 480 --framerate 5`);
    if (duration) {
      noSleep = true;
      setTimeout(() => {
        stopStream();
      }, duration);
    }
  }
}

const stopStream = () => {
  if (noSleep) {
    exec(`sudo pkill uv4l`, () => {
      noSleep = false;
    });
  }
}

module.exports.stopStream = stopStream;

module.exports.getAndSendTaskConfig = (callback) => {
  const newConfig = {};
  for(taskKey in taskConfig) {
    newConfig.taskKey = taskConfig.taskKey;
    newConfig.taskKey.params = taskConfig.taskKey.params.map((id) => {
      return taskParams.id;
    });
  }
  sender.pushToBuffer(newConfig);
  callback(true);
}

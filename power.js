const { shutdown, getSleepStat } = require('./hardware');
const { workTime } = require('./options');
const sender = require('./sender');
const log = require('./log');

let timer = null;

module.exports.startAction = () => {
  clearTimeout(timer);
  console.log('start action');
}

module.exports.endAction = () => {
  clearTimeout(timer);
  timer = setTimeout(goSleep, workTime * 60000);
  console.log('stop action');
}

const goSleep = () => {
  const sleepTime = 300;
  sender({ "type": "info", "event": "sleep", "time": sleepTime, "date": (new Date).toISOString() });
  shutdown(sleepTime - 1, (error) => {
    if (error) { log(error); }
  });
}

setTimeout(() => {
  sender({ "type": "info", "event": "wakeup", "date": new Date((new Date).valueOf() - 25000).toISOString() });
  getSleepStat((err, stat) => {
    if (err) {
      log(`getStatError ${err.message}`);
      sender({ "type": "info", "event": "warn", "message": `getStatError ${err.message}`, "date": (new Date).toISOString() });
    } else {
      sender({ "type": "info", "event": "stat", "data": JSON.stringify(stat), "date": new Date((new Date).valueOf() - 25000).toISOString() });
    }
  });
}, 25000);

module.exports.endAction();

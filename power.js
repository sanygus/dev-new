const { shutdown, getSleepStat, measureSensors } = require('./hardware');
const { workTime, lowCharge } = require('./options');
const sender = require('./sender');
const log = require('./log');

let timer = null;

module.exports.startAction = () => {
  clearTimeout(timer);
}

module.exports.endAction = () => {
  clearTimeout(timer);
  timer = setTimeout(goSleep, workTime * 60000);
}

const goSleep = (reason) => {
  const sleepTime = 48 * 60;
  sender({ "type": "info", "event": "sleep", "time": sleepTime, reason, "date": (new Date).toISOString() });
  shutdown(sleepTime - 1, (error) => {
    if (error) { log(error); }
  });
}

setInterval(() => {
  measureSensors((err, sensors) => {
    if (sensors && sensors.charge !== undefined) {
      if (sensors.charge <= lowCharge) {
        goSleep("low charge");
      }
    } else {
      log("no charge");
    }
  });
}, 30000);

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

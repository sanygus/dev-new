const { shutdown, getSleepStat, getCharge } = require('./hardware');
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
  sender.sendSleep(sleepTime);
  shutdown(sleepTime - 1, (error) => {
    if (error) { log(error); }
  });
  log(`go sleep by reason ${reason}`);
}

setInterval(() => {
  getCharge((error, charge) => {
    if (error) { log(error); } else {
      if (charge <= lowCharge) {
        goSleep("low charge");
      }
    }
  });
}, 30000);

setTimeout(() => {
  sender.sendWakeup();
  getSleepStat((err, stat) => {
    if (err) {
      log(`getStatError ${err.message}`);
    } else {
      log(`sleepStat: ${stat}`);
    }
  });
}, 25000);

module.exports.endAction();

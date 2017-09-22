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
  setTimeout(() => {
    shutdown(sleepTime - 1, (error) => {
      if (error) { log(error); }
    });
  }, 3000);
  log(`go sleep by reason ${reason}`);
}

setInterval(() => {
  getCharge((error, charge) => {
    if (error) { log(error); } else {
      if (charge === 0) {
        log("charge not connected");
      } else if (charge <= lowCharge) {
        goSleep("low charge");
      }
    }
    sender.sendHB(charge);
  });
}, 20000);

setTimeout(() => {
  sender.sendWakeup();
  getSleepStat((err, stat) => {
    if (err) {
      log(`getStatError ${err.message}`);
    } else {
      log(`sleepStat: ${JSON.stringify(stat)}`);
    }
  });
}, 25000);

module.exports.endAction();

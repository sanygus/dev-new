const app = require('express')();
const hardware = require('./hardware');
const log = require('./log');

app.get('/photo', (req, res) => {
  hardware.shootPhoto((error, path) => {
    if (error) {
      res.type('application/json').status(503).send({ok: false, error: {code: 503, text: error.message}});
      log(error);
    } else {
      res.sendFile(path, (error) => {
        if (error) {
          res.type('application/json').status(404).send({ok: false, error: {code: 404, text: 'photo not ready yet'}});
        }
      });
    }
  });
});

app.get('/video', (req, res) => {
  const duration = req.query.duration ? parseInt(req.query.duration) : 0;
  if (duration > 0) {
    hardware.shootVideo(duration, (error, path) => {
      if (error) {
        res.type('application/json').status(503).send({ok: false, error: {code: 503, text: error.message}});
        log(error);
      } else {
        res.sendFile(path, (error) => {
          if (error) {
            res.type('application/json').status(404).send({ok: false, error: {code: 404, text: 'video not ready yet'}});
          }
        });
      }
    });
  } else {
    res.type('application/json').status(400).send({ok: false, error: {code: 400, text: 'duration must be > 0'}});
  }
});

app.get('/stream/start', (req, res) => {
  hardware.stream.start((error) => {
    if (error) {
      res.type('application/json').status(503).send({ok: false, error: {code: 503, text: error.message}});
    } else {
      res.type('application/json').status(200).send({ok: true});
    }
  });
});

app.get('/stream/stop', (req, res) => {
  hardware.stream.stop((error) => {
    if (error) {
      res.type('application/json').status(503).send({ok: false, error: {code: 503, text: error.message}});
    } else {
      res.type('application/json').status(200).send({ok: true});
    }
  });
});

app.get('/sensors', (req, res) => {
  hardware.measureSensors((error, data) => {
    if (error) {
      res.type('application/json').status(503).send({ok: false, error: {code: 503, text: error.message}});
      log(error);
    } else {
      res.type('application/json').status(200).send({ok: true, sensors: data});
    }
  });
});

app.get('/state', (req, res) => {
  res.type('application/json').status(200).send({state: hardware.state()});
});

app.listen(3000);

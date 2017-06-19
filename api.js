const app = require('express')();
const hardware = require('./hardware');
const log = require('./log');
const options = require('./options');

const startDate = new Date();

app.get('/', (req, res) => {
  res.type('text/html').status(200).send("\
    Avalable functions:<ul>\
      <li>GET /diag</li>\
      <li>GET /sensors</li>\
      <li>GET /photo</li>\
      <li>GET /video</li>\
      <li>GET /stream/start</li>\
      <li>GET /stream/stop</li>\
    </ul>\
    <a href=\"https://github.com/sanygus/dev-new/blob/master/README.md\">Full documentation</a>\
  ");
});

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

app.get('/diag', (req, res) => {
  res.type('application/json').status(200).send({
    id: options.id,
    localtime: new Date().toLocaleString('ru'),
    geoposition: options.geoposition,
    charge: +Math.random().toFixed(2),
    uptime: Math.round((new Date() - startDate) / 1000),
    errors: log.errCount(),
    state: hardware.state(),
  });
});

app.listen(3000);

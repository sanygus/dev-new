const app = require('express')();
const fs = require('fs');
const hardware = require('./hardware');

app.get('/shootPhoto', (req, res) => {
  /*const waitResult = req.query.waitResult ? true : false;
  const webhook = '';*/
  hardware.shootPhoto((error) => {
    if (error) {
      res.type('application/json').status(503).send({ok: false, error: {code: 503, text: error.message}});
    } else {
      res.type('application/json').status(200).send({ok: true});
    }
  });
});

app.get('/getPhoto', (req, res) => {
  res.sendFile('/tmpvid/storage/photo.jpg', (error) => {
    if (error) {
      res.type('application/json').status(404).send({ok: false, error: {code: 404, text: 'photo not ready yet'}});
    }
  });
});

app.get('/shootVideo', (req, res) => {
  const duration = req.query.duration ? parseInt(req.query.duration) : 0;
  if (duration > 0) {
    hardware.shootVideo(duration, (error) => {
      if (error) {
        res.type('application/json').status(503).send({ok: false, error: {code: 503, text: error.message}});
      } else {
        res.type('application/json').status(200).send({ok: true});
      }
    });
  } else {
    res.type('application/json').status(400).send({ok: false, error: {code: 400, text: 'duration must be > 0'}});
  }
});

app.get('/getVideo', (req, res) => {
  res.sendFile('/tmpvid/storage/video.h264', (error) => {
    if (error) {
      res.type('application/json').status(404).send({ok: false, error: {code: 404, text: 'video not ready yet'}});
    }
  });
});

app.get('/startStream', (req, res) => {
  hardware.stream.start((error) => {
    if (error) {
      res.type('application/json').status(503).send({ok: false, error: {code: 503, text: error.message}});
    } else {
      res.type('application/json').status(200).send({ok: true});
    }
  });
});

app.get('/stopStream', (req, res) => {
  hardware.stream.stop(() => {
    res.type('application/json').status(200).send({ok: true});
  });
});

app.get('/measureSensors', (req, res) => {
  hardware.measureSensors((error) => {
    if (error) {
      res.type('application/json').status(503).send({ok: false, error: {code: 503, text: error.message}});
    } else {
      res.type('application/json').status(200).send({ok: true});
    }
  });
});

app.get('/getSensors', (req, res) => {
  fs.readFile('/tmpvid/storage/sensors', (err, data) => {
    if (err) {
      res.type('application/json').status(404).send({ok: false, error: {code: 404, text: 'sensors not ready yet'}});
    } else {
      res.type('application/json').status(200).send(data);
    }
  });
});

app.listen(3000);

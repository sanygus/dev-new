module.exports = {
  id: 'infDev1',
  geoposition: '56.121655, 47.254002',
  workTime: 7,
  dataKeeperFile: 'dktemp.db',
  power: {
    maxCharge: 1023,
    minCharge: 817,
  },
  server: {//for sender
    host: 'localhost',
    port: 1234,
    path: '/dev'
  },
}
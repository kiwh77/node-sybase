

const SyBase = require('../dist/node_sybase')

module.exports = new SyBase([
  {
    name: 'main',
    host: '10.0.0.141',
    port: 2087,
    dbname: 'web?charset=cp936',
    username: 'username',
    password: '123456'
  }
])
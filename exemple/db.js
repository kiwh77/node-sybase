/*
 * @Author: Wuhao
 * @Email: kiwh77@126.com
 * @Date: 2017-09-29 16:35:23
 * @LastEditTime: 2019-12-02 18:07:16
 */


const SyBase = require('../dist')
module.exports = new SyBase([
  {
    name: 'main',
    database: 'web?charset=cp936',
    username: 'demo',
    password: 'cydemo',
    host: '202.104.161.144',
    port: '2087'
    // name: 'main',
    // host: '10.0.0.141',
    // port: 2087,
    // dbname: 'web?charset=cp936',
    // username: 'username',
    // password: '123456'
  }
])
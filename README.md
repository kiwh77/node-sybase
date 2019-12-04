

## Node-sybase
```
  SyBase ORM for node like Sequelize.js
```
---
## NPM
  ```
  npm install node-sybase
  ```
---
## Use
  
  * Create Models  `exemple/models/wxuser.js`

  ```js
  const SyBase = require('../db')

  module.exports = () => {
    const { STRING, INTEGER, DATE, DECIMAL } = SyBase

    return SyBase.define('WXUser', {
      id: {
        type: INTEGER,
        allowNull: false,
        primaryKey: true,
        autoInc: true
      },
      openid: {
        type: STRING
      },
      headurl: {
        type: STRING
      },
      wxname: {
        type: STRING
      },
      cardno: {
        type: STRING
      },
      phone: {
        type: STRING
      },
      state: {
        type: STRING,
        defaultValue: '00'
      },
      regdate: {
        type: DATE,
        defaultValue: function () {
          return new Date()
        }
      },
    }, {
      tableName: 't_wxuser',
      /* 配置表中所有的字符串在查询时都加上rtrim转化 */
      rtrim: true
    })
  }
  ```
---
  * Create DBs `exemple/db.js`
  ```
    // This is a exemple. Production use require('node_sybase')
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
  ```
---
  * Set Model Path `exemple/app.js`
  ```
    const SyBase = require('./db')
    SyBase.use(__dirname + '/models')
  ```
---
  * Set Pool or Changed Pool
  ```
    Sybase.models.WXUser.by(SyBase.DBPools.main) 
  ```
---
  * CRUD
    * findOne
      ```
        SyBase.models.WXUser.findOne({phone:'13888888888'}).then(res => ... ).catch(err => ...)
      ```
    * findById
      ```
        SyBase.models.WXUser.findById('123456'}).then(res => ... ).catch(err => ...)
      ```
    * findAll
      ```
        SyBase.models.WXUser.findAll({phone:'13888888888'}).then(res => ... ).catch(err => ...)
      ```
    * create
      ```
        SyBase.models.WXUser.create({phone:'13888888888', ...}).then(res => ... ).catch(err => ...)
      ```
    * update
      ```
        SyBase.models.WXUser.update({phone:'13888888888'}, {id: '123456'}).then(res => ... ).catch(err => ...)
      ```
    * delete
      ```
        SyBase.models.WXUser.delete({id:'123456'}).then(res => ... ).catch(err => ...)
      ```
---
  * exeute Sql 
    ```
      // Model 
      Sybase.models.WXuser.execSql('select * from t_wxuser').then(res => ...).catch(err => ...)
      // Pool
      Sybase.DBPools.main.execute('select * from t_wxuser).then(res => ...).catch(err => ...)
    ```

  about detail please See `exemple` 
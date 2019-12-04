/*
 * @Author: Wuhao
 * @Email: kiwh77@126.com
 * @Date: 2017-09-29 10:28:19
 * @LastEditTime: 2019-12-02 20:58:15
 */

const genericPool = require('generic-pool');
const DbDriver = require('./sybase');

/**
 * 数据库连接，线程池
 * 
 * @param {any} opts 
 *      {
 *        *host,
 *        *port,
 *        *dbname,
 *        *username,
 *        *password,
 *        jarPath,
 *        max,
 *        min,
 *        name
 *      }
 */
class DBPool {
  constructor(opts) {
    if (!opts.host || !opts.port) {
      throw new Error('Sybase DB params lacked!')
    }
    this.name = opts.name || opts.host

    const _create = () => {
      return new Promise((resolve, reject) => {
        var client = new DbDriver(
          opts.host,
          opts.port,
          opts.dbname,
          opts.username,
          opts.password,
          true,
          opts.jarPath);
        client.connect((err) => {
          if (err) return reject(err)
          return resolve(client);
        });
      })
    }

    const _destroy = (client) => {
      return new Promise((resolve) => {
        if (client.isConnected()) {
          client.disconnect();
          resolve();
        }
      })
    }

    this.pool = genericPool.createPool({
      create: _create,
      destroy: _destroy
    }, {
      max: opts.max || 10,
      min: opts.min || 2
    });
  }

  _exe (connect, sql, callback) {
    connect.then((client) => {
      client.query(sql, (err, data) => {
        this.pool.release(client);
        callback(err, data)
      })
    })
  }

  execute (sql, callback) {
    const connInfo = this.pool.acquire();
    return new Promise((resolve, reject) => {
      this._exe(connInfo, sql, (err, data) => {
        callback && callback(err, data)
        if (err) return reject(err);
        return resolve(data);
      })
    })
  }
};

module.exports = DBPool
module.exports.DBPool = DBPool
module.exports.default = DBPool
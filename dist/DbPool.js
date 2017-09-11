/*!
 *
 * 数据库连接，线程池
 * Copyright(c) 2016 huangbinglong
 */

'use strict';

var genericPool = require('generic-pool');
var DbDriver = require('sybase');

function DBPool(opts) {

    if (!opts.SYBASE_HOST || !opts.SYBASE_PORT) {
        throw new Error('Sybase DB params lacked!')
    }

    const that = this;

    function _create() {
        return new Promise(function (resolve, reject) {
            var client = new DbDriver(
                opts.SYBASE_HOST,
                opts.SYBASE_PORT,
                opts.SYBASE_DB_NAME,
                opts.SYBASE_USER_NAME,
                opts.SYBASE_PWD,
                true,
                opts.jarPath);
            client.connect(function (err) {
                if (err) return console.log(err);
                resolve(client);
            });
        })
    }

    function _destroy(client) {
        return new Promise(function (resolve) {
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

    function _exe(connect, sql, callback) {
        connect.then(function (client) {
            client.query(sql, function (err, data) {
                if (err) console.log(err);
                that.pool.release(client);
                if (err && err.message.indexOf("JZ0CU") > -1) {
                    callback(null, data);
                } else {
                    callback(err, data);
                }
            })
        })
    }

    this.execute = function (sql, callback) {
        const connInfo = that.pool.acquire();
        if (Promise) {
            return new Promise(function (resolve, reject) {
                _exe(connInfo, sql, function (err, data) {
                    if (err) return reject(err);
                    return resolve(data);
                })
            })
        } else {
            _exe(connInfo, sql, callback);
        }
    }
};

module.exports = DBPool;
/*!
 *
 * 数据库连接，线程池
 * Copyright(c) 2016 huangbinglong
 */

'use strict';

var genericPool = require('generic-pool');
var DbDriver = require('sybase');

const factory = {
    create: function(){
        return new Promise(function(resolve, reject){
            var client = new DbDriver(
                process.env.SYBASE_HOST,
                process.env.SYBASE_PORT,
                process.env.SYBASE_DB_NAME,
                process.env.SYBASE_USER_NAME,
                process.env.SYBASE_PWD,
                true,
                __dirname+'/../node_modules/sybase/JavaSybaseLink/dist/JavaSybaseLink.jar');
            client.connect(function (err) {
                if (err) return console.log(err);
                resolve(client);
            });
        })
    },
    destroy: function(client){
        return new Promise(function(resolve){
            if (client.isConnected()) {
                client.disconnect();
                resolve();
            }
        })
    }
};

var DdPool = function (opts) {
    const myPool = genericPool.createPool(factory, opts);
    const pool = this;
    pool.execute = function(sql,callback) {
        const connInfo =  myPool.acquire();
        connInfo.then(function(client) {
            client.query(sql, function (err, data) {
                if (err) console.log(err);
                myPool.release(client);
                if (err && err.message.indexOf("JZ0CU") > -1) {
                    callback(null, data);
                } else {
                    callback(err, data);
                }
            })
        });
    }
};

module.exports = new DdPool({
    max: 10, // maximum size of the pool
    min: 2 // minimum size of the pool
});
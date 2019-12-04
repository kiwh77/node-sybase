/*
 * @Author: Wuhao
 * @Email: kiwh77@126.com
 * @Date: 2017-09-29 16:32:42
 * @LastEditTime: 2019-12-02 21:39:40
 */


const SyBase = require('../../db')

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
    rtrim: true
  })
}
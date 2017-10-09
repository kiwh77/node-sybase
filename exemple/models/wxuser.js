

const Sequelize = require('../db')

module.exports = () => {
  const { STRING, INTEGER, DATE, DECIMAL } = Sequelize

  return Sequelize.define('WXUser', {
    id: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
      autoInc : true
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
      defaultValue: function(){
        return new Date()
      }
    },
  }, {
      tableName: 't_wxuser'
    })
}
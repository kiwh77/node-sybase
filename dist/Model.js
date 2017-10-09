

const Condition = require('./Conditions')
const Format = require('./Format')


/**
 * 对象模型类
 * @param name 模型名称,唯一
 * @param fields 模型字段
 *        目前只支持基本的STRING,INTEGER,DATE,DECIMAL
 * @param tableInfos 表信息，tableName为必需字段（即表名）
 * @param pool 在那个数据库连接池中执行，只有一个数据库时，只需要设置一次，如需要切换可使用by()函数
 * @class Model
 */
class Model {

  constructor(name, fields, tableinfos, pool) {
    this.name = name
    this.fields = fields
    this.tablename = tableinfos.tableName || tableinfos.tablename
    this.pool = pool
    this.condition = new Condition(fields, this.tablename)
    this.cacheSql = undefined

    if (tableinfos.classMethods && tableinfos.classMethods.length > 0) {
      Object.keys(tableinfos.classMethods).forEach(m => {
        this[m] = this.tableinfos.classMethods[m].call(this)
      })
    }
  }
  
  findOne (where) {
    return new Promise((resolve, reject) => {
      let sql
      try {
        where = where || {}
        sql = this.condition.select().sub('TOP 1').field().from().where(where).toSql()
      } catch (e) {
        return reject(e.message)
      }
      this.execSql(sql).then((data) => {
        if (data) return resolve(data[0])
        return resolve({})
      }, reject)
    })
  }

  findAll (where, page) {
    return new Promise((resolve, reject) => {
      let sql
      try {
        where = where || {}
        sql = this.condition.select().field().from().where(where).toSql()
      } catch (e) {
        return reject(e.message)
      }
      this.execSql(sql).then(resolve, reject)
    })
  }

  findByID (id) {
    return new Promise((resolve, reject) => {
      let sql, where={}
      try {
        for (let key in this.fields) {
          const value = this.fields[key]
          if (value.primaryKey && !where[key]) {
            where[key] = id;
          }
        }
        sql = this.condition.select().field().from().where(where).toSql()
      } catch (e) {
        return reject(e.message)
      }
      this.execSql(sql).then(data => {
        if (data && data.length) return resolve(data[0])
        return resolve({})
      }, reject)
    })
  }

  update (params, where, needQuery) {
    return new Promise((resolve, reject) => {
      let sql
      try {
        sql = this.condition.update().values(params).where(where).toSql()
      } catch (e) {
        return reject(e.message)
      }
      this.execSql(sql).then(res => {
        const primaryField = this.getPrimaryKey()
        if (primaryField && params[primaryField.key]) {
          this.findByID(Format.tranfrom(primaryField.type, params[primaryField.key])).then(resolve, reject)
        }else {
          this.findOne(this.getVerifyField(params)).then(resolve, reject)
        } 
      }, reject)
    })
  }

  create (params, needQuery) {
    let keys = Object.keys(params)
    for (const key in this.fields) {
      if (keys.indexOf(key) === -1 && this.fields[key].defaultValue) params[key] = this.fields[key].defaultValue 
    }
    keys = Object.keys(params)

    return new Promise((resolve, reject) => {
      let sql
      try {
        sql = this.condition.create().newField(keys).sub(' VALUES').newValues(params).toSql()
      } catch (e) {
        return reject(e.message)
      }
      this.execSql(sql).then(res => {
        // 取出主键，如果没有则使用参数查询
        const primaryField = this.getPrimaryKey()
        if (primaryField && params[primaryField.key]) {
          this.findByID(Format.tranfrom(primaryField.type, params[primaryField.key])).then(resolve, reject)
        }else {
          this.findOne(this.getVerifyField(params)).then(resolve, reject)
        }
      }, reject)
    })
  }

  delete (where) {
    return new Promise((resolve, reject) => {
      let sql
      try {
        sql = this.condition.delete().where(where).toSql()
      } catch (e) {
        return reject(e.message)
      }
      this.execSql(sql).then(resolve, reject)
    })
  }

  execSql (sql) {
    return new Promise((resolve, reject) => {
      this.pool.execute(sql).then((data) => {
        this.cacheSql = null
        return resolve(data)
      }, (error) => {
        this.cacheSql = null
        return reject(error)
      })
    })
  }

  //在什么环境执行
  by (pool) {
    this.pool = pool;
    return this
  }
  
  // 取出主键
  getPrimaryKey () {
    for (const key in this.fields) {
      const value = this.fields[key]
      if (value.primaryKey && !value.autoInc) return {key: key, type: value.type}
    }
  }

  // 从参数中取出合规的参数
  getVerifyField (params) {
    const result = {}
    const fields = Object.keys(this.fields)
    for (const key in params) {
      const fieldInfo = this.fields[key]
      if (fields.indexOf(key) > -1 && fieldInfo && !fieldInfo.autoInc) {
        result[key] = Format.tranfrom(fieldInfo.type, params[key])
      }
    }
    return result
  }
}

module.exports = Model
module.exports.Model = Model
module.exports.default = Model
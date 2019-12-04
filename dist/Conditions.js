
const Format = require('./Format')
class Condition {

  constructor(fields, tableName) {
    this.fields = fields
    this.tableName = tableName
    this.sql = ''
  }

  select () {
    this.sql = 'SELECT'
    return this;
  }

  create () {
    this.sql = `INSERT INTO ${this.tableName}`
    return this
  }

  update (values, conditions) {
    this.sql = `UPDATE ${this.tableName} SET`
    return this
  }

  delete () {
    this.sql = `DELETE ${this.tableName}`
    return this
  }

  values (values) {
    let headledValues = []
    for (let key in values) {
      const value = values[key]
      const type = this.getTypeByField(key)
      if (!type) continue
      const headleValue = Format.tranfrom(type, value)
      if (!headleValue && headleValue !== 0) throw new Error(`${key} error ${value}`)
      headledValues.push(`${key}=${headleValue}`)
    }
    this.sql += ` ${headledValues.join(', ')}`
    return this
  }

  newValues (values) {
    let headledValues = []
    //排序，防止字段与值错位
    const keys = Object.keys(values)
    keys.sort((a, b) => a > b)

    for (let key in keys) {
      const kv = keys[key]
      const value = values[kv]
      const type = this.getTypeByField(kv)
      if (!type) continue
      const field = this.fields[kv]
      if (field.autoInc) continue

      let headleValue = Format.tranfrom(type, value)
      if (!field.allowNull && !headleValue) {
        if (field.defaultValue) {
          const dvtype = typeof field.defaultValue
          headleValue = Format.tranfrom(dvtype, field.defaultValue)
          if (!headleValue && headleValue !== 0) throw new Error(`${kv} error ${value}`)
        }
      }

      headledValues.push(`${headleValue}`)
    }
    this.sql += `(${headledValues.join(', ')})`
    return this
  }

  field (fields, filterFields, config) {
    this.sql += ` ${this.joinFields(fields, filterFields, config)}`
    return this
  }

  newField (fields) {
    fields = fields || Object.keys(this.fields)
    fields.sort((a, b) => a > b)
    let hv = []
    for (let key in fields) {
      const value = fields[key]
      if (!this.authField(value)) continue
      const f = this.fields[value]
      if (f.autoInc) continue
      hv.push(value)
    }
    this.sql += ` (${hv.join(', ')})`
    return this
  }

  from (tableName) {
    this.sql += ` FROM ${tableName || this.tableName}`
    return this
  }

  where (conditions) {
    if (!conditions || Object.keys(conditions).length === 0) return this
    this.sql += ` WHERE ${this.conditions(conditions)}`
    return this;
  }

  sub (value) {
    if (!value || value == '') return this
    this.sql += ` ${value}`
    return this
  }

  // 返回sql
  toSql () {
    return this.sql;
  }

  /**
   * 拼接字段，默认拼接当前模型的所有字段
   * 
   * @param {any} fields 字段
   * @param {Array} filterFields 需要查询的字段名
   * @param {Object} config 配置，rtrim, ltrim: 给字符串key加上trim
   * @returns 以,连接的字段名
   * @memberof Condition
   */
  joinFields (fields, filterFields, config = {}) {
    fields = fields || this.fields
    const { rtrim, ltrim } = config
    filterFields = filterFields && Array.isArray(filterFields) && filterFields.length > 0 ? filterFields : Object.keys(this.fields)
    return (Array.isArray(fields) ? fields : Object.keys(this.fields)).sort((a, b) => a > b ? 1 : -1).map(fieldName => {
      const field = fields[fieldName]
      if (fieldName && filterFields.some(name => name === fieldName)) {
        // 是否需要添加rtrim函数
        if (field && (field === 'STRING' || field.type === 'STRING')) {
          if (rtrim || field.rtrim) {
            return 'rtrim(' + fieldName + ') as ' + fieldName
          } else if (ltrim || field.ltrim) {
            return 'ltrim(' + fieldName + ') as ' + fieldName
          }
        }
        return fieldName
      }
      return false
    }).join(', ');
  }

  /**
   * 处理条件，多个条件以AND拼接，会过滤不在未记录的字段
   * 
   * @param {any} conditions  条件
   * @returns 以AND拼接的多件字符串
   * @memberof Condition
   */
  conditions (conditions) {
    if (!conditions) return ''
    let cs = []

    for (let key in conditions) {
      //判断key是否在fields中
      if (!Object.keys(this.fields).indexOf(key) === -1) continue
      //取到key所对得的type
      const keyType = this.fields[key].type
      if (!keyType) continue

      const value = conditions[key]
      if (typeof value === 'object' && value.length > 0) {
        //TODO
        continue
      } else {
        const headleValue = Format.tranfrom(keyType, value)
        if (!headleValue && headleValue !== 0) throw new Error(`condition ${key} error ${value}`)
        cs.push(`${key}=${headleValue}`)
      }
    }
    return `${cs.join(' AND ')}`;
  }

  /**
   * 验证字段是否是已申明的
   * 
   * @param {any} field 
   * @returns 
   * @memberof Condition
   */
  authField (field) {
    if (!field || field == '') return false
    return Object.keys(this.fields).indexOf(field) > -1
  }
  /**
   * 验证字段，取出字段的类型
   * 
   * @param {any} field 
   * @returns 
   * @memberof Condition
   */
  getTypeByField (field) {
    if (this.authField(field)) return this.fields[field].type
    return null
  }
}

module.exports = Condition
module.exports.Condition = Condition
module.exports.default = Condition
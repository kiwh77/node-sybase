
const Utils = require('./Utils')
const moment = require('moment')

const Format = {}
Format.tranfrom = (type, value) => {
  const vtype = typeof value
  switch (type) {
    case Format.STRING:
      return Format.toString(value)
      break
    case Format.INTEGER:
      return Format.toInteger(value)
      break
    case Format.DATE:
      const result = Format.toDate(value)
      return  result ? `'${result}'` : undefined
      break
    case Format.DECIMAL:
      return Format.toDecimal(value)
      break
  }
}

Format.toString = (value) => {
  const vtype = typeof value
  if ((!value && value!==0) || vtype === 'undefined') return ''

  let result = JSON.stringify(value)
  if (vtype === 'string' || vtype === 'number') result = value+''
  if (vtype === 'object') {
    if (Utils.validator.isDate(value)) {
      result = moment(value).format(Format.DATE_FORMAT)
    }
  }
  if (vtype === 'function') {
    result = Format.toString(value())
  }
  return `'${result}'`.replace(/''/g,"'")
}

Format.toInteger = (value) => {
  const vtype = typeof value
  let result  
  if ((!value &&value!==0) || vtype==='undefined') result = undefined
  if (vtype === 'string' || vtype === 'number') result = parseInt(value)
  if (vtype === 'function') {
    result = Format.toInteger(value())
  }
  if (result === NaN) result = undefined
  return result
}

Format.toDate = (value) => {
  const vtype = typeof value
  let result
  if (vtype === 'object' && value instanceof Date) {
    result = moment(value).format(Format.DATE_FORMAT)
  }
  if (vtype === 'string' && Utils.validator.isDate(value)) {
    result = moment(value).format(Format.DATE_FORMAT)
  }
  if (vtype === 'function') {
    result = Format.toDate(value())
  }
  return result
}

Format.toDecimal = (value) => {
  const vtype = typeof value
  let result  
  if ((!value &&value!==0) || vtype==='undefined') result = undefined
  if (vtype === 'string' || vtype === 'number') result = parseFloat(value)
  if (vtype === 'function') {
    result = Format.toDecimal(value())
  }
  if (result === NaN) result = undefined
  return result
}


Format.STRING = 'STRING',
Format.INTEGER = 'INTEGER'
Format.DATE = 'DATE'
Format.DECIMAL = 'DECIMAL'

Format.DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS'

module.exports = Format
module.exports.default = Format
module.exports.Format = Format
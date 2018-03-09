

const DBPool = require('./Pool')
const Model = require('./Model')
const Utils = require('./Utils')
const Format = require('./Format')
const fs = require('fs')


const _readdir = function (path, contains) {
  const names = fs.readdirSync(path)
  names.forEach(name => {
    const namepath = `${path}/${name}`
    const namepathstat = fs.statSync(namepath)
    if (namepathstat.isDirectory()){
      _readdir(namepathstat, contains)
    }else {
      contains.push(namepath)
    }
  })
}

/**
 * @param dbinfos 数据库连接信息
 * 
 * @class SyBase
 */
class SyBase {

  constructor(DBInfos) {
    if (!DBInfos) throw new Error('DBInfos required!')

    this.DBPools = {}
    this.models = {}

    DBInfos.forEach(info => {
      const pool = new DBPool(info)
      this.DBPools[info.name] = pool
    })
  }

  //定义模型
  define (name, attrs, tableinfos) {
    const model = new Model(name, attrs, tableinfos)
    return model
  }

  //执行sql
  exec (sql, pool) {
    if (typeof pool === 'string') pool = this.DBPools[pool]
    if (!pool) pool = this.DBPools.main
    if (!pool) throw new Error('SyBase not found any DB pool')
    return pool.execute(sql)
  }

  //记录模型文件
  use(path, app){
    //判断路径是否存在
     if(!fs.existsSync(path)) throw new Error(`models path ${path} not exists!`)
    //遍历文件文件夹，得到所有模型路径
    const paths = [];
    _readdir(path, paths)

    //取出所有模型
    paths.forEach(mPath => {
      const model = require(mPath)(app)
      if (this.DBPools && this.DBPools.main) model.by(this.DBPools.main)
      this.models[model.name] = model
    })
  }
}

SyBase.prototype.STRING = Format.STRING
SyBase.prototype.INTEGER = Format.INTEGER
SyBase.prototype.DATE = Format.DATE
SyBase.prototype.DECIMAL = Format.DECIMAL

module.exports = SyBase
module.exports.SyBase = SyBase
module.exports.default = SyBase
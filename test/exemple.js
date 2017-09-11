

const Schema = require('../index').schema;

const ExempleSchema = new Schema('tablename', {
    id : Schema.TYPE_STRING,
    name : Schema.TYPE_STRING,
    age : Schema.TYPE_NUMERIC,
    create_at : Schema.TYPE_DATE,
    "$id" : id
})

//需要忽略的字段，更新或新增时忽略, update,save
ExempleModel.ignoreWords = {
  save : [],
  update : [] 
}

//默认值
ExempleModel.defualt = {
  age : 18
}

module.exports = ExempleSchema.modal;

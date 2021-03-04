const { dbmysql } = require('../middlewares');
const util = require("util");
const TableName = "url_share";
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getRecord = async(type, id, url) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
        if(type != ""){
            que += "AND type = '"+type+"' ";
        }
        if(id != ""){
            que += "AND id = '"+id+"' ";
        }
        if(url != ""){
            que += "AND url = '"+url+"' ";
        }

    var rows = await query(que);
    return rows;
}

exports.insertRecord = async(type, id, url) => {
    var que = "INSERT INTO " + TableName + " (type,id,url) VALUES ('"+type+"','"+id+"','"+url+"')";
    var rows = await query(que);
    return rows;
}
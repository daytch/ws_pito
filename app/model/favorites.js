const { dbmysql } = require('../middlewares');
const util = require("util");
const TableName = "favorites";

const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = async () => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";

    var rows = await query(que);
    return rows;
};

exports.getRecord = async(user_id, type, status) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
    if(id_user != ""){
        que += "AND userId = '" + user_id + "' ";
    }
    if(type != ""){
        que += "AND type_fav = '" + type + "' ";
    }
    if(status != ""){
        que += "AND status = '" + status + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.insertRecord = async()
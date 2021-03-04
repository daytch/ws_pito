const { dbmysql } = require('../middlewares');
const util = require("util");
const TableName = "category";
const TableLog = "search_category";

const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = async () => {
    var que = "SELECT * FROM " + TableName + " WHERE isActive = 1 ";

    var rows = await query(que);
    return rows;
};

exports.getCategory = async(id_cat) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
    if(id_cat != ""){
        que += "AND id_cat = '" + id_cat + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.insertRecord = async(param) => {
    var que = "INSERT INTO " + TableName + " (name, createdAt) VALUES ";
        que += "('" + param.name + "',now())";

    var rows = await query(que);
    return rows;
};

exports.updateRecord = async(param) => {
    var que = "UPDATE " + TableName + " SET name = '" + param.name + "', modifiedAt = now() ";
        que += "WHERE id = '" + param.id + "'";

    var rows = await query(que);
    return rows;
};

exports.updateActive = async(param) => {
    var que = "UPDATE " + TableName + " SET isActive = '" + param.isActive + "', modifiedAt = now() ";
        que += "WHERE id = '" + param.id + "'";

    var rows = await query(que);
    return rows;
};

exports.insertLog = async(user_id, cat_id) => {
    var que = "INSERT INTO " + TableLog + " (userId, categoryId, createdAt) VALUES ";
        que += "('" + user_id + "','"+cat_id+"',now())";

    var rows = await query(que);
    return rows;
};
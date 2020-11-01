const { dbmysql } = require('../middlewares');
const util = require("util");
const TableName = "category";

const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = async () => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";

    var rows = await query(que);
    return rows;
};

exports.getCategory = async(id_cat) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
    if(id_cat != ""){
        que += "id_cat = '" + id_cat + "' ";
    }

    var rows = await query(que);
    return rows;
};
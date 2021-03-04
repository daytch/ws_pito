const { dbmysql } = require('../middlewares');
const util = require("util");

const TableKeyword = "search_keyword";
const TableCategory = "search_category";
const TableMasterCategory = "category";
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getCountKeyword = async() => {
    var que = "SELECT text,count(*) as cnt FROM "+TableKeyword+" GROUP BY text ORDER BY cnt desc LIMIT 10";
    var rows = await query(que);
    return rows;
};

exports.getCountCategory = async() => {
    var que = "SELECT a.categoryId,b.name,count(*) as cnt FROM "+TableCategory+" as a INNER JOIN "+TableMasterCategory+" as b on a.categoryId = b.id GROUP BY a.categoryId ORDER BY cnt desc LIMIT 10";
    var rows = await query(que);
    return rows;
};

exports.insertKeyword = async(user_id, text) => {
    var que = "INSERT INTO " + TableKeyword + " (userId, text, createdAt) VALUES ";
        que += "('" + user_id + "','"+text+"',now())";
    var rows = await query(que);
    return rows;
}

exports.insertCategory = async(user_id, category_id) => {
    var que = "INSERT INTO " + TableCategory + " (userId, categoryId, createdAt) VALUES ";
        que += "('" + user_id + "','"+category_id+"',now())";
    var rows = await query(que);
    return rows;
}

exports.getCountCategoryById = async(cat_id) => {
    var que = "SELECT count(*) as cnt FROM "+TableCategory+" ";
        que += "WHERE categoryId = " + cat_id;
    var rows = await query(que);
    return rows;
};
const { dbmysql } = require('../middlewares');
const util = require("util");

const TableName = "videos_category";
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = function(callback){
    dbmysql.query("SELECT * FROM " + TableName + " WHERE 1=1", function(error, rows, fields){
        if(error){
            // console.log(error);
            callback(error, null);
        }
        else {
            // console.log(rows);
            callback(null, rows);
        }
    });
};

exports.getCategoryByVideos = async(id_video/*, callback*/) => {
    var que = "SELECT b.name FROM " + TableName + " as a INNER JOIN category as b on a.categoryId = b.id";
        que +=" WHERE 1=1 AND a.videoId = '" + id_video + "' ";
    
    // connection.query(que, function(error, rows, fields){
    //     if(error){
    //         callback(error, null);
    //     }
    //     else {
    //         callback(null, rows);
    //     }
    // });

    var rows = await query(que);
    return rows;
};

exports.getFullCategoryByVideos = async(id_video/*, callback*/) => {
    var que = "SELECT a.categoryId,b.name FROM " + TableName + " as a INNER JOIN category as b on a.categoryId = b.id";
        que +=" WHERE 1=1 AND a.videoId = '" + id_video + "' ";
    
    // connection.query(que, function(error, rows, fields){
    //     if(error){
    //         callback(error, null);
    //     }
    //     else {
    //         callback(null, rows);
    //     }
    // });

    var rows = await query(que);
    return rows;
};

exports.insertCategory = async(videoId, categoryId) => {
    var que = "INSERT INTO " + TableName + " (videoId,categoryId) VALUES ('" + videoId +"','" + categoryId +"')";
    var rows = await query(que);
    return rows;
};

exports.updateCategory = async(videoId, categoryId) => {
    var que = "UPDATE " + TableName + " SET categoryId = '" + categoryId + "' WHERE videoId = '" + videoId + "'";
    var rows = await query(que);
    return rows;
};

exports.deleteCategory = async(videoId) => {
    var que = "DELETE FROM " + TableName + " WHERE videoId = '" + videoId + "'";
    var rows = await query(que);
    return rows;
};
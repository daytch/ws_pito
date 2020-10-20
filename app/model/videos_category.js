const connection = require('../config/db.config');
const util = require("util");

const TableName = "videos_category";
const query = util.promisify(connection.query).bind(connection);

exports.getAllRecord = function(callback){
    connection.query("SELECT * FROM " + TableName + " WHERE 1=1", function(error, rows, fields){
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
        que +=" WHERE 1=1 AND a.videoId = " + id_video;
    
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
const { dbmysql } = require('../middlewares');
const TableVideos = "videos";
const TableVideosCategory = "videos_category";

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = function(param, callback){
    var que = "SELECT * FROM " + TableVideos + " WHERE 1=1 ";
    if(param != null){
        if(param.userId != ""){
            que += "userId = '" + param.userId + "' ";
        }
    }
    
    dbmysql.query(que, function(error, rows, fields){
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

exports.getVideosHome = function(callback){
    var que = "SELECT a.*,b.name FROM " + TableVideos + " as a Inner Join users as b ON a.userId = b.id";
        que += " WHERE 1=1 ORDER BY a.startDate DESC LIMIT 10";
    
        dbmysql.query(que, function(error, rows, fields){
        if(error){
            callback(error, null);
        }
        else {
            callback(null, rows);
        }
    });
};

exports.getVideosByCategory = async(id_cat) => {
    var que = "SELECT a.*,b.name FROM " + TableVideos + " as a Inner Join users as b ON a.userId = b.id ";
        que += "INNER JOIN "+TableVideosCategory+" as c on a.id = c.videoId ";
        que += "WHERE c.categoryId = '" + id_cat + "'";
    
    var rows = await query(que);
    return rows;
};
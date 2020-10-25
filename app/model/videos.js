const { dbmysql } = require('../middlewares');
const TableVideos = "videos";

exports.getAllRecord = function(callback){
    dbmysql.query("SELECT * FROM " + TableVideos + " WHERE 1=1", function(error, rows, fields){
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
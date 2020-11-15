const { dbmysql } = require('../middlewares');
const TableVideos = "videos";
const TableVideosCategory = "videos_category";
const TableLikes = "videos_likes";
const TableComment = "videos_comments";

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = function(param, callback){
    var que = "SELECT * FROM " + TableVideos + " WHERE 1=1 ";
    if(param != null){
        if(param.userId != ""){
            que += "userId = '" + param.userId + "' ";
        }
        if(param.id != ""){
            que += "id = '" + param.id + "' ";
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

exports.getVideosById = async(id) => {
    var que = "SELECT a.*,b.name FROM " + TableVideos + " as a Inner Join users as b ON a.userId = b.id";
    que += " WHERE id = " + id;
    
    var rows = await query(que);
    return rows;
};

exports.getCountLikes = async (id) => {
    var que = "SELECT count(*) as cnt FROM " + TableLikes + " WHERE 1=1 ";
        que += "AND videoId = " + id + " AND status = 1"

    var rows = await query(que);
    return rows;
};

exports.getLikesById = async(id) => {
    var que = "SELECT * FROM " + TableLikes + " WHERE userId = " + id;
    var rows = await query(que);
    return rows;
};

exports.updateLikes = async(video_id, user_id, status) => {
    var que = "UPDATE " + TableLikes + " SET status = " + status + ", modifiedAt = now() WHERE userId = " + user_id + " AND videoId = " + video_id;
    var rows = await query(que);
    return rows;
};

exports.insertLikes = async(video_id, user_id, status) => {
    var que = "INSERT INTO " + TableLikes + " (userId, videoId, status, createdAt) ";
        que += "VALUES (" + user_id + "," + video_id + "," + status + ",now())";
    var rows = await query(que);
    return rows;
};

exports.getVideosComment = async(video_id) => {
    var que = "SELECT a.userId,a.text,a.createdAt,b.name FROM " + TableComment + " as a ";
        que += "INNER JOIN users as b on a.userId = b.id ";
        que += "WHERE a.videoId = '" + video_id + "'";
    var rows = await query(que);
    return rows;
};

exports.insertComments = async(video_id, user_id, text) => {
    var que = "INSERT INTO " + TableLikes + " (videoId, userId, text, createdAt) ";
        que += "VALUES (" + video_id + "," + user_id + "," + text + ",now())";
    var rows = await query(que);
    return rows;
};
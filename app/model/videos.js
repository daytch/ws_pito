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

exports.getRecord = async(param) => {
    var que = "SELECT * FROM " + TableVideos + " WHERE 1=1 ";
    if(param != null){
        if(param.userId != ""){
            que += "userId = '" + param.userId + "' ";
        }
        if(param.id != ""){
            que += "id = '" + param.id + "' ";
        }
    }
    
    var rows = await query(que);
    return rows;
};

exports.getVideosHome = function(callback){
    var que = "SELECT * FROM " + TableVideos + " ";
        que += " WHERE 1=1 ORDER BY startDate DESC, ispopular DESC LIMIT 10";
    
        dbmysql.query(que, function(error, rows, fields){
        if(error){
            callback(error, null);
        }
        else {
            callback(null, rows);
        }
    });
};

exports.getVideosByType = async(type) => {
    var que = "SELECT * FROM " + TableVideos + " ";
        que += "WHERE startDate < now() AND endDate > now() ";
    if(type == "popular"){
        que += "AND ispopular = 1 ";
    }
    if(type == "recom"){
        que += "AND isrecom = 1 ";
    }
        que += "ORDER BY startDate DESC LIMIT 10";

    var rows = await query(que);
    return rows;
};

exports.getVideosByCategory = async(id_cat) => {
    var que = "SELECT a.*,b.name FROM " + TableVideos + " as a Inner Join users as b ON a.userId = b.id ";
        que += "LEFT JOIN "+TableVideosCategory+" as c on a.id = c.videoId ";
        que += "WHERE c.categoryId = '" + id_cat + "'";
    
    var rows = await query(que);
    return rows;
};

exports.getVideosById = async(id) => {
    var que = "SELECT a.*,b.name FROM " + TableVideos + " as a Inner Join users as b ON a.userId = b.id";
    que += " WHERE a.id = '" + id + "' ";
    
    var rows = await query(que);
    return rows;
};

exports.getCountVideosByUserId = async(user_id) => {
    var que = "SELECT * FROM " + TableVideos + " ";
    que += " WHERE userId = '" + user_id + "' ";
    
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

exports.getVideosMerchantByMoment = async(merchant_id, mmt) => {
    var que = "SELECT * FROM " + TableVideos + " ";
        que += "WHERE 1=1 ";
    if(merchant_id != ""){
        que += "AND userId = '" + merchant_id + "'";
    }
    if(mmt == "live_videos"){
        que += "AND startDate < now() AND endDate > now() ";
    }
    else if(mmt == "upcoming_videos"){
        que += "AND startDate > now() ";
    }
    else if(mmt == "previous_videos"){
        que += "AND endDate < now() ";
    }
    que += "ORDER by startDate desc LIMIT 10";
    
    var rows = await query(que);
    return rows;
};

exports.getCountVideosByType = async(user_id, type) => {
    var que = "SELECT count(*) as cnt FROM " + TableVideos + " ";
        que += "WHERE 1=1 ";
    if(user_id != ""){
        que += "AND userId = '" + user_id + "'";
    }
    if(type == "live_videos"){
        que += "AND startDate < now() AND endDate > now() ";
    }
    else if(type == "upcoming_videos"){
        que += "AND startDate > now() ";
    }
    else if(type == "previous_videos"){
        que += "AND endDate < now() ";
    }
    else if(type == "popular"){
        que += "AND startDate < now() AND endDate > now() ";
        que += "AND ispopular = 1 ";
    }
    else if(type == "recom"){
        que += "AND startDate < now() AND endDate > now() ";
        que += "AND isrecom = 1 ";
    }
    
    var rows = await query(que);
    return rows;
};

exports.getCountVideosByCat = async(user_id, category) => {
    var que = "SELECT count(*) as cnt FROM " + TableVideos + " as a ";
        que += "INNER JOIN " + TableVideosCategory + " as b on a.id = b.videoId AND b.categoryId = " + category + " ";
        que += "WHERE 1=1 ";
    if(user_id != ""){
        que += "AND a.userId = '" + user_id + "'";
    }
    
    var rows = await query(que);
    return rows;
};

exports.getListVideosPaging = async (user_id, type, offset, limitpage) => {
    var que = "SELECT * FROM " + TableVideos + " ";
        que += "WHERE 1=1 ";
        if(user_id != ""){
            que += "AND userId = '" + user_id + "' ";
        }
        if(type == "live_videos"){
            que += "AND startDate < now() AND endDate > now() ";
        }
        else if(type == "upcoming_videos"){
            que += "AND startDate > now() ";
        }
        else if(type == "previous_videos"){
            que += "AND endDate < now() ";
        }
        else if(type == "popular"){
            que += "AND startDate < now() AND endDate > now() ";
            que += "AND ispopular = 1 ";
        }
        else if(type == "recom"){
            que += "AND startDate < now() AND endDate > now() ";
            que += "AND isrecom = 1 ";
        }
    que += "ORDER BY startDate desc ";
    que += "LIMIT " + offset + "," + limitpage;
    
    var rows = await query(que);
    return rows;
}

exports.getListVideosPagingCat = async(user_id, category, offset, limitpage) => {
    var que = "SELECT a.* FROM " + TableVideos + " as a ";
        que += "INNER JOIN " + TableVideosCategory + " as b on a.id = b.videoId AND b.categoryId = " + category + " ";
        que += "WHERE 1=1 ";
    if(user_id != ""){
        que += "AND a.userId = '" + user_id + "' ";
    }
    que += "ORDER BY startDate desc ";
    que += "LIMIT " + offset + "," + limitpage;
    
    var rows = await query(que);
    return rows;
};

exports.insertVideos = async(param) => {
    var que = "INSERT INTO " + TableVideos + " ";
        que += "(userId,startDate,endDate,title,ig_url,fb_url,tiktok_url,isactive,ispopular,isrecom,`desc`,img_thumbnail,tmp) ";
        que += " VALUES ";
        que += "('"+param.userId+"','"+param.startDate+"','"+param.endDate+"','"+param.title+"','"+param.ig_url+"','"+param.fb_url+"',";
        que += "'"+param.tiktok_url+"','"+param.isActive+"','"+param.ispopular+"','"+param.isrecom+"','"+param.desc+"','"+param.img_thumbnail+"','"+param.tmp+"')";
    var rows = await query(que);
    return rows;
};

exports.getVideosbyTmp = async(tmp, user_id)=>{
    var que = "SELECT * FROM " + TableVideos + " WHERE tmp = '" + tmp +"' AND userId = '" + user_id + "'";
    var rows = await query(que);
    return rows;
};
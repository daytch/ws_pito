const { dbmysql } = require('../middlewares');
const TableVideos = "videos";
const TableVideosCategory = "videos_category";
const TableLikes = "videos_likes";
const TableComment = "videos_comments";
const TableView = "videos_view";
const TableShare = "videos_share";

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = function(param, callback){
    var que = "SELECT * FROM " + TableVideos + " WHERE 1=1 ";
    if(param != null){
        if(param.userId != ""){
            que += "AND userId = '" + param.userId + "' ";
        }
        if(param.id != ""){
            que += "AND id = '" + param.id + "' ";
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
        if(param.userId !== undefined && param.userId != ""){
            que += "AND userId = '" + param.userId + "' ";
        }
        if(param.id !== undefined && param.id != ""){
            que += "AND id = '" + param.id + "' ";
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
    var que = "SELECT a.*";
    if(type == "popular"){
        que += ",(SELECT COUNT(*) FROM favorites f WHERE f.pkey = a.id AND f.type_fav = 'Livestream' AND f.status = 1) as total_like ";
    }
        que += " FROM " + TableVideos + " as a ";
        que += "WHERE a.isactive = 1 ";
    if(type == "popular"){
        que += "AND a.ispopular = 1 ";
        que += "ORDER BY total_like DESC ";
    }
    if(type == "recom"){
        que += "AND a.isrecom = 1 ";
    }
        que += "LIMIT 10";

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
    var que = "SELECT count(*) as cnt FROM " + TableVideos + " ";
    que += " WHERE userId = '" + user_id + "' AND isactive = 1 ";
    
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
        que += "WHERE 1=1 and isactive = 1 ";
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
    que += "ORDER by startDate asc LIMIT 10";
    
    var rows = await query(que);
    return rows;
};

exports.getCountVideosByType = async(user_id, type) => {
    var que = "SELECT count(*) as cnt FROM " + TableVideos + " ";
        que += "WHERE 1=1 AND isactive = 1 ";
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
    else if(type == "recom"){
        que += "AND isrecom = 1 ";
    }
    
    var rows = await query(que);
    return rows;
};

exports.getCountVideosByCat = async(user_id, category, type) => {
    var que = "SELECT count(*) as cnt FROM " + TableVideos + " as a ";
        que += "INNER JOIN " + TableVideosCategory + " as b on a.id = b.videoId AND b.categoryId = " + category + " ";
        que += "WHERE 1=1 and a.isactive = 1 ";
    if(user_id != ""){
        que += "AND a.userId = '" + user_id + "'";
    }
    if(type == "live_videos"){
        que += "AND a.startDate < now() AND a.endDate > now() ";
    }
    else if(type == "upcoming_videos"){
        que += "AND a.startDate > now() ";
    }
    else if(type == "previous_videos"){
        que += "AND a.endDate < now() ";
    }
    
    var rows = await query(que);
    return rows;
};

exports.getListVideosPaging = async (user_id, type, offset, limitpage) => {
    var que = "SELECT *,(SELECT COUNT(*) FROM favorites f WHERE f.pkey = id AND f.type_fav = 'Livestream' AND f.status = 1) as total_like FROM " + TableVideos + " ";
        que += "WHERE 1=1 and isactive = 1 ";
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
        else if(type == "recom"){
            que += "AND startDate < now() AND endDate > now() ";
            que += "AND isrecom = 1 ";
        }

        if(type == "popular"){
            que += "ORDER BY total_like desc ";
        }
        else {
            que += "ORDER BY startDate asc ";
        }
    
    que += "LIMIT " + offset + "," + limitpage;
    
    var rows = await query(que);
    return rows;
}

exports.getListVideosPagingCat = async(user_id, category, type, offset, limitpage) => {
    var que = "SELECT a.* FROM " + TableVideos + " as a ";
        que += "INNER JOIN " + TableVideosCategory + " as b on a.id = b.videoId AND b.categoryId = " + category + " ";
        que += "WHERE a.isactive = 1 ";
    if(user_id != ""){
        que += "AND a.userId = '" + user_id + "' ";
    }
    if(type == "live_videos"){
        que += "AND a.startDate < now() AND a.endDate > now() ";
    }
    else if(type == "upcoming_videos"){
        que += "AND a.startDate > now() ";
    }
    else if(type == "previous_videos"){
        que += "AND a.endDate < now() ";
    }
    que += "ORDER BY a.startDate desc ";
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

exports.replaceVideos = async(param) => {
    var que = "REPLACE INTO " + TableVideos + " ";
        que += "(id,userId,startDate,endDate,title,ig_url,fb_url,tiktok_url,isactive,ispopular,isrecom,`desc`,img_thumbnail,modifiedAt,tmp,createdAt) ";
        que += " VALUES ";
        que += "('"+param.videoId+"','"+param.userId+"','"+param.startDate+"','"+param.endDate+"','"+param.title+"','"+param.ig_url+"','"+param.fb_url+"',";
        que += "'"+param.tiktok_url+"','"+param.isActive+"','"+param.ispopular+"','"+param.isrecom+"','"+param.desc+"','"+param.img_thumbnail+"',now(),'"+param.tmp+"','"+param.createdAt+"')";
    var rows = await query(que);
    return rows;
};

exports.getVideosbyTmp = async(tmp, user_id)=>{
    var que = "SELECT * FROM " + TableVideos + " WHERE tmp = '" + tmp +"' AND userId = '" + user_id + "'";
    var rows = await query(que);
    return rows;
};

exports.getCountVideosByUserIdType = async(user_id, type) => {
    var que = "SELECT count(*) as cnt FROM " + TableVideos + " ";
    que += " WHERE userId = '" + user_id + "' and isactive = 1 ";
    if(type == "live_videos"){
        que += "AND startDate < now() AND endDate > now() ";
    }
    else if(type == "upcoming_videos"){
        que += "AND startDate > now() ";
    }
    else if(type == "previous_videos"){
        que += "AND endDate < now() ";
    }
    
    var rows = await query(que);
    return rows;
};

exports.insertView = async(user_id, video_id) => {
    var que = "INSERT INTO " + TableView + " (userId, videoId, createdAt) VALUES ";
        que += "('" + user_id + "','" + video_id + "',now())";
    var rows = await query(que);
    return rows;
}

exports.getCountView = async(video_id)=>{
    var que = "SELECT COUNT(*) as cnt FROM " + TableView + " WHERE 1=1 ";
        if(video_id !== undefined && video_id != ""){
            que += "AND videoId = '" + video_id + "'";
        }
    var rows = await query(que);
    return rows;
};

exports.getMostViewLivestream = async()=>{
    var que = "SELECT videoId,count(*) as cnt FROM `videos_view` GROUP BY videoId ORDER BY cnt desc LIMIT 10";
    var rows = await query(que);
    return rows;
};

exports.getMostShareLivestream = async()=>{
    var que = "SELECT videoId,count(*) as cnt FROM "+TableShare+" GROUP BY videoId ORDER BY cnt desc LIMIT 10";
    var rows = await query(que);
    return rows;
};

exports.deleteVideos = async(video_id) => {
    var que = "UPDATE "+TableVideos+" SET isactive = 0, modifiedAt = now() WHERE id = '" + video_id + "'";
    var rows = await query(que);
    return rows;
}

exports.getCountViewsByUserId = async(user_id, year, month, day) => {
    var que = "SELECT count(*) as cnt FROM "+TableVideos+" as a INNER JOIN "+TableView+" as b ";
        que += "ON a.id = b.videoId ";
        que += "WHERE a.userId = '" + user_id + "' ";
        if(year !== undefined && year != ""){
            que += "AND year(b.createdAt) = '" + year + "' ";
        }
        if(month !== undefined && month != ""){
            que += "AND month(b.createdAt) = '" + month + "' ";
        }
        if(day !== undefined && day != ""){
            que += "AND day(b.createdAt) = '" + day + "' ";
        }
    
    var rows = await query(que);
    return rows;
}

exports.getCountShareByUserId = async(user_id, year, month, day) => {
    var que = "SELECT count(*) as cnt FROM "+TableVideos+" as a INNER JOIN "+TableShare+" as b ";
        que += "ON a.id = b.videoId ";
        que += "WHERE a.userId = '" + user_id + "' ";
        if(year !== undefined && year != ""){
            que += "AND year(b.createdAt) = '" + year + "' ";
        }
        if(month !== undefined && month != ""){
            que += "AND month(b.createdAt) = '" + month + "' ";
        }
        if(day !== undefined && day != ""){
            que += "AND day(b.createdAt) = '" + day + "' ";
        }
    
    var rows = await query(que);
    return rows;
}

exports.insertShare = async(user_id, video_id) => {
    var que = "INSERT INTO " + TableShare + " (userId, videoId, createdAt) VALUES ";
        que += "('" + user_id + "','" + video_id + "',now())";
    var rows = await query(que);
    return rows;
}

exports.getCountVideosByKeyword = async(keyword) => {
    var que = "SELECT count(*) as cnt FROM " + TableVideos + " ";
    que += " WHERE (title like '%"+keyword+"%' OR `desc` like '%"+keyword+"%') and isactive = 1 ";
    
    var rows = await query(que);
    return rows;
};

exports.getVideosByKeyword = async(keyword, offset, limitpage) => {
    var que = "SELECT * FROM " + TableVideos + " ";
    que += " WHERE (title like '%"+keyword+"%' OR `desc` like '%"+keyword+"%') and isactive = 1 ";
    que += "ORDER BY startDate desc ";
    que += "LIMIT " + offset + "," + limitpage;
    
    var rows = await query(que);
    return rows;
};

exports.getCountShareByVideoId = async(videoId) => {
    var que = "SELECT count(*) as cnt FROM " + TableShare + " WHERE videoId = '" + videoId + "'";
    var rows = await query(que);
    return rows;
}

exports.getVideosByCatIn = async(cat_in, limit, per_page) => {
    var que = "SELECT a.* FROM " + TableVideos + " as a ";
        que += "INNER JOIN " + TableVideosCategory + " as b on a.id = b.videoId AND b.categoryId in (" + cat_in + ") ";
        que += "GROUP BY a.id ORDER BY createdAt desc LIMIT "+limit+","+per_page;

    var rows = await query(que);
    return rows;
}

exports.getCountVideosByCatIn = async(cat_in) => {
    var que = "SELECT COUNT(*) as cnt FROM " + TableVideos + " as a ";
        que += "INNER JOIN " + TableVideosCategory + " as b on a.id = b.videoId AND b.categoryId in (" + cat_in + ") ";
        que += "GROUP BY a.id"

    var rows = await query(que);
    return rows;
}

exports.getHistoryView = async(user_id, offset, limit) => {
    var que = "SELECT Distinct videoId FROM " +TableView+ " WHERE 1=1 ";
        if(user_id != ""){
            que += "AND userId = '" + user_id + "' ";
        }
        que += "ORDER BY createdAt desc ";
        if(offset != "" && limit != ""){
            que += "LIMIT "+offset+","+limit;
        }

    var rows = await query(que);
    return rows;
}

exports.getCountHistoryView = async(user_id) => {
    var que = "SELECT COUNT(Distinct videoId) as cnt FROM " +TableView+ " WHERE 1=1 ";
        if(user_id != ""){
            que += "AND userId = '" + user_id + "' ";
        }

    var rows = await query(que);
    return rows;
}

exports.getVideosByTime = async(start, end) => {
    var que = "SELECT * FROM " + TableVideos + " WHERE 1=1 ";
    que += "AND startDate > '" + start + "' ";
    que += "AND startDate < '" + end + "' ";
    
    var rows = await query(que);
    return rows;
};

exports.getVideosIframe = async(videoId) => {
    var que = "SELECT * FROM videos_iframe WHERE videoId = '" + videoId + "'";
    var rows = await query(que);
    return rows;
}

exports.insertIframe = async(video_id, iframe, width, height) => {
    var que = "INSERT INTO videos_iframe (videoId, iframe, width, height) VALUES ";
        que += "(" + video_id + ",'"+iframe+"'," + width + ","+height+")";
    var rows = await query(que);
    return rows;
}

exports.getCountViewVideosByCat = async(cat_id) => {
    var que = "SELECT COUNT(*) as cnt FROM " + TableVideos + " as a ";
        que += "INNER JOIN " + TableVideosCategory + " as b on a.id = b.videoId AND b.categoryId = " + cat_id + " ";
        que += "INNER JOIN " + TableView + " as c on a.id = c.videoId ";

    var rows = await query(que);
    return rows;
}
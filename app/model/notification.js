const { dbmysql } = require('../middlewares');
const util = require("util");
const TableName = "notification";

const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getRecord = async(id, user_id, video_id, isRead) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
    if(id != ""){
        que += "AND id = '" + id + "' ";
    }
    if(user_id != ""){
        que += "AND userId = '" + user_id + "' ";
    }
    if(video_id != ""){
        que += "AND videoId = '" + video_id + "' ";
    }
    if(isRead != ""){
        que += "AND isRead = '" + isRead + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.getCountRecord = async(id, user_id, video_id, isRead) => {
    var que = "SELECT COUNT(*) as cnt FROM " + TableName + " WHERE 1=1 ";
    if(id != ""){
        que += "AND id = '" + id + "' ";
    }
    if(user_id != ""){
        que += "AND userId = '" + user_id + "' ";
    }
    if(video_id != ""){
        que += "AND videoId = '" + video_id + "' ";
    }
    if(isRead != ""){
        que += "AND isRead = '" + isRead + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.getListPaging = async(id, user_id, video_id, isRead, offset, per_page) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
    if(id != ""){
        que += "AND id = '" + id + "' ";
    }
    if(user_id != ""){
        que += "AND userId = '" + user_id + "' ";
    }
    if(video_id != ""){
        que += "AND videoId = '" + video_id + "' ";
    }
    if(isRead != ""){
        que += "AND isRead = '" + isRead + "' ";
    }
    que += "ORDER BY createdAt desc ";
    que += "LIMIT "+offset+","+per_page+" ";

    var rows = await query(que);
    return rows;
};

exports.updateReadLastId = async(last_id, user_id, isRead) => {
    var que = "UPDATE " + TableName + " SET isRead = '" + isRead + "' WHERE id < '" + (last_id+1) + "' AND userId = '" + user_id + "'";

    var rows = await query(que);
    return rows;
}
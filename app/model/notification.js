const { dbmysql } = require('../middlewares');
const util = require("util");
const TableName = "notification";

const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getRecord = async(id, user_id, pkey, isRead) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
    if(id != ""){
        que += "AND id = '" + id + "' ";
    }
    if(user_id != ""){
        que += "AND userId = '" + user_id + "' ";
    }
    if(pkey != ""){
        que += "AND pkey = '" + pkey + "' ";
    }
    if(isRead != ""){
        que += "AND isRead = '" + isRead + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.getCountRecord = async(id, user_id, pkey, isRead) => {
    var que = "SELECT COUNT(*) as cnt FROM " + TableName + " WHERE 1=1 ";
    if(id != ""){
        que += "AND id = '" + id + "' ";
    }
    if(user_id != ""){
        que += "AND userId = '" + user_id + "' ";
    }
    if(pkey != ""){
        que += "AND pkey = '" + pkey + "' ";
    }
    if(isRead != ""){
        que += "AND isRead = '" + isRead + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.getListPaging = async(id, user_id, pkey, isRead, offset, per_page, type) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
    if(id != ""){
        que += "AND id = '" + id + "' ";
    }
    if(user_id != ""){
        que += "AND userId = '" + user_id + "' ";
    }
    if(pkey != ""){
        que += "AND pkey = '" + pkey + "' ";
    }
    if(isRead != ""){
        que += "AND isRead = '" + isRead + "' ";
    }
    if(type != ""){
        que += "AND type = '" + type + "' ";
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

exports.insertRecord = async(user_id, pkey, type, title, description, isRead) => {
    var que = "INSERT INTO " + TableName + " (userId,pkey,type,title,description,isRead,createdAt) ";
        que += "VALUES ('" + user_id + "','" + pkey + "','"+type+"','" + title + "','" + description + "','" + isRead + "',now())";

    var rows = await query(que);
    return rows;
}

exports.getJobNotif = async(pkey, type) => {
    var que = "SELECT * FROM job_notification WHERE pkey = '"+pkey+"' AND type = '"+type+"'";
    var rows = await query(que);
    return rows;
}

exports.insertJobNotif = async(pkey, type) => {
    var que = "INSERT INTO job_notification (pkey, type) VALUES ('"+pkey+"','"+type+"')";
    var rows = await query(que);
    return rows;
}
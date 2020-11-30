const { dbmysql } = require('../middlewares');
const util = require("util");
const { user } = require('../config/db.config');
const TableName = "favorites";

const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = async () => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";

    var rows = await query(que);
    return rows;
};

exports.getRecord = async(user_id, type, status, pkey) => {
    var que = "SELECT * FROM " + TableName + " WHERE 1=1 ";
    if(user_id != ""){
        que += "AND userId = '" + user_id + "' ";
    }
    if(type != ""){
        que += "AND type_fav = '" + type + "' ";
    }
    if(status != ""){
        que += "AND status = '" + status + "' ";
    }
    if(pkey != ""){
        que += "AND pkey = '" + pkey + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.submitRecord = async(user_id, type, status, pkey, isCreate) => {
    var que = "REPLACE INTO " + TableName + " ";
        que += "(userId, type_fav, status, pkey";
        if(isCreate){
            que += ",createdAt) "
        }
        else {
            que += ",modifiedAt) "
        }
        que += "VALUES ('" + user_id + "','" + type + "','" + status + "','" + pkey + "',now())";

    var rows = await query(que);
    return rows;
}

exports.getCountRecord = async(user_id, type, status, pkey) => {
    var que = "SELECT count(*) as cnt FROM " + TableName + " WHERE 1=1 ";
    if(user_id != ""){
        que += "AND userId = '" + user_id + "' ";
    }
    if(type != ""){
        que += "AND type_fav = '" + type + "' ";
    }
    if(status != ""){
        que += "AND status = '" + status + "' ";
    }
    if(pkey != ""){
        que += "AND pkey = '" + pkey + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.getRecordLivestream = async(user_id, status, offset, per_page, sort_by) => {
    var que = "SELECT b.* FROM " + TableName + " as a INNER JOIN videos as b ";
        que += "ON a.pkey = b.id AND a.id = 'Livestream' ";
        que += "userId = '" + user_id + "' AND status = '"+ status +"' ";
        if(sort_by == "live_videos"){
            que += "ORDER BY startDate < now() AND endDate > now() desc ";
        }
        else if(sort_by == "upcoming_videos"){
            que += "ORDER BY startDate desc";
        }
        que += "LIMIT "+offset+","+per_page+" ";

    var rows = await query(que);
    return rows;
}
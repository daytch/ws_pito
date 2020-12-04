const { dbmysql } = require('../middlewares');
const util = require("util");
const TableName = "favorites";
const TableUsers = "users";
const TableUsersRole = "users_roles";
const TableUserDetails = "users_details";
const TableMerchDetails = "merchant_details";

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
        que += "ON a.pkey = b.id AND a.type_fav = 'Livestream' ";
        que += "WHERE a.userId = '" + user_id + "' AND a.status = '"+ status +"' ";
        if(sort_by == "most_popular"){
            que += "ORDER BY b.ispopular desc, b.startDate desc ";
        }
        else if(sort_by == "most_recent"){
            que += "ORDER BY b.startDate desc ";
        }
        else if(sort_by == "most_livestream"){
            que += "ORDER BY b.startDate desc ";
        }
        que += "LIMIT "+offset+","+per_page+" ";

    var rows = await query(que);
    return rows;
}

exports.getRecordMerchant = async(user_id, status, offset, per_page, sort_by, role_id) => {
    var que = "SELECT a.id,a.name,c.img_avatar,d.createdAt,d.about,d.fb_url,d.ig_url,d.tiktok_url ";
        que += "FROM " + TableName + " as e ";
        que += "INNER JOIN " + TableUsers + " as a ";
        que += "ON a.id = e.pkey AND e.type_fav = 'Merchant' ";
        que += "LEFT JOIN " + TableUsersRole + " as b ";
        que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
        que += "LEFT JOIN " + TableUserDetails + " as c ";
        que += "ON a.id = c.userId ";
        que += "LEFT JOIN " + TableMerchDetails + " as d ";
        que += "ON a.id = d.userId ";
        que += "LEFT JOIN videos as f ";
        que += "ON a.id = f.userId ";
        que += "WHERE e.userId = '" + user_id + "' AND e.status = '" + status + "' ";
        que += "GROUP BY a.id ";
    if(sort_by == "most_popular"){
        que += "ORDER BY d.ispopular desc ";
    }
    else if(sort_by == "most_recent"){
        que += "ORDER BY d.createdAt desc ";
    }
    else if(sort_by == "most_livestream"){
        que += "ORDER BY f.startDate desc ";
    }
    que += "LIMIT "+offset+","+per_page+" ";

    var rows = await query(que);
    return rows;
}
const { dbmysql } = require('../middlewares');
const TableUsers = "users";
const TableUsersRole = "users_roles";
const TableRoles = "roles";
const TableUserDetails = "users_details";
const TableUserForgotPass = "user_forgotpassword";
const TableMerchDetails = "merchant_details";
const TableToken = "user_token_notif";
const moment = require("moment");

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = async(param) => {
    var que = "SELECT * FROM " + TableUsers + " WHERE 1=1 ";
    if(param.email != undefined && param.email != ""){
        que += "AND email = '" + param.email + "' ";
    }
    if(param.password != undefined){
        que += "AND password = '" + param.password + "' ";
    }
    if(param.id != undefined && param.id != ""){
        que += "AND id = '" + param.id + "' ";
    }
    if(param.isActive != undefined && param.isActive != ""){
        que += "AND isactive = '" + param.isActive + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.getCountRecord = async(param) => {
    var que = "SELECT COUNT(*) as cnt FROM " + TableUsers + " WHERE 1=1 ";
    if(param.email != undefined && param.email != ""){
        que += "AND email = '" + param.email + "' ";
    }
    if(param.password != undefined){
        que += "AND password = '" + param.password + "' ";
    }
    if(param.id != undefined && param.id != ""){
        que += "AND id = '" + param.id + "' ";
    }
    if(param.isActive != undefined && param.isActive != ""){
        que += "AND isactive = '" + param.isActive + "' ";
    }
    if(param.year != undefined && param.year != ""){
        que += "AND year(createdAt) = '" + param.year + "' ";
    }
    if(param.month != undefined && param.month != ""){
        que += "AND month(createdAt) = '" + param.month + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.loginUser = function(email, role, res, callback){
    var que = "SELECT a.*,b.roleId,c.name as role_name FROM " + TableUsers + " as a "
            + " INNER JOIN " + TableUsersRole + " as b on a.id = b.userId "
            + " LEFT JOIN " + TableRoles + " as c on b.roleId = c.id "
            // + " WHERE a.email = '" + email + "' AND a.password = '" + password + "' "
            + " WHERE a.email = '" + email + "' "
            + " AND a.isactive = 1 ";
    // if(role != ""){
    //     que += " AND c.name = '" + role + "'";
    // }

    dbmysql.query(que, function(error, rows, fields){
        if(error){
            callback(error, null, res, role);
        }
        else {
            callback(null, rows, res, role);
        }
    });
};

exports.loginUserSSO = async(email, role) => {
    var que = "SELECT a.*,b.roleId,c.name as role_name FROM " + TableUsers + " as a "
            + " INNER JOIN " + TableUsersRole + " as b on a.id = b.userId "
            + " INNER JOIN " + TableRoles + " as c on b.roleId = c.id "
            + " WHERE a.email = '" + email + "' ";
            + " AND a.isactive = 1 ";
    if(role != ""){
        que += " AND c.name = '" + role + "'";
    }

    var rows = await query(que);
    return rows;
};

exports.registerUser = function(param, callback){
    var que = "INSERT INTO " + TableUsers + " (email,password,name,isActive,source) ";
        que += "VALUES ('" + param.email + "','" + param.password + "',";
        que += "'" + param.name + "',1,'" + param.source + "' )";
    
    dbmysql.query(que, function(error,rows,fields){
        if(error){
            callback(error, null);
        }
        else {
            callback(null, rows);
        }
    });
}

exports.registerUsersRole = function(param, callback){
    var que = "INSERT INTO " + TableUsersRole + " (userId, roleId) ";
        que += "VALUES ('" + param.userId + "','" + param.roleId + "')";

    dbmysql.query(que, function(error,rows,fields){
        if(error){
            callback(error, null);
        }
        else {
            callback(null, rows);
        }
    });
}

exports.registerUsersRoleAwait = async(param) => {
    var que = "INSERT INTO " + TableUsersRole + " (userId, roleId) ";
        que += "VALUES ('" + param.userId + "','" + param.roleId + "')";

    var rows = await query(que);
    return rows;
}

exports.getUserDetails = async(user_id) => {
    var que = "SELECT a.*,b.name,b.email,b.source,b.isActive FROM " + TableUserDetails + " as a "
        que += "LEFT JOIN "+ TableUsers + " as b on a.userId = b.id WHERE 1=1 ";
    if(user_id != null && user_id != ""){
        que += "AND a.userId = '" + user_id + "'";
    }

    var rows = await query(que);
    return rows;
}

exports.getUserDetailsWithName = async(user_id) => {
    var que = "SELECT a.*,b.name FROM " + TableUserDetails + " as a ";
        que += "INNER JOIN " + TableUsers + " as b on a.userId = b.id WHERE 1=1 ";
    if(user_id != null && user_id != ""){
        que += "AND a.userId = " + user_id;
    }

    var rows = await query(que);
    return rows;
}

exports.insertUsertDetails = async(param) => {
    var que = "REPLACE INTO " + TableUserDetails + " (userId,img_avatar";
    if(param.isMute !== undefined && param.isMute != ""){
        que += ",isMute";
    }
    que += ") VALUES (" + param.userId + ", '" + param.img_avatar + "'";
    if(param.isMute !== undefined && param.isMute != ""){
        que += ",'"+param.isMute+"'";
    }
    que += ")";
    

    var rows = await query(que);
    return rows;
}

exports.getRolesByName = async(name) => {
    var que = "SELECT * FROM " + TableRoles + " WHERE name = '" + name + "'";

    var rows = await query(que);
    return rows;
}

exports.getListMerchant = async(role_id, id_merchant, type, offset, per_page) => {
    var que = "SELECT a.id,a.name,a.email,c.img_avatar,d.createdAt,d.about,d.fb_url,d.ig_url,d.tiktok_url,a.last_login,a.isActive";
    if(type != undefined && type == "popular"){
        que += ",(SELECT COUNT(*) FROM favorites f WHERE f.pkey = a.id AND f.type_fav = 'Merchant' AND f.status = 1) as total_subs ";
    }
        que += " FROM " + TableUsers + " as a ";
        que += "INNER JOIN " + TableUsersRole + " as b ";
        que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
        que += "INNER JOIN " + TableUserDetails + " as c ";
        que += "ON a.id = c.userId ";
        que += "INNER JOIN " + TableMerchDetails + " as d ";
        que += "ON a.id = d.userId ";
        que += "WHERE 1=1 ";
    if(id_merchant != undefined && id_merchant > 0){
        que += "AND a.id = '" + id_merchant + "' ";
    }
    else if(type != undefined && type == "recom"){
        que += "AND d.isrecom = 1 ";
    }
    else if(type != undefined && type == "new_comer"){
        // 30 Day Join
        que += "AND date(d.createdAt) between '"+moment().subtract(30,"days").format("YYYY-MM-DD")+"' AND '"+moment().add(1,"days").format("YYYY-MM-DD")+"'";
    }

    if(type != undefined && type == "popular"){
        que += "ORDER BY total_subs desc ";
    }
    else {
        que += "ORDER BY d.createdAt desc ";
    }
    que += "LIMIT "+offset+","+per_page+" ";

    var rows = await query(que);
    return rows;
}

exports.getListMerchantRecom = async(role_id, id_merchant, type, offset, per_page, cat_in) => {
    var que = "SELECT a.id,a.name,a.email,c.img_avatar,d.createdAt,d.about,d.fb_url,d.ig_url,d.tiktok_url,a.last_login";
        que += ",(SELECT COUNT(*) FROM favorites f WHERE f.pkey = a.id AND f.type_fav = 'Merchant' AND f.status = 1) as total_subs ";
        que += " FROM " + TableUsers + " as a ";
        que += "INNER JOIN " + TableUsersRole + " as b ";
        que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
        que += "INNER JOIN " + TableUserDetails + " as c ";
        que += "ON a.id = c.userId ";
        que += "INNER JOIN " + TableMerchDetails + " as d ";
        que += "ON a.id = d.userId ";
        que += "INNER JOIN merchant_category as mc on a.id = mc.userId AND mc.category_id in ("+cat_in+") ";
        que += "WHERE 1=1 ";
    if(id_merchant != undefined && id_merchant > 0){
        que += "AND a.id = '" + id_merchant + "' ";
    }
    que += "GROUP BY a.id ";
    que += "ORDER BY total_subs desc ";
    que += "LIMIT "+offset+","+per_page+" ";

    var rows = await query(que);
    return rows;
}

exports.getCountListMerchant = async(role_id, id_merchant, type) => {
    var que = "SELECT count(*) as cnt FROM " + TableUsers + " as a ";
        que += "INNER JOIN " + TableUsersRole + " as b ";
        que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
        que += "INNER JOIN " + TableUserDetails + " as c ";
        que += "ON a.id = c.userId ";
        que += "INNER JOIN " + TableMerchDetails + " as d ";
        que += "ON a.id = d.userId ";
        que += "WHERE 1=1 ";
    if(id_merchant != undefined && id_merchant > 0){
        que += "AND a.id = '" + id_merchant + "' ";
    }
    else if(type != undefined && type == "recom"){
        que += "AND d.isrecom = 1 ";
    }
    else if(type != undefined && type == "new_comer"){
        // 30 Day Join
        que += "AND date(d.createdAt) between '"+moment().subtract(30,"days").format("YYYY-MM-DD")+"' AND '"+moment().add(1,"days").format("YYYY-MM-DD")+"'";
    }

    var rows = await query(que);
    return rows;
}

exports.getCountListMerchantRecom = async(role_id, id_merchant, type, cat_in) => {
    var que = "SELECT count(*) as cnt FROM " + TableUsers + " as a ";
        que += "INNER JOIN " + TableUsersRole + " as b ";
        que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
        que += "INNER JOIN " + TableUserDetails + " as c ";
        que += "ON a.id = c.userId ";
        que += "INNER JOIN " + TableMerchDetails + " as d ";
        que += "ON a.id = d.userId ";
        que += "INNER JOIN merchant_category as mc on a.id = mc.id AND mc.category_id in ("+cat_in+") ";
        que += "WHERE 1=1 ";
    if(id_merchant != undefined && id_merchant > 0){
        que += "AND a.id = '" + id_merchant + "' ";
    }

    var rows = await query(que);
    return rows;
}

exports.getCountListMerchantByYear = async(role_id, id_merchant, type, year, month) => {
    var que = "SELECT count(*) as cnt FROM " + TableUsers + " as a ";
        que += "INNER JOIN " + TableUsersRole + " as b ";
        que += "ON a.id = b.userId AND b.roleId = '" + role_id + "' ";
        que += "INNER JOIN " + TableUserDetails + " as c ";
        que += "ON a.id = c.userId ";
        que += "INNER JOIN " + TableMerchDetails + " as d ";
        que += "ON a.id = d.userId ";
        que += "WHERE 1=1 ";
    if(id_merchant != undefined && id_merchant > 0){
        que += "AND a.id = '" + id_merchant + "' ";
    }
    if(type != undefined && type == "popular"){
        que += "AND d.ispopular = 1 ";
    }
    else if(type != undefined && type == "recom"){
        que += "AND d.isrecom = 1 ";
    }
    else if(type != undefined && type == "new_comer"){
        // 30 Day Join
        que += "AND date(d.createdAt) between '"+moment().subtract(30,"days").format("YYYY-MM-DD")+"' AND '"+moment().add(1,"days").format("YYYY-MM-DD")+"'";
    }
    if(year != undefined && year > 0){
        que += "AND year(d.createdAt) = '" + year + "' ";
    }
    if(year != undefined && year > 0){
        que += "AND month(d.createdAt) = '" + month + "' ";
    }

    var rows = await query(que);
    return rows;
}

exports.getRecordForgotPass = async(token) => {
    var que = "SELECT * FROM " + TableUserForgotPass + " WHERE 1=1 ";
    if(token != null && token != ""){
        que += "AND token = '" + token + "'";
    }

    var rows = await query(que);
    return rows;
}

exports.insertForgotPass = async(email, status, expired_time, token) => {
    var que = "INSERT INTO " + TableUserForgotPass + " (email, status, expired_time, token) ";
        que += "VALUES ('" + email + "','" + status + "','" + expired_time + "','" + token + "')";

    var rows = await query(que);
    return rows;
}

exports.changePassword = async(userId, password) => {
    var que = "UPDATE " + TableUsers + " SET password = '" + password + "' ";
        que += "WHERE id = '" + userId + "' ";
    
    var rows = await query(que);
    return rows;
}

exports.updateName = async(name, user_id) => {
    var que = "UPDATE " + TableUsers + " SET name = '" + name + "' ";
        que += "WHERE id = '" + user_id + "' ";
    
    var rows = await query(que);
    return rows;
}

exports.updateMute = async(user_id, isMute) => {
    var que = "UPDATE " + TableUserDetails + " SET isMute = '" + isMute + "' WHERE userId = '" + user_id + "'";
    var rows = await query(que);
    return rows;
}

exports.updateAvatar = async(user_id, img_avatar) => {
    var que = "UPDATE " + TableUserDetails + " SET img_avatar = '" + img_avatar + "' WHERE userId = '" + user_id + "'";
    var rows = await query(que);
    return rows;
}

exports.getRecordToken = async(token, userId, type_device) => {
    var que = "SELECT * FROM " + TableToken + " WHERE 1=1 ";
        que += "AND token = '" + token + "' AND type_device = '" + type_device + "' AND userId = '" + userId + "'";

    var rows = await query(que);
    return rows;
}

exports.insertToken = async(token, userId, type_device) => {
    var que = "INSERT INTO " + TableToken + " (token, userId, type_device, createdAt) ";
        que += "VALUES ('" + token + "','" + userId + "','" + type_device + "',now())";

    var rows = await query(que);
    return rows;
}

exports.getLastToken = async(userId, type_device) => {
    var que = "SELECT * FROM " + TableToken + " WHERE 1=1 ";
        if(userId !== undefined && userId != ""){
            que += "AND userId = '" + userId + "' ";
        }
        if(type_device !== undefined && type_device != ""){
            que += "AND type_device = '" + type_device + "' ";
        }
        que += "AND (token <> '' AND token <> 'undefined') ";
        que += "ORDER BY createdAt desc LIMIT 1";
    
    var rows = await query(que);
    return rows;
}

exports.updateLastLogin = async(user_id) => {
    var que = "UPDATE " + TableUsers + " SET last_login = now() WHERE id = '" + user_id + "'";
    var rows = await query(que);
    return rows;
}

exports.deleteToken = async(token, userId, type_device) => {
    var que = "DELETE FROM " + TableToken + " WHERE userId = '"+userId+"' AND token = '"+token+"' AND type_device = '"+type_device+"'";

    var rows = await query(que);
    return rows;
}

exports.updateActive = async(user_id, isActive) => {
    var que = "UPDATE " + TableUsers + " SET isActive = "+isActive+" WHERE id = '" + user_id + "'";
    var rows = await query(que);
    return rows;
}
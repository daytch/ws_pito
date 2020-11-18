const { dbmysql } = require('../middlewares');
const TableUsers = "users";
const TableUsersRole = "users_roles";
const TableRoles = "roles";
const TableUserDetails = "users_details";
const TableUserForgotPass = "user_forgotpassword";

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

    var rows = await query(que);
    return rows;
};

exports.loginUser = function(email, password, role, res, callback){
    var que = "SELECT a.*,b.roleId,c.name as role_name FROM " + TableUsers + " as a "
            + " INNER JOIN " + TableUsersRole + " as b on a.id = b.userId "
            + " INNER JOIN " + TableRoles + " as c on b.roleId = c.id "
            + " WHERE a.email = '" + email + "' AND a.password = '" + password + "' "
            + " AND a.isactive = 1 ";
    if(role != ""){
        que += " AND c.name = '" + role + "'";
    }

    dbmysql.query(que, function(error, rows, fields){
        if(error){
            callback(error, null, res);
        }
        else {
            callback(null, rows, res);
        }
    });
};

exports.loginUserSSO = function(email, role, res, callback){
    var que = "SELECT a.*,b.roleId,c.name as role_name FROM " + TableUsers + " as a "
            + " INNER JOIN " + TableUsersRole + " as b on a.id = b.userId "
            + " INNER JOIN " + TableRoles + " as c on b.roleId = c.id "
            + " WHERE a.email = '" + email + "' ";
            + " AND a.isactive = 1 ";
    if(role != ""){
        que += " AND c.name = '" + role + "'";
    }

    dbmysql.query(que, function(error, rows, fields){
        if(error){
            callback(error, null, res);
        }
        else {
            callback(null, rows, res);
        }
    });
};

exports.registerUser = function(param, callback){
    var que = "INSERT INTO " + TableUsers + " (email,password,name,isActive) ";
        que += "VALUES ('" + param.email + "','" + param.password + "',";
        que += "'" + param.name + "',1)";
    
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
    var que = "SELECT * FROM " + TableUserDetails + " WHERE 1=1 ";
    if(user_id != null && user_id != ""){
        que += "AND userId = " + user_id;
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
    var que = "REPLACE INTO " + TableUserDetails + " VALUES (" + param.userId + ", '" + param.first_name + "',";
        que += "'" + param.last_name + "','" + param.about_me + "','" + param.fb_url + "','" + param.ig_url + "',";
        que += "'" + param.tiktok_url + "','" + param.img_avatar + "')";

    var rows = await query(que);
    return rows;
}

exports.getRolesByName = async(name) => {
    var que = "SELECT * FROM " + TableRoles + " name = '" + name + "'";

    var rows = await query(que);
    return rows;
}

exports.getListMerchant = async(role_id, id_merchant) => {
    var que = "SELECT c.userId,c.first_name FROM " + TableUsers + " as a ";
        que += "INNER JOIN " + TableUsersRole + " as b ";
        que += "ON a.id = b.userId ";
        que += "INNER JOIN " + TableUserDetails + " as c ";
        que += "ON a.id = c.userId ";
        que += "WHERE b.roleId = '" + role_id + "' ";
    if(id_merchant != undefined && id_merchant > 0){
        que += "AND a.id = '" + id_merchant + "' ";
    }

    var rows = await query(que);
    return rows;
}

exports.getRecordForgotPass = async(token) => {
    var que = "SELECT * FROM " + TableUserForgotPass + " WHERE 1=1 ";
    if(token != null && token != ""){
        que += "AND token = " + token;
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

exports.changePassword = async(email, password) => {
    var que = "UPDATE " + TableUsers + " SET password = '" + password + "' ";
        que += "WHERE email = '" + email + "' ";
    
    var rows = await query(que);
    return rows;
}
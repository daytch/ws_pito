const { dbmysql } = require('../middlewares');
const TableUsers = "users";
const TableUsersRole = "users_roles";
const TableRoles = "roles";

const util = require("util");
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = async(param) => {
    var que = "SELECT * FROM " + TableUsers + " WHERE 1=1 ";
    if(param.username != ""){
        que += "AND username = '" + param.username + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.loginUser = function(username, password, role, res, callback){
    var que = "SELECT a.*,b.roleId,c.name as role_name FROM " + TableUsers + " as a "
            + " INNER JOIN " + TableUsersRole + " as b on a.id = b.userId "
            + " INNER JOIN " + TableRoles + " as c on b.roleId = c.id "
            + " WHERE a.username = '" + username + "' AND a.password = '" + password + "' "
            + " AND a.isactive = true ";
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
    var que = "INSERT INTO " + TableUsers + " (username,email,password,name) ";
        que += "VALUES ('" + param.username + "','" + param.email + "','" + param.password + "',";
        que += "'" + param.name + "')";
    
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
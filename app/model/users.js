const connection = require('../config/db.config');
const TableUsers = "users";
const TableUsersRole = "users_roles";
const TableRoles = "roles";

exports.getAllRecord = function(callback){
    connection.query("SELECT * FROM " + TableUsers + " WHERE 1=1", function(error, rows, fields){
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

exports.loginUser = function(username, password, role, res, callback){
    var que = "SELECT a.*,b.roleId,c.name as role_name FROM " + TableUsers + " as a "
            + " INNER JOIN " + TableUsersRole + " as b on a.id = b.userId "
            + " INNER JOIN " + TableRoles + " as c on b.roleId = c.id "
            + " WHERE a.username = '" + username + "' AND a.password = '" + password + "' "
            + " AND a.isactive = true ";
    if(role != ""){
        que += " AND c.name = '" + role + "'";
    }

    connection.query(que, function(error, rows, fields){
        if(error){
            callback(error, null, res);
        }
        else {
            callback(null, rows, res);
        }
    });
};
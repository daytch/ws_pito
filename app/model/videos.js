const connection = require('../config/db.config');
const TableVideos = "videos";

exports.getAllRecord = function(callback){
    connection.query("SELECT * FROM " + TableVideos + " WHERE 1=1", function(error, rows, fields){
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

exports.loginUser = function(username, password, callback){
    var q = "SELECT * FROM " + TableVideos + " WHERE 1=1 ";
    

    connection.query("SELECT a.*,b.roleId FROM " + TableUsers + " as a "
                    + " INNER JOIN " + TableUsersRole + " as b on a.id = b.userId "
                    + " WHERE a.username = '" + username + "' AND a.password = '" + password + "' "
                    + " AND a.isactive = true",
                    function(error, rows, fields){
        if(error){
            callback(error, null);
        }
        else {
            callback(null, rows);
        }
    });
};
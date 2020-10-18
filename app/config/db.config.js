var mysql = require('mysql');

var con = mysql.createConnection({
  host: "5.189.134.84",
  user: "root",
  password: "",
  database: "pito_db"
});

con.connect(function (err){
    if(err) throw err;
});

module.exports = con;
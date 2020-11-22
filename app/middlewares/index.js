const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");
const dbmysql = require("./dbmysql");
const mailer = require("./sendMail");
const uploadfile = require("./uploadfile");

module.exports = {
  authJwt,
  verifySignUp,
  dbmysql,
  mailer,
  uploadfile
};
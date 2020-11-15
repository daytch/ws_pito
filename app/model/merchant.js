const { dbmysql } = require('../middlewares');
const util = require("util");
const TableDetails = "merchant_details";
const TableSubs = "merchant_subs";

const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getRecord = async (param) => {
    var que = "SELECT * FROM " + TableDetails + " WHERE 1=1 ";
    if(param.userId != undefined && param.userId != ""){
        que += "AND userId = " + param.userId;
    }

    var rows = await query(que);
    return rows;
};

exports.insertMerchantDetails = async(param) => {
    var que = "REPLACE INTO " + TableDetails + " VALUES (" + param.userId + ", '" + param.fb_url + "',";
        que += "'" + param.ig_url + "','" + param.tiktok_url + "')";

    var rows = await query(que);
    return rows;
}

exports.getCountSubs = async (merchant_id) => {
    var que = "SELECT count(*) as cnt FROM " + TableDetails + " WHERE 1=1 ";
    if(merchant_id != undefined && merchant_id != ""){
        que += "AND merchantid = " + merchant_id;
    }

    var rows = await query(que);
    return rows;
};
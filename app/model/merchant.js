const { dbmysql } = require('../middlewares');
const util = require("util");
const TableDetails = "merchant_details";
const TableSubs = "merchant_subs";
const TableMerchCat = "merchant_category";

const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getRecord = async (param) => {
    var que = "SELECT * FROM " + TableDetails + " WHERE 1=1 ";
    if(param.userId != undefined && param.userId != ""){
        que += "AND userId = '" + param.userId + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.insertMerchantDetails = async(param) => {
    var que = "REPLACE INTO " + TableDetails + " (userId,fb_url,ig_url,tiktok_url,ispopular,isrecom) VALUES (" + param.userId + ", '" + param.fb_url + "',";
        que += "'" + param.ig_url + "','" + param.tiktok_url + "',1,0)";

    var rows = await query(que);
    return rows;
}

exports.getCountSubs = async (merchant_id) => {
    var que = "SELECT count(*) as cnt FROM " + TableSubs + " WHERE 1=1 ";
    if(merchant_id != undefined && merchant_id != ""){
        que += "AND merchantid = " + merchant_id;
    }

    var rows = await query(que);
    return rows;
};

exports.getCountSubsById = async (merchant_id, user_id) => {
    var que = "SELECT * FROM " + TableSubs + " WHERE 1=1 ";
    if(merchant_id != undefined && merchant_id != ""){
        que += "AND merchantid = '" + merchant_id + "' ";
    }
    if(user_id != undefined && user_id != ""){
        que += "AND userid = '" + user_id + "' ";
    }

    var rows = await query(que);
    return rows;
};

exports.getCategoryByUserId = async(user_id) => {
    var que = "SELECT b.name FROM " + TableMerchCat + " as a INNER JOIN category as b on a.category_id = b.id";
        que +=" WHERE a.userId = '" + user_id + "' ";
    
    var rows = await query(que);
    return rows;
};
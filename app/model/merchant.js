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
    var que = "INSERT INTO " + TableDetails + " (userId,fb_url,ig_url,tiktok_url,ispopular,isrecom) VALUES (" + param.userId + ", '" + param.fb_url + "',";
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

exports.getFullCategoryByUserId = async(user_id) => {
    var que = "SELECT a.category_id,b.name FROM " + TableMerchCat + " as a INNER JOIN category as b on a.category_id = b.id";
        que +=" WHERE a.userId = '" + user_id + "' ";
    
    var rows = await query(que);
    return rows;
};

exports.updateMerchantDetails = async(param) => {
    var que = "UPDATE " + TableDetails + " SET ";
        if(param.fb_url !== undefined){
            que += "fb_url = '" + param.fb_url + "', ";
        }
        if(param.ig_url !== undefined){
            que += "ig_url = '" + param.ig_url + "', ";
        }
        if(param.tiktok_url !== undefined){
            que += "tiktok_url = '" + param.tiktok_url + "', ";
        }
        if(param.company_name !== undefined){
            que += "company_name = '" + param.company_name + "', ";
        }
        if(param.about !== undefined){
            que += "about = '" + param.about + "', ";
        }
        if(param.company_website !== undefined){
            que += "company_website = '" + param.company_website + "', ";
        }
        if(param.ispopular !== undefined){
            que += "ispopular = '" + param.ispopular + "', ";
        }
        if(param.isrecom !== undefined){
            que += "isrecom = '" + param.isrecom + "', ";
        }
        que += "modifiedAt = now() ";
        que += "WHERE userId = '" + param.userId + "'";

    var rows = await query(que);
    return rows;
}

exports.deleteCategory = async(user_id) => {
    var que = "DELETE FROM " + TableMerchCat + " WHERE userId = '" + user_id + "'";
    var rows = await query(que);
    return rows;
}

exports.insertCategory = async(user_id, category_id) => {
    var que = "INSERT INTO " + TableMerchCat + " (userId, category_id) VALUES ('" + user_id + "','" + category_id + "')";
    var rows = await query(que);
    return rows;
}

exports.getCountCategory = async(cat_id) => {
    var que = "SELECT COUNT(*) as cnt FROM merchant_details as a INNER JOIN merchant_category as b on a.userId = b.userId ";
        que +=" WHERE b.category_id = "+cat_id;
    
    var rows = await query(que);
    return rows;
};

exports.getDistCategoryByUserIn = async(user_in) => {
    var que = "SELECT DISTINCT category_id FROM " + TableMerchCat + " ";
        que += "WHERE userId in (" + user_in + ") ";
    
    var rows = await query(que);
    return rows;
};
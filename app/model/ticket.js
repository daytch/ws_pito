const { dbmysql } = require('../middlewares');
const util = require("util");

const TableName = "ticket";
const TableAttachment = "ticket_attachment";
const TableMessage = "ticket_message";
const query = util.promisify(dbmysql.query).bind(dbmysql);

exports.getAllRecord = function(callback){
    dbmysql.query("SELECT * FROM " + TableName + " WHERE 1=1", function(error, rows, fields){
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

exports.getRecord = async(param) => {
    var que = "SELECT * FROM " + TableName + " ";
        que += "WHERE 1=1 ";
        if(param.id !== undefined && param.id != ""){
            que += "AND id = '" + param.id + "' ";
        }
        if(param.userId !== undefined && param.userId != ""){
            que += "AND userId = '" + param.userId + "' ";
        }
        if(param.status !== undefined && param.status != ""){
            que += "AND status = '" + param.status + "' ";
        }

    var rows = await query(que);
    return rows;
};

exports.getRecordPaging = async(param, offset, limitpage) => {
    var que = "SELECT * FROM " + TableName + " ";
        que += "WHERE 1=1 ";
        if(param.id !== undefined && param.id != ""){
            que += "AND id = '" + param.id + "' ";
        }
        if(param.userId !== undefined && param.userId != ""){
            que += "AND userId = '" + param.userId + "' ";
        }
        if(param.status !== undefined && param.status != ""){
            que += "AND status = '" + param.status + "' ";
        }

        que += "ORDER BY createdAt desc ";
        que += "LIMIT " + offset + "," + limitpage;

    var rows = await query(que);
    return rows;
};

exports.getCountTicket = async() => {
    var que = "SELECT count(*) as cnt FROM " + TableName;
    var rows = await query(que);
    return rows;
}

exports.getCountRecordByYear = async(year) => {
    var que = "SELECT count(*) as cnt FROM " + TableName + " WHERE year(createdAt) = '" + year + "'";
    var rows = await query(que);
    return rows;
}

exports.insertRecord = async(param) => {
    var que = "INSERT INTO " + TableName + " (id,userId,subject,status,createdAt,closedAt) VALUES ";
        que += "('" + param.id + "','" + param.userId + "','"+param.subject+"','" + param.status + "',now(),'0000-00-00 00:00:00')";

    var rows = await query(que);
    return rows;
};

exports.updateStatus = async(id, status) => {
    var que = "UPDATE " + TableName + " SET status = '" + status + "', closedAt = now() WHERE id = '" + id + "'";
    var rows = await query(que);
    return rows;
};

exports.getRecordMessage = async(param) => {
    var que = "SELECT * FROM " + TableMessage + " ";
        que += "WHERE 1=1 ";
        if(param.id !== undefined && param.id != ""){
            que += "AND id = '" + param.id + "' ";
        }
        if(param.ticketId !== undefined && param.ticketId != ""){
            que += "AND ticketId = '" + param.ticketId + "' ";
        }
        if(param.userId !== undefined && param.userId != ""){
            que += "AND userId = '" + param.userId + "' ";
        }
        if(param.isDelete !== undefined && param.isDelete != ""){
            que += "AND isDelete = '" + param.isDelete + "' ";
        }
        else {
            que += "AND isDelete = 0 ";
        }

        que += "ORDER BY createdAt asc";

    var rows = await query(que);
    return rows;
};

exports.getMessageLast = async(param) => {
    var que = "SELECT * FROM " + TableMessage + " ";
        que += "WHERE 1=1 ";
        if(param.id !== undefined && param.id != ""){
            que += "AND id = '" + param.id + "' ";
        }
        if(param.ticketId !== undefined && param.ticketId != ""){
            que += "AND ticketId = '" + param.ticketId + "' ";
        }
        if(param.userId !== undefined && param.userId != ""){
            que += "AND userId = '" + param.userId + "' ";
        }
        if(param.isDelete !== undefined && param.isDelete != ""){
            que += "AND isDelete = '" + param.isDelete + "' ";
        }
        else {
            que += "AND isDelete = 0 ";
        }

        que += "ORDER BY createdAt desc ";
        que += "LIMIT 1";

    var rows = await query(que);
    return rows;
}

exports.insertMessage = async(param) => {
    var que = "INSERT INTO " + TableMessage + " (ticketId,userId,message,isDelete,createdAt) VALUES ";
        que += "('" + param.ticketId + "','" + param.userId + "','" + param.message + "','" + param.isDelete + "',now())";

    var rows = await query(que);
    return rows;
};

exports.getRecordAttachment = async(param) => {
    var que = "SELECT * FROM " + TableAttachment + " ";
        que += "WHERE 1=1 ";
        if(param.id !== undefined && param.id != ""){
            que += "AND id = '" + param.id + "' ";
        }
        if(param.messageId !== undefined && param.messageId != ""){
            que += "AND messageId = '" + param.messageId + "' ";
        }
        if(param.seq !== undefined && param.seq != ""){
            que += "AND seq = '" + param.seq + "' ";
        }
        if(param.attachment !== undefined && param.attachment != ""){
            que += "AND attachment = '" + param.attachment + "' ";
        }
        if(param.isDelete !== undefined && param.isDelete != ""){
            que += "AND isDelete = '" + param.isDelete + "' ";
        }
        else {
            que += "AND isDelete = 0 ";
        }
        
        que += "ORDER BY seq asc";

    var rows = await query(que);
    return rows;
};

exports.insertAttachment = async(param) => {
    var que = "INSERT INTO " + TableAttachment + " (messageId,seq,attachment,isDelete,createdAt) VALUES ";
        que += "('" + param.messageId + "','" + param.seq + "','" + param.attachment + "','" + param.isDelete + "',now())";

    var rows = await query(que);
    return rows;
};

exports.getCountMessage = async(param) => {
    var que = "SELECT count(*) as cnt FROM " + TableMessage + " ";
        que += "WHERE 1=1 ";
        if(param.id !== undefined && param.id != ""){
            que += "AND id = '" + param.id + "' ";
        }
        if(param.ticketId !== undefined && param.ticketId != ""){
            que += "AND ticketId = '" + param.ticketId + "' ";
        }
        if(param.userId !== undefined && param.userId != ""){
            que += "AND userId = '" + param.userId + "' ";
        }
        if(param.isDelete !== undefined && param.isDelete != ""){
            que += "AND isDelete = '" + param.isDelete + "' ";
        }
        else {
            que += "AND isDelete = 0 ";
        }

    var rows = await query(que);
    return rows;
}

exports.getMessagePaging = async(ticket_id, offset, limitpage) => {
    var que = "SELECT * FROM " + TableMessage + " ";
        que += "WHERE 1=1 ";
        if(ticket_id !== undefined && ticket_id != ""){
            que += "AND ticketId = '" + ticket_id + "' ";
        }
        que += "AND isDelete = 0 ";
        que += "ORDER BY createdAt desc ";
        que += "LIMIT " + offset + "," + limitpage;

    var rows = await query(que);
    return rows;
}

exports.updateCloseTicket = async(ticket_id, close_by) => {
    var que = "UPDATE " + TableName + " SET status = 1, closedAt = now(), close_by = '"+close_by+"' WHERE id = '" + ticket_id + "'";
    var rows = await query(que);
    return rows;
}
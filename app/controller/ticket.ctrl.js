const ticket = require("../model/ticket");
const conf_paging = require("../config/paging.config");
const users = require("../model/users");
const moment = require("moment");
const up_seq = 10000;
const formidable = require("formidable");
const { uploadfile } = require("../middlewares");
const config_upload = require("../config/upload.config");

exports.createTicket = async(param, res) => {
    var userId = param.userId;

    var form = new formidable.IncomingForm();
    form.parse(param, async(err, fields, files) => {
        if (err) {
            console.error('Error', err)
            return res.status(500).json({
                isSuccess : false,
                message : "Failed Submit Ticket"
            });
        }

        var id = await createTicketId();
        var prm = {
            id : id,
            userId : userId,
            subject : fields.subject,
            status : 0
        }
        var ins = await ticket.insertRecord(prm);
        if(ins.affectedRows > 0){
            var prmMsg = {
                ticketId : id,
                userId : userId,
                message : fields.message,
                isDelete : 0
            }

            var insMsg = await ticket.insertMessage(prmMsg);
            if(insMsg.affectedRows > 0){
                var dt = await ticket.getMessageLast(prmMsg);
                var messageId = 0;
                for(let d of dt){
                    messageId = d.id;
                }

                var msgErr = "(";
                if(files.attachment1 !== undefined && files.attachment1.name != ""){
                    var check = await uploadfile.processUpload(files.attachment1, userId);
                    if(!check.error){
                        var prmAttach = {
                            messageId : messageId,
                            seq : 1,
                            attachment : config_upload.base_url + "/" + config_upload.folder + "/" + check.filename,
                            isDelete : 0
                        }

                        var insAttach = await ticket.insertAttachment(prmAttach);
                        if(insAttach.affectedRows < 1){
                            msgErr += "#Failed to insert attachment1";
                        }
                    }
                    else {
                        msgErr += "#Attachment1 failed update " + check.message;
                    }
                }

                if(files.attachment2 !== undefined && files.attachment2.name != ""){
                    var check = await uploadfile.processUpload(files.attachment2, userId);
                    if(!check.error){
                        var prmAttach = {
                            messageId : messageId,
                            seq : 2,
                            attachment : config_upload.base_url + "/" + config_upload.folder + "/" + check.filename,
                            isDelete : 0
                        }

                        var insAttach = await ticket.insertAttachment(prmAttach);
                        if(insAttach.affectedRows < 1){
                            msgErr += "#Failed to insert attachment2";
                        }
                    }
                    else {
                        msgErr += "#Attachment2 failed update " + check.message;
                    }
                }

                if(files.attachment3 !== undefined && files.attachment3.name != ""){
                    var check = await uploadfile.processUpload(files.attachment3, userId);
                    if(!check.error){
                        var prmAttach = {
                            messageId : messageId,
                            seq : 3,
                            attachment : config_upload.base_url + "/" + config_upload.folder + "/" + check.filename,
                            isDelete : 0
                        }

                        var insAttach = await ticket.insertAttachment(prmAttach);
                        if(insAttach.affectedRows < 1){
                            msgErr += "#Failed to insert attachment3";
                        }
                    }
                    else {
                        msgErr += "#Attachment3 failed update " + check.message;
                    }
                }

                if(msgErr != "("){
                    console.error("messageId : " + messageId);
                    console.error(msgErr);                    
                    msgErr += ")";
                }
                else {
                    msgErr = "";
                }

                return res.status(200).json({
                    isSuccess : true,
                    message : "Success create ticket " + msgErr,
                    ticketId : id
                });
            }
            else {
                console.error(prmMsg);
                console.error("Failed to insert message");
                return res.status(200).json({
                    isSuccess : true,
                    message : "Success create ticket, but failed to send message",
                    ticketId : id
                });
            }
        }
        else {
            console.error(prm);
            console.error("Failed to insert ticket");
            return res.status(500).json({
                isSuccess : false,
                message : "Failed create ticket"
            });
        }
    });
}

async function createTicketId(){
    var year = moment().format("YYYY");
    var month = moment().format("MM");
    var day = moment().format("DD");
    var cnt = 0;
    var dt = await ticket.getCountRecordByYear(year);
    for(let d of dt){
        cnt = d.cnt;
    }
    var seq_a = up_seq + (cnt + 1);
    var seq_b = seq_a.toString();
    var seqFinal = seq_b.substr(1, seq_b.length);

    var id = year + month + day + seqFinal;
    return id;
}

exports.insertMessage = async(param, res) => {
    var userId = param.userId;

    var form = new formidable.IncomingForm();
    form.parse(param, async(err, fields, files) => {
        if (err) {
            console.error('Error', err)
            return res.status(500).json({
                isSuccess : false,
                message : "Failed Submit Message"
            });
        }

        if(fields.ticket_id === undefined || fields.ticket_id == ""){
            return res.status(500).json({
                isSuccess : false,
                message : "Failed Submit Message, ticket id null"
            });
        }

        var prmMsg = {
            ticketId : fields.ticket_id,
            userId : userId,
            message : fields.message,
            isDelete : 0
        }

        var insMsg = await ticket.insertMessage(prmMsg);
        if(insMsg.affectedRows > 0){
            var dt = await ticket.getMessageLast(prmMsg);
            var messageId = 0;
            for(let d of dt){
                messageId = d.id;
            }

            var msgErr = "(";
            if(files.attachment1 !== undefined && files.attachment1.name != ""){
                var check = await uploadfile.processUpload(files.attachment1, userId);
                if(!check.error){
                    var prmAttach = {
                        messageId : messageId,
                        seq : 1,
                        attachment : config_upload.base_url + "/" + config_upload.folder + "/" + check.filename,
                        isDelete : 0
                    }

                    var insAttach = await ticket.insertAttachment(prmAttach);
                    if(insAttach.affectedRows < 1){
                        msgErr += "#Failed to insert attachment1";
                    }
                }
                else {
                    msgErr += "#Attachment1 failed update " + check.message;
                }
            }

            if(files.attachment2 !== undefined && files.attachment2.name != ""){
                var check = await uploadfile.processUpload(files.attachment2, userId);
                if(!check.error){
                    var prmAttach = {
                        messageId : messageId,
                        seq : 2,
                        attachment : config_upload.base_url + "/" + config_upload.folder + "/" + check.filename,
                        isDelete : 0
                    }

                    var insAttach = await ticket.insertAttachment(prmAttach);
                    if(insAttach.affectedRows < 1){
                        msgErr += "#Failed to insert attachment2";
                    }
                }
                else {
                    msgErr += "#Attachment2 failed update " + check.message;
                }
            }

            if(files.attachment3 !== undefined && files.attachment3.name != ""){
                var check = await uploadfile.processUpload(files.attachment3, userId);
                if(!check.error){
                    var prmAttach = {
                        messageId : messageId,
                        seq : 3,
                        attachment : config_upload.base_url + "/" + config_upload.folder + "/" + check.filename,
                        isDelete : 0
                    }

                    var insAttach = await ticket.insertAttachment(prmAttach);
                    if(insAttach.affectedRows < 1){
                        msgErr += "#Failed to insert attachment3";
                    }
                }
                else {
                    msgErr += "#Attachment3 failed update " + check.message;
                }
            }

            if(msgErr != "("){
                console.error("messageId : " + messageId);
                console.error(msgErr);                    
                msgErr += ")";
            }
            else {
                msgErr = "";
            }

            return res.status(200).json({
                isSuccess : true,
                message : "Success insert message " + msgErr
            });
        }
        else {
            console.error(prmMsg);
            console.error("Failed to insert message");
            return res.status(500).json({
                isSuccess : false,
                message : "Failed to send message"
            });
        }
    });
}

exports.listTicketMerchant = async(param, res) => {
    var dt = await ticket.getRecord(param);
    var rtn = [];
    var obj = {};
    var objLastMsg = [];
    var last_message = "";
    var prm = {};
    for(var d of dt){
        last_message = "";
        prm = {
            ticketId : d.id
        }
        objLastMsg = await ticket.getMessageLast(prm);
        for(var o of objLastMsg){
            last_message = o.createdAt;
        }

        obj = {
            id : d.id,
            title : d.subject,
            status : d.status,
            last_session : last_message
        };

        rtn.push(obj);
    }

    return res.status(200).json({
        isSuccess : true,
        data : rtn
    });
}

exports.listMessageByTicket = async(param, res) => {
    var user_id = param.userId;
    var req = param.query;
    var ticket_id = req.ticket_id;
    var page = req.page;

    if(ticket_id === undefined || ticket_id == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "Failed Get Message, ticket id null"
        });
    }

    var item_per_page = 50;
    var cnt = 0;
    var prm = {
        ticketId : ticket_id
    }
    var dt = await ticket.getCountMessage(prm);
    for(var d of dt){
        cnt = d.cnt;
    }

    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }
    var offset = (page - 1) * item_per_page;
    var data = await ticket.getMessagePaging(ticket_id,offset,item_per_page);
    var obj = {};
    var rtn = [];
    for(var m of data){
        var name = "";
        var usr = await users.getAllRecord({id : m.userId});
        for(var u of usr){
            name = u.name;
        }
        var prmMsg = {
            messageId : m.id
        }
        var atch = await ticket.getRecordAttachment(prmMsg);
        obj = {
            id : m.id,
            text : m.message,
            userId : m.userId,
            name : name,
            createdAt : m.createdAt,
            attachment : atch
        };
        rtn.push(obj);
    }

    return res.status(200).json({
        isSuccess : true,
        count : cnt,
        data : rtn
    });
}

exports.listTicketAdmin = async(param, res) => {
    var req = param.query;
    var page = req.page;
    var item_per_page = 50;
    var offset = (page - 1) * item_per_page;
    var cnt = 0;
    var dt = await ticket.getCountTicket();
    for(var d of dt){
        cnt = d.cnt;
    }

    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }

    var dt = await ticket.getRecordPaging({status : 0}, offset, item_per_page);
    var rtn = [];
    var obj = {};
    var objLastMsg = [];
    var last_message = "";
    var prm = {};
    for(var d of dt){
        last_message = "";
        prm = {
            ticketId : d.id
        }
        objLastMsg = await ticket.getMessageLast(prm);
        for(var o of objLastMsg){
            last_message = o.createdAt;
        }

        obj = {
            id : d.id,
            title : d.subject,
            status : d.status,
            last_session : last_message
        };

        rtn.push(obj);
    }

    return res.status(200).json({
        isSuccess : true,
        count : cnt,
        data : rtn
    });
}
const notif = require("../model/notification");
const conf_paging = require("../config/paging.config");
const users = require("../model/users");
const videos = require("../model/videos");

exports.getNotification = async(param, res) => {
    var req = param.query;
    var user_id = param.userId;
    var page = req.page;
    
    var item_per_page = conf_paging.item_per_page;
    var data = [];
    var offset = (page - 1) * item_per_page;
    var cntNotif = await notif.getCountRecord("", user_id, "", "");
    var cnt = 0;
    for(var c of cntNotif){
        cnt = c.cnt;
    }
    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }

    var obj = await notif.getListPaging("",user_id,"","",offset,item_per_page);
    for(let o of obj){
        var merch_id = "";
        var img_ava = "";
        var prm = {
            userId : "",
            id : o.videoId
        }
        var vids = await videos.getRecord(prm);
        for(let v of vids){
            merch_id = v.userId;
            var usr = await users.getUserDetails(v.userId);
            for(let u of usr){
                img_ava = u.img_avatar;
            }
        }
        var isRead = false;
        if(o.isRead == 1){
            isRead = true;
        }
        var dt = {
            id : o.id,
            userId : o.userId,
            videoId : o.videoId,
            title : o.title,
            description : o.description,
            isRead : isRead,
            createdAt : o.createdAt,
            merchantId : merch_id,
            img_thumbnail : img_ava
        }
        data.push(dt);
    }

    return res.status(200).json({
        isSuccess : true,
        isNext : isNext,
        total_notif : cnt,
        message : "Success get notification page " + page,
        data : data
    });
}

exports.notifReadAll = async(param, res) => {
    var req = param.body;
    var user_id = param.userId;
    var last_id = req.last_id;

    var upd = await notif.updateReadLastId(last_id, user_id, 1);
    if(upd.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Success Read all with last id " + last_id
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed Read all with last id " + last_id
        });
    }
}
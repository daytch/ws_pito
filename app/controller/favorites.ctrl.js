const favorites = require("../model/favorites");
const videos = require("../model/videos");
const videos_ctrl = require("../controller/videos.ctrl");
const conf_paging = require("../config/paging.config");

exports.actionFav = async(param, res) => {
    var req = param.body;
    var user_id = param.userId;
    var type = req.type;
    var pkey = req.pkey;
    var ins = {
        affectedRows : 0
    };

    if(user_id === undefined || type === undefined || pkey === undefined){
        return res.status(500).json({
            isSuccess : false,
            message : "Submit favourites failed, parameter undefined"
        });
    }

    var new_status = 1;
    var check = await favorites.getRecord(user_id, type, "", pkey);
    if(check.length > 0){
        var status = check[check.length - 1].status;
        if(status == 1){
            new_status = 0;
        }

        ins = await favorites.submitRecord(user_id, type, new_status, pkey, false);
    }
    else {
        ins = await favorites.submitRecord(user_id, type, new_status, pkey, true);
    }

    if(ins.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Submit favourites success"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Submit favourites failed"
        });
    }
}

exports.getFav = async(param, res) => {
    var req = param.query;
    var user_id = param.userId;
    var type = req.type;
    var sort_by = req.sort_by;
    var page = req.page;

    var item_per_page = conf_paging.item_per_page;
    var data = [];
    var offset = (page - 1) * item_per_page;
    var cntVid = await favorites.getCountRecord(user_id, type, 1, "");
    var cnt = 0;
    for(var c of cntVid){
        cnt = c.cnt;
    }

    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }
    if(type == "Livestream"){
        var vids = await favorites.getRecordLivestream(user_id, 1, offset, item_per_page);
        data = await videos_ctrl.createObjVideos(vids, user_id);
    }

    return res.status(200).json({
        isSuccess : true,
        message : "Success get "+type+" page " + page,
        isNext : isNext,
        total : cnt,
        data : data
    });
}
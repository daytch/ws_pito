const favorites = require("../model/favorites");
const videos = require("../model/videos");
const videos_ctrl = require("../controller/videos.ctrl");
const conf_paging = require("../config/paging.config");
const merchant = require("../model/merchant");
const users = require("../model/users");

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

    var check = false;
    if(type == "Livestream"){
        var prm = {
            userId : "",
            id : pkey
        }
        var data = await videos.getRecord(prm);
        if(data.length > 0){
            check = true;
        }
    }
    else if(type == "Merchant"){
        var prm = {
            userId : pkey
        }
        var data = await merchant.getRecord(prm);
        if(data.length > 0){
            check = true;
        }
    }

    if(!check){
        return res.status(500).json({
            isSuccess : false,
            message : "Submit favourites failed, No data found"
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
        var vids = await favorites.getRecordLivestream(user_id, 1, offset, item_per_page, sort_by);
        data = await videos_ctrl.createObjVideos(vids, user_id);
    }
    else if(type == "Merchant"){
        var id_role = 0;
        var role = await users.getRolesByName("Merchant");
        for(var r of role){
            id_role = r.id;
        }
        var list = await favorites.getRecordMerchant(user_id, 1, offset, item_per_page, sort_by, id_role);
        for(var m of list){
            var merchant_id = m.id;
            var subs = 0;
            var count_subs = await merchant.getCountSubs(merchant_id);
            for(var c of count_subs){
                subs = c.cnt;
            }

            var isSubs = false;
            var checksubs = await merchant.getCountSubsById(merchant_id, user_id);
            if(checksubs.length > 0){
                isSubs = true;
            }

            var cnt_live = 0;
            var countlive = await videos.getCountVideosByUserId(merchant_id);
            for(var l of countlive){
                cnt_live = l.cnt;
            }

            var cat = [];
            var merch_cat = await merchant.getCategoryByUserId(merchant_id);
            for(var mc of merch_cat){
                cat.push(mc.name);
            }

            rtn = {
                id : m.id,
                name : m.name,
                profile_image_url : m.img_avatar,
                totalSubscriber : subs,
                total_livestream : cnt_live,
                description : m.about,
                join_date : m.createdAt,
                categories : cat,
                isSubscriber : isSubs,
                facebook_url : m.fb_url,
                instagram_url : m.ig_url,
                tiktok_url : m.tiktok_url,
                share_url : ''
            };
            data.push(rtn);
        }
    }

    return res.status(200).json({
        isSuccess : true,
        message : "Success get "+type+" page " + page,
        isNext : isNext,
        total : cnt,
        data : data
    });
}
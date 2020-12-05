const videos = require("../model/videos");
const videos_category = require("../model/videos_category");
const merchant = require("../model/merchant");
const users = require("../model/users");
const fav = require("../model/favorites");
// const { authJwt } = require("../middlewares");
// const moment = require("moment");
const users_ctrl = require("../controller/user.ctrl");
const conf_paging = require("../config/paging.config");
const config_upload = require("../config/upload.config");
const formidable = require("formidable");
const {uploadfile} = require("../middlewares");

exports.getVideos = async(param, res) => {
    // Limit 10 data, tambah list merchant
    // var user_id = await authJwt.getUserId(param, res);
    var user_id = param.userId;
    var vids = await videos.getVideosByType("popular");
    var popular = await this.createObjVideos(vids, user_id);
    vids = await videos.getVideosByType("recom");
    var recommend = await this.createObjVideos(vids, user_id);

    merch_pop = await users_ctrl.listMerchant(user_id, "popular", 0, 10);
    merch_rec = await users_ctrl.listMerchant(user_id, "recom", 0, 10);
    merch_new = await users_ctrl.listMerchant(user_id, "new_comer", 0, 10);

    status = 200;
    var hsl = {
        popular : popular,
        recommended : recommend,
        upcoming_videos : await this.videosMerchantByMoment("", "upcoming_videos", user_id),
        previous_videos : await this.videosMerchantByMoment("", "previous_videos",user_id),
        merchant_popular : merch_pop,
        merchant_recommended : merch_rec,
        merchant_new : merch_new
    }; 

    return res.status(status).json(hsl);
};

exports.videosPage = async(param, res) => {
    var req = param.body;
    var id = req.videoId;
    var user_id = param.userId;

    if(id == undefined || id == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to get videos"
        });
    }

    var vids = await videos.getVideosById(id);
    var rtn = await this.createObjVideos(vids, user_id);
    return res.status(200).json({
        isSuccess : true,
        data : {
            live_now : rtn,
            next_livestream : await this.videosMerchantByMoment("", "live_videos", user_id)
        }
    });
};

exports.actionVidComments = async(param, res) => {
    var req = param.body;

    if(req.videoId == "" && req.userId == ""){
        // Gagal
        return res.status(500).json({
            isSuccess : false,
            message : "Insert comment failed"
        });
    }

    var ins = await videos.insertComments(req.videoId, req.userId, req.text);
    if(ins != null){
        if(ins.affectedRows > 0){
            return res.status(200).json({
                isSuccess : true,
                message : "Insert Comment Success"
            });
        }
    }

    return res.status(500).json({
        isSuccess : false,
        message : "Insert comment failed"
    });
};

exports.videosMerchantByMoment = async(merchant_id, mmt, user_id) => {
    var vids = await videos.getVideosMerchantByMoment(merchant_id, mmt);
    var rtn = await this.createObjVideos(vids, user_id);
    return rtn;
};

exports.listVideos = async(param, res) => {
    var req = param.body;
    var user_id = param.userId;
    var type = req.type;
    var page = req.page;
    var item_per_page = conf_paging.item_per_page;
    var offset = (page - 1) * item_per_page;

    var cntVid = await videos.getCountVideosByType("", type);
    var cnt = 0;
    for(var c of cntVid){
        cnt = c.cnt;
    }
    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }
    var vids = await videos.getListVideosPaging("", type, offset, item_per_page);
    var data = await this.createObjVideos(vids, user_id);
    
    return res.status(200).json({
        isSuccess : true,
        message : "Success get videos page " + page,
        isNext : isNext,
        total_video : cnt,
        data : data
    });
}

exports.listVideosByCategory = async(param, res) => {
    var req = param.query;
    var id_cat = req.id_cat;
    var user_id = param.userId;
    var page = req.page;
    var type = req.type;
    var item_per_page = conf_paging.item_per_page;
    var offset = (page - 1) * item_per_page;

    var cntVid = await videos.getCountVideosByCat("", id_cat, type);
    var cnt = 0;
    for(var c of cntVid){
        cnt = c.cnt;
    }
    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }
    var vids = await videos.getListVideosPagingCat("", id_cat, type, offset, item_per_page);
    var data = await this.createObjVideos(vids, user_id);
    
    return res.status(200).json({
        isSuccess : true,
        message : "Success get videos category page " + page,
        isNext : isNext,
        total_video : cnt,
        data : data
    });
};

exports.listVideosByMerchant = async(param, res) => {
    var req = param.query;
    var id_merchant = req.id_merchant;
    var user_id = param.userId;
    var page = req.page;
    var type = req.type;
    var item_per_page = conf_paging.item_per_page;
    var offset = (page - 1) * item_per_page;

    var cntVid = await videos.getCountVideosByUserIdType(id_merchant, type);
    var cnt = 0;
    for(var c of cntVid){
        cnt = c.cnt;
    }
    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }
    var vids = await videos.getListVideosPaging(id_merchant, type, offset, item_per_page);
    var data = await this.createObjVideos(vids, user_id);
    
    return res.status(200).json({
        isSuccess : true,
        message : "Success get videos category page " + page,
        isNext : isNext,
        total_video : cnt,
        data : data
    });
};

exports.submitLivestream = async(param, res) => {
    var user_id = param.userId;
    var form = new formidable.IncomingForm();
    form.parse(param, async(err, fields, files) => {
        if (err) {
            console.error('Error', err)
            return res.status(500).json({
                isSuccess : false,
                message : "Failed Submit Livestream"
            });
        }
        if(files.mypic !== undefined){
            var check = await uploadfile.processUpload(files, user_id);
            if(!check.error){
                var img_name = config_upload.base_url + "/" + config_upload.folder + "/" + check.filename;
                var tmp = "user" + user_id + "_" + Math.floor(Math.random() * 10000) + 1;
                var prm = {
                    userId : user_id,
                    startDate : fields.startDate,
                    endDate : fields.endDate,
                    title : fields.title,
                    desc : fields.desc,
                    fb_url : fields.fb_url,
                    tiktok_url : fields.tiktok_url,
                    ig_url : fields.ig_url,
                    img_thumbnail : img_name,
                    isActive : 1,
                    ispopular : 1,  // Default
                    isrecom : 0,
                    tmp : tmp
                };
                var ins = await videos.insertVideos(prm);
                if(ins.affectedRows > 0){
                    var dt = await videos.getVideosbyTmp(tmp, user_id);
                    var videoId = 0;
                    for(var d of dt){
                        videoId = d.id;
                    }

                    var cat = [];
                    if(fields.category !== undefined && fields.category != ""){
                        cat = fields.category.split(",");
                    }
                    
                    var insCat = {};
                    for(var c of cat){
                        insCat = await videos_category.insertCategory(videoId, c);
                    }
                    if(insCat.affectedRows > 0){
                        return res.status(200).json({
                            isSuccess : true,
                            message : "Success to submit livestream"
                        });
                    }
                }
            }
            else {
                return res.status(500).json({
                    isSuccess : false,
                    message : check.message
                });
            }
        }

        return res.status(500).json({
            isSuccess : false,
            message : "Failed to submit livestream"
        });
    });
}

// async function createObjVideos(vids, user_id){
exports.createObjVideos = async(vids, user_id) => {
    var rtn = [];
    for(var v of vids){
        var obj = {};
        var cat = await videos_category.getCategoryByVideos(v.id);
        var ct = [];
        for(var c of cat){
            ct.push(c.name);
        }

        var merch_object = {};
        var merch = await users.getUserDetailsWithName(v.userId);
        for(var m of merch){
            var subs = 0;
            var countsubs = await fav.getCountRecord("", "Merchant", 1, m.userId);
            for(var c of countsubs){
                subs = c.cnt;
            }

            var cnt_is_subs = 0;
            var checksubs = await fav.getCountRecord(user_id, "Merchant", 1, m.userId);
            for(var c of checksubs){
                cnt_is_subs = c.cnt;
            }
            var isSubs = false;
            if(cnt_is_subs > 0){
                isSubs = true;
            }

            merch_object = {
                id : v.userId,
                name : m.name,
                profile_image_url : m.img_avatar,
                totalSubscriber : subs,
                isSubscriber : isSubs,
            };
        }

        var isFav = false;
        var fav_obj = await fav.getRecord(user_id, "Livestream", 1, v.id);
        if(fav_obj.length > 0){
            isFav = true;
        }

        var iframe = "";
        if(v.fb_url != "" && v.fb_url !== null){
            iframe = v.fb_url;
        }
        else if(v.ig_url != "" && v.ig_url !== null){
            iframe = v.ig_url;
        }
        else if(v.tiktok_url != "" && v.tiktok_url !== null){
            iframe = v.tiktok_url;
        }

        obj = {
            id : v.id,
            iframe : iframe,
            title : v.title,
            description : v.desc,
            categories : ct,
            start_time : v.startDate,
            facebook_url : v.fb_url,
            instagram_url : v.ig_url,
            tiktok_url : v.tiktok_url,
            is_favourite : isFav,
            share_url : "",
            img_thumbnail : v.img_thumbnail,
            merchant : merch_object
        };

        rtn.push(obj);
    }

    return rtn;
}

exports.getDashboard = async(param, res) => {
    var user_id = param.userId;
    status = 200;
    var hsl = {
        live_videos : await this.videosMerchantByMoment("", "live_videos", user_id),
        upcoming_videos : await this.videosMerchantByMoment("", "upcoming_videos", user_id),
        previous_videos : await this.videosMerchantByMoment("", "previous_videos",user_id)
    }; 

    return res.status(status).json(hsl);
}
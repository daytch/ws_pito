const videos = require("../model/videos");
const videos_category = require("../model/videos_category");
const merchant = require("../model/merchant");
const users = require("../model/users");
const fav = require("../model/favorites");
const category = require("../model/category");
const search = require("../model/search");
const urlshare = require("../model/urlshare");
const notification = require("../model/notification");
const { dynamiclink } = require("../middlewares");
// const moment = require("moment");
const users_ctrl = require("../controller/user.ctrl");
const notif_ctrl = require("../controller/notification.ctrl");
const conf_paging = require("../config/paging.config");
const config_upload = require("../config/upload.config");
const formidable = require("formidable");
const {uploadfile} = require("../middlewares");
const moment = require("moment");

exports.getVideos = async(param, res) => {
    try{
        // Limit 10 data, tambah list merchant
        // var user_id = await authJwt.getUserId(param, res);
        var user_id = param.userId;
        var vids = await videos.getVideosByType("popular");
        var popular = await this.createObjVideos(vids, user_id);
        
        var hist = await fav.getRecord(user_id,"Livestream",1,"");
        var hist_vid = "";
        for(var h of hist){
            if(hist_vid != ""){
                hist_vid += ",";
            }
            hist_vid += h.pkey;
        }
        var recommend = [];
        if(hist_vid != ""){
            var cat = await videos_category.getDistinctCategoryByVideosIn(hist_vid);
            var hist_cat = "";
            for(var c of cat){
                if(hist_cat != ""){
                    hist_cat += ",";
                }
                hist_cat += c.categoryId;
            }
            if(hist_cat != ""){
                vids = await videos.getVideosByCatIn(hist_cat, 0, 10);
                recommend = await this.createObjVideos(vids, user_id);
            }
        }

        merch_pop = await users_ctrl.listMerchant(user_id, "popular", 0, 10);
        merch_rec = await users_ctrl.listMerchant(user_id, "recom", 0, 10);
        merch_new = await users_ctrl.listMerchant(user_id, "new_comer", 0, 10);

        var prev = await videos.getHistoryView(user_id, 0, 10);
        var prev_vid = [];
        for(var u of prev){
            var vids = await videos.getRecord({id : u.videoId});
            if(vids.length > 0){
                prev_vid.push(vids[0]);
            }
        }
        var obj_prev = [];
        if(prev_vid.length > 0){
            obj_prev = await this.createObjVideos(prev_vid,user_id);
        }

        status = 200;
        var hsl = {
            popular : popular,
            recommended : recommend,
            upcoming_videos : await this.videosMerchantByMoment("", "upcoming_videos", user_id),
            previous_videos : obj_prev,
            merchant_popular : merch_pop,
            merchant_recommended : merch_rec,
            merchant_new : merch_new
        }; 

        return res.status(status).json(hsl);
    }
    catch(e){
        console.log("home");
        console.log(e);
    }
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

    var ins = await videos.insertView(user_id, id);
    if(ins.affectedRows < 1){
        console.error("Failed to insert log view");
    }

    return res.status(200).json({
        isSuccess : true,
        data : {
            live_now : rtn,
            next_livestream : await this.videosMerchantByMoment("", "upcoming_videos", user_id)
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

    var vids = [];
    var cntVid = [];
    if(type == "recom"){
        var hist = await fav.getRecord(user_id,"Livestream",1,"");
        var hist_vid = "";
        for(var h of hist){
            if(hist_vid != ""){
                hist_vid += ",";
            }
            hist_vid += h.pkey;
        }
        if(hist_vid != ""){
            var cat = await videos_category.getDistinctCategoryByVideosIn(hist_vid);
            var hist_cat = "";
            for(var c of cat){
                if(hist_cat != ""){
                    hist_cat += ",";
                }
                hist_cat += c.categoryId;
            }
            if(hist_cat != ""){
                vids = await videos.getVideosByCatIn(hist_cat, offset, item_per_page);
                cntVid = await videos.getCountVideosByCatIn(hist_cat);
            }
        }
    }
    else if(type == "previous_videos"){
        var prev = await videos.getHistoryView(user_id, offset, item_per_page);
        for(var u of prev){
            var prev_vid = await videos.getRecord({id : u.videoId});
            if(prev_vid.length > 0){
                vids.push(prev_vid[0]);
            }
        }
        cntVid = await videos.getCountHistoryView(user_id);
    }
    else {
        vids = await videos.getListVideosPaging("", type, offset, item_per_page);
        cntVid = await videos.getCountVideosByType("", type);
    }

    var data = await this.createObjVideos(vids, user_id);

    var cnt = 0;
    for(var c of cntVid){
        cnt = c.cnt;
    }
    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }

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
    
    var ins = await category.insertLog(user_id, id_cat);
    if(ins.affectedRows < 1){
        console.error("Failed to insert Search Category");
    }
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


exports.listVideosHistoryMerchant = async(param, res) => {
    var req = param.query;
    var id_merchant = param.userId;
    var user_id = param.userId;
    var page = req.page;
    var item_per_page = conf_paging.item_per_page;
    var offset = (page - 1) * item_per_page;

    var cntVid = await videos.getCountVideosByUserIdType(id_merchant, "");
    var cnt = 0;
    for(var c of cntVid){
        cnt = c.cnt;
    }
    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }
    var vids = await videos.getListVideosPaging(id_merchant, "", offset, item_per_page);
    var data = await this.createObjVideos(vids, user_id);
    
    return res.status(200).json({
        isSuccess : true,
        message : "Success get videos merchant page " + page,
        isNext : isNext,
        total_video : cnt,
        data : data
    });
};

exports.submitLivestream = async(param, res) => {
    var user_id = param.userId;
    var form = new formidable.IncomingForm();
    
    form.parse(param, async(err, fields, files) => {
        if(err) {
            console.error('Error', err)
            return res.status(500).json({
                isSuccess : false,
                message : "Failed Submit Livestream"
            });
        }

        var check = {
            filename : ""
        }
        
        if(files.mypic !== undefined){
            check = await uploadfile.processUpload(files.mypic, user_id);
            if(check.error){
                return res.status(500).json({
                    isSuccess : false,
                    message : check.message
                });
            }
        }

        var msg = "";
        var img_name = "";
        if(check.filename != ""){
            img_name = config_upload.base_url + "/" + config_upload.folder + "/" + check.filename;
        }
        if(fields.videoId == undefined || fields.videoId == ""){
            var tmp = "user" + user_id + "_" + Math.floor(Math.random() * 10000) + 1;
            var prm = {
                videoId : "",
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
                
                var insCat = {
                    affectedRows : 0
                };
                for(var c of cat){
                    insCat = await videos_category.insertCategory(videoId, c);
                }
                if(insCat.affectedRows > 0){
                    var prmUsr = {
                        id : param.userId
                    }
                    var usr = await users.getAllRecord(prmUsr);
                    var usr_name = "";
                    for(var u of usr){
                        usr_name = u.name;
                    }

                    var prm = {
                        userId : user_id,
                        videoId : videoId,
                        title : "A new Livestream",
                        desc : usr_name + " has added a new livestream"
                    }
                    var insNotif = await notif_ctrl.insertNotificationLivestream(prm);
                    if(insNotif == 0){
                        console.error("Error submit notification livestream on videoId " + videoId);
                    }
                    return res.status(200).json({
                        isSuccess : true,
                        message : "Success to submit livestream"
                    });
                }
                else {
                    msg = "Failed insert videos category";
                }
            }
            else {
                msg = "Failed insert videos";
            }
        }
        else {  // Update Livestream
            var check = this.verifyModifyLivestream(user_id, fields.videoId);
            if(!check){
                return res.status(500).json({
                    isSuccess : false,
                    message : "You not authorize to edit this videos"
                });
            }
            var createdAt = "0000-00-00 00:00:00";
            var tmp = "";
            var img_thumbnail = "";
            var prm = {
                id : fields.videoId
            }
            var vids = await videos.getRecord(prm);
            for(var v of vids){
                createdAt = v.createdAt;
                tmp = v.tmp;
                img_thumbnail = v.img_thumbnail;
            }
            if(img_name == ""){
                img_name = img_thumbnail;
            }
            var prm = {
                videoId : fields.videoId,
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
                tmp : tmp,
                createdAt : moment(createdAt).format("YYYY-MM-DD HH:mm:ss")
            };
            var upd = await videos.replaceVideos(prm);
            if(upd.affectedRows > 0){
                var cat = [];
                if(fields.category !== undefined && fields.category != ""){
                    cat = fields.category.split(",");
                }

                var delCat = await videos_category.deleteCategory(fields.videoId);
                // if(delCat.affectedRows > 0){
                    var insCat = {
                        affectedRows : 0
                    };
                    for(var c of cat){
                        insCat = await videos_category.insertCategory(fields.videoId, c);
                    }

                    var prm = {
                        userId : user_id,
                        videoId : fields.videoId,
                        title : "Livestream has change",
                        desc : fields.title + " has change to a new schedule"
                    }
                    var insNotif = await notif_ctrl.insertNotificationLivestream(prm);
                    if(insNotif == 0){
                        console.error("Error submit notification livestream on videoId " + videoId);
                    }
                    if(insCat.affectedRows > 0){
                        return res.status(200).json({
                            isSuccess : true,
                            message : "Success to submit livestream"
                        });
                    }
                    else {
                        msg = "Failed insert videos category";
                    }
                // }
                // else {
                //     msg = "Failed delete-insert videos category";
                // }
            }
            else {
                msg = "Failed update videos";
            }
        }

        return res.status(500).json({
            isSuccess : false,
            message : msg
        });
    });
}

exports.deleteLivestream = async(param, res) => {
    var user_id = param.userId;
    var req = param.body;
    var id = req.id;
    if(id === undefined || id == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "You not authorize to delete this videos, id null"
        });
    }

    var verif = await this.verifyModifyLivestream(user_id, id);
    if(!verif){
        return res.status(500).json({
            isSuccess : false,
            message : "You not authorize to delete this videos"
        });
    }

    var del = await videos.deleteVideos(id);
    if(del.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Success to delete this videos"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to delete this videos"
        });
    }
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

        var fav_obj = await fav.getRecord("", "Livestream", 1, v.id);
        var likes = fav_obj.length;

        var views = 0;
        var dtv = await videos.getCountView(v.id);
        for(var tv of dtv){
            views = tv.cnt;
        }

        var share = 0;
        var shr = await videos.getCountShareByVideoId(v.id);
        for(var s of shr){
            share = s.cnt;
        }

        var iframe = "";
        var height = 0;
        var width = 0;
        var toiframe = {};
        if(v.fb_url != "" && v.fb_url !== null){
            toiframe = await videos.getVideosIframe(v.id);
            if(toiframe.length > 0){
                for(let a of toiframe){
                    iframe = a.iframe;
                    width = a.width;
                    height = a.height;
                }
            }
            else {
                toiframe = await dynamiclink.createIframe("fb", v.fb_url);
                if(toiframe.isSuccess){
                    iframe = toiframe.iframe;
                    height = toiframe.height;
                    width = toiframe.width;

                    videos.insertIframe(v.id, iframe, width, height);
                }
            }
        }
        else if(v.ig_url != "" && v.ig_url !== null){
            iframe = v.ig_url;
        }
        else if(v.tiktok_url != "" && v.tiktok_url !== null){
            iframe = v.tiktok_url;
        }

        var link = "";
        var check = await urlshare.getRecord("video",v.id,"");
        if(check.length > 0){
            link = check[0].url;
        }
        else {
            var crt = await dynamiclink.create("video",v.id,v.title,v.desc);
            if(!crt.error){
                link = crt.link;

                var ins = await urlshare.insertRecord("video",v.id,link);
                if(ins == 0){
                    console.log("Failed to insert url share to db");
                }
            }
        }

        obj = {
            id : v.id,
            iframe : iframe,
            iframe_width : width,
            iframe_height : height,
            title : v.title,
            description : v.desc,
            categories : ct,
            likes : likes,
            views : views,
            share : share,
            start_time : v.startDate,
            end_time : v.endDate,
            facebook_url : iframe,
            instagram_url : v.ig_url,
            tiktok_url : v.tiktok_url,
            redirect_fb : v.fb_url,
            redirect_ig : v.ig_url,
            redirect_tiktok : v.tiktok_url,
            is_favourite : isFav,
            share_url : link,
            img_thumbnail : v.img_thumbnail,
            merchant : merch_object
        };

        rtn.push(obj);
    }

    return rtn;
}

exports.getDashboard = async(param, res) => {
    var req = param.query;
    var user_id = param.userId;
    var page = req.page;

    status = 200;
    var hsl = {
        live_videos : await this.objListVideosByType(user_id, "live_videos", page),
        upcoming_videos : await this.objListVideosByType(user_id, "upcoming_videos", page),
        previous_videos : await this.objListVideosByType(user_id, "previous_videos",page)
    }; 

    return res.status(status).json(hsl);
}

exports.listVideosMerchant = async(param, res) => {
    var user_id = param.userId;
    var type = param.query.type;
    var page = param.query.page;

    var data = await this.objListVideosByType(user_id, type, page);
    return res.status(200).json(data);
}

exports.objListVideosByType = async(user_id, type, page) => {
    // var user_id = req.userId;
    // var type = req.type;
    // var page = req.page;
    var item_per_page = conf_paging.item_per_page;
    var offset = (page - 1) * item_per_page;

    var cntVid = await videos.getCountVideosByType(user_id, type);
    var cnt = 0;
    for(var c of cntVid){
        cnt = c.cnt;
    }
    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }
    var vids = await videos.getListVideosPaging(user_id, type, offset, item_per_page);
    var data = await this.createObjVideos(vids, user_id);
    
    var rtn = {
        isSuccess : true,
        message : "Success get videos page " + page,
        isNext : isNext,
        total_video : cnt,
        data : data
    }

    return rtn;
}

exports.getVideosDetail = async(param, res) => {
    var req = param.query;
    var video_id = req.videoId;
    var user_id = param.userId;
    var check = this.verifyModifyLivestream(user_id, video_id);
    if(!check){
        return res.status(500).json({
            isSuccess : false,
            message : "You not authorize to view this videos"
        });
    }

    var data = {};
    var prm = {
        id : video_id,
        userId : user_id
    }
    var vids = await videos.getRecord(prm);
    for(var v of vids){
        var cat = await videos_category.getFullCategoryByVideos(v.id);

        var cnt = 0;
        var favo = await fav.getCountRecord("", "Livestream", 1, v.id);
        for(var f of favo){
            cnt = f.cnt;
        }

        var goIfr = {
            iframe : "",
            width : 0,
            height : 0
        }
        var ifr = await this.getIframe("fb", v.id, v.fb_url);
        if(ifr != undefined){
            goIfr = ifr;
        }

        data = {
            id : v.id,
            userId : v.userId,
            startDate : v.startDate,
            endDate : v.endDate,
            title : v.title,
            desc : v.desc,
            favorites : cnt,
            views : 0,
            shares : 0,
            categories : cat,
            iframe : goIfr.iframe,
            width : goIfr.width,
            height : goIfr.height,
            fb_url : v.fb_url,
            ig_url : v.ig_url,
            tiktok_url : v.tiktok_url,
            img_thumbnail : v.img_thumbnail,
            ispopular : v.ispopular,
            isrecom : v.isrecom
        };
    }

    return res.status(200).json({
        isSuccess : true,
        message : "Success get videos",
        data : data
    });
}

exports.verifyModifyLivestream = async(user_id,video_id) => {
    var rtn = false;
    var prm = {
        id : video_id,
        userId : user_id
    }
    var vids = await videos.getRecord(prm);
    if(vids.length > 0){
        rtn = true;
    }

    return rtn;
}

exports.insertShareVideo = async(param, res) => {
    var req = param.body;
    var user_id = param.userId;
    var video_id = req.videoId;

    if(video_id === undefined || video_id == ""){
        return res.status(500).json({
            isSuccess: false,
            message : "Failed insert log share video, videoId is null"
        });
    }

    var ins = await videos.insertShare(user_id, video_id);
    if(ins.affectedRows > 0){
        return res.status(200).json({
            isSuccess: true,
            message : "Success insert log share video"
        });
    }
    else {
        return res.status(500).json({
            isSuccess: false,
            message : "Failed insert log share video"
        });
    }
}

exports.getVideosSearch = async(param, res) => {
    var req = param.query;
    var user_id = param.userId;
    var keyword = req.keyword;
    var page = req.page;

    if(keyword === undefined || keyword == ""){
        return res.status(500).json({
            isSuccess: false,
            message : "Failed get search video, keyword is null"
        });
    }

    var item_per_page = conf_paging.item_per_page;
    var offset = (page - 1) * item_per_page;

    var keyword_subs = keyword.replace(/ /g,"%");
    var cntVid = await videos.getCountVideosByKeyword(keyword_subs);
    var cnt = 0;
    for(var c of cntVid){
        cnt = c.cnt;
    }
    var isNext = false;
    if(cnt > (page * item_per_page)){
        isNext = true;
    }
    var vids = await videos.getVideosByKeyword(keyword_subs, offset, item_per_page);
    var data = await this.createObjVideos(vids, user_id);

    if(page == 1){
        var ins = await search.insertKeyword(user_id, keyword);
        if(ins.affectedRows < 1){
            console.error("Failed to insert log keyword");
        }
    }

    return res.status(200).json({
        isSuccess : true,
        message : "Success get videos",
        isNext : isNext,
        total : cnt,
        data : data
    });
}

exports.submitLivestreamByAdmin = async(param, res) => {
    var form = new formidable.IncomingForm();
    form.parse(param, async(err, fields, files) => {
        if(err) {
            console.error('Error', err)
            return res.status(500).json({
                isSuccess : false,
                message : "Failed Submit Livestream"
            });
        }

        var user_id = fields.userId;
        var check = {
            filename : ""
        }
        if(files.mypic !== undefined && files.mypic != ""){
            check = await uploadfile.processUpload(files.mypic, user_id);
            if(check.error){
                return res.status(500).json({
                    isSuccess : false,
                    message : check.message
                });
            }
        }

        var msg = "";
        var img_name = "";
        if(check.filename != ""){
            img_name = config_upload.base_url + "/" + config_upload.folder + "/" + check.filename;
        }
        if(fields.videoId == ""){
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
                
                var insCat = {
                    affectedRows : 0
                };
                for(var c of cat){
                    insCat = await videos_category.insertCategory(videoId, c);
                }
                if(insCat.affectedRows > 0){
                    var prmUsr = {
                        id : param.userId
                    }
                    var usr = await users.getAllRecord(prmUsr);
                    var usr_name = "";
                    for(var u of usr){
                        usr_name = u.name;
                    }

                    var prm = {
                        userId : user_id,
                        videoId : videoId,
                        title : "A new Livestream",
                        desc : usr_name + " has added a new livestream"
                    }
                    var insNotif = await notif_ctrl.insertNotificationLivestream(prm);
                    if(insNotif == 0){
                        console.error("Error submit notification livestream on videoId " + videoId);
                    }
                    return res.status(200).json({
                        isSuccess : true,
                        message : "Success to submit livestream"
                    });
                }
                else {
                    msg = "Failed insert videos category";
                }
            }
            else {
                msg = "Failed insert videos";
            }
        }
        else {  // Update Livestream
            var check = this.verifyModifyLivestream(user_id, fields.videoId);
            if(!check){
                return res.status(500).json({
                    isSuccess : false,
                    message : "You not authorize to edit this videos"
                });
            }
            var createdAt = "0000-00-00 00:00:00";
            var tmp = "";
            var img_thumbnail = "";
            var prm = {
                id : fields.videoId
            }
            var vids = await videos.getRecord(prm);
            for(var v of vids){
                createdAt = v.createdAt;
                tmp = v.tmp;
                img_thumbnail = v.img_thumbnail;
            }
            if(img_name == ""){
                img_name = img_thumbnail;
            }
            var prm = {
                videoId : fields.videoId,
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
                tmp : tmp,
                createdAt : createdAt
            };
            var upd = await videos.replaceVideos(prm);
            if(upd.affectedRows > 0){
                var cat = [];
                if(fields.category !== undefined && fields.category != ""){
                    cat = fields.category.split(",");
                }

                var delCat = await videos_category.deleteCategory(fields.videoId);
                if(delCat.affectedRows > 0){
                    var insCat = {
                        affectedRows : 0
                    };
                    for(var c of cat){
                        insCat = await videos_category.insertCategory(fields.videoId, c);
                    }
                    if(insCat.affectedRows > 0){
                        return res.status(200).json({
                            isSuccess : true,
                            message : "Success to submit livestream"
                        });
                    }
                    else {
                        msg = "Failed insert videos category";
                    }
                }
                else {
                    msg = "Failed delete-insert videos category";
                }
            }
            else {
                msg = "Failed update videos";
            }
        }

        return res.status(500).json({
            isSuccess : false,
            message : msg
        });
    });
}

exports.deleteLivestreamByAdmin = async(param, res) => {
    var req = param.body;
    var id = req.id;
    if(id === undefined || id == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "You not authorize to delete this videos, id null"
        });
    }

    var del = await videos.deleteVideos(id);
    if(del.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Success to delete this videos"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to delete this videos"
        });
    }
}

exports.jobVideo = async() => {
    var start = moment().format("YYYY-MM-DD HH:mm:ss");
    var end = moment().add(15, 'minute').format("YYYY-MM-DD HH:mm:ss");

    var vids = await videos.getVideosByTime(start, end);
    for(let v of vids){
        var cek = await notification.getJobNotif(v.id, "Livestream");
        if(cek.length == 0){
            console.log("start notification videoid = "+v.id);
            notification.insertJobNotif(v.id, "Livestream");
            var prm = {
                userId : v.userId,
                videoId : v.id,
                title : "Check it out",
                desc : v.title + " will be live soon"
            }
            notif_ctrl.insertNotificationLivestream(prm);
        }
    }
}

exports.getIframe = async(type, videoId, url) => {
    var iframe = "";
    var height = 0;
    var width = 0;
    var toiframe = {};
    if(url != "" && url !== null){
        toiframe = await videos.getVideosIframe(videoId);
        if(toiframe.length > 0){
            for(let a of toiframe){
                iframe = a.iframe;
                width = a.width;
                height = a.height;
            }
        }
        else {
            toiframe = await dynamiclink.createIframe(type, url);
            if(toiframe.isSuccess){
                iframe = toiframe.iframe;
                height = toiframe.height;
                width = toiframe.width;

                videos.insertIframe(videoId, iframe, width, height);
            }
        }
    }

    var data = {
        iframe : iframe,
        width : width,
        height : height
    };

    return data;
}
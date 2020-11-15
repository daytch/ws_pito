const videos = require("../model/videos");
const videos_category = require("../model/videos_category");
const merchant = require("../model/merchant");

exports.getVideos = async(param, res) => {
    await videos.getVideosHome(async (err,rtn) => {
        var status = 0;
        if(rtn != null){
            var j = 0;
            var popular = [];
            var recommend = [];
            var obj = {};
            for(var v of rtn){
                var cat = await videos_category.getCategoryByVideos(v.category);
                var ct = [];
                for(var c of cat){
                    ct.push(c.name);
                }

                obj = {
                    url : '<iframe width="560" height="315" src="' + v.url + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
                    startdate : v.startDate,
                    views : "",
                    category : ct,
                    merchant : v.name
                };

                if(j%2 == 0){
                    popular.push(obj);
                }
                else {
                    recommend.push(obj);
                }
            }

            status = 200;
            var hsl = {
                popular : popular,
                recommended : recommend
            };
        }
        else if(err != null){
            console.log(err);
            status = 500;
            var hsl = {
                message : "Error on program"
            };
        }

        return res.status(status).json(hsl);
    });
};

exports.videosByCategory = async(param, res) => {
    var req = param.body;
    var id_cat = req.id_cat;

    var recommend = [];
    var status = 500;
    var isSuccess = false;
    var msg = "Failed";
    if(id_cat !== undefined && id_cat !== ""){
        var vid = await videos.getVideosByCategory(id_cat);
        
        var obj = {};
        for(var v of vid){
            var cat = await videos_category.getCategoryByVideos(v.category);
            var ct = [];
            for(var c of cat){
                ct.push(c.name);
            }

            obj = {
                url : '<iframe width="560" height="315" src="' + v.url + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
                startdate : v.startDate,
                views : "",
                category : ct,
                merchant : v.name
            };

            recommend.push(obj);
        }

        status = 200;
        isSuccess = true;
        msg = "Success";
    }

    return res.status(status).json({
        data : recommend,
        isSuccess : isSuccess,
        message : msg,
        total : recommend.length
    });
};

exports.videosPage = async(param, res) => {
    var req = param.body;
    var id = req.videoId;

    var vid = await videos.getVideosById(id);
    if(vid.length > 0){
        var param = {
            userId : vid[vid.length-1].userid
        }
        var merchant_details = await merchant.getRecord(param);
        var subs = 0;
        var count_subs = await merchant.getCountSubs(param.userId);
        for(var c of count_subs){
            subs = c.cnt;
        }

        var likes = 0;
        var count_likes = await videos.getCountLikes(id);
        for(var c of count_likes){
            likes = c.cnt;
        }

        var vid_comment = await videos.getVideosComment(id);
        var vid_cat = await videos_category.getCategoryByVideos(id);
        var rtn = {
            videos : vid,
            comments : vid_comment,
            merchant : merchant_details,
            count_subs : subs,
            count_likes : likes,
            category : vid_cat
        };

        return res.status(200).json({
            isSuccess : true,
            data : rtn
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to get videos"
        });
    }
};

exports.actionVidLikes = async(param, res) => {
    var req = param.body;
    var id = req.userId;
    var video_id = req.videoId;

    var likes = await videos.getLikesById(id, video_id);
    if(likes.length > 0){
        var sts = 0;
        for(var l of likes){
            sts = l.status;
        }

        if(sts == 0){
            sts = 1;
        }
        else {
            sts = 0;
        }

        videos.updateLikes(video_id, id, sts);
    }
    else {
        videos.insertLikes(video_id, id, 1);
    }

    return res.status(200).json({
        isSuccess : true,
        message : "Success submit likes"
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
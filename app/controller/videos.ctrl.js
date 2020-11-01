const videos = require("../model/videos");
const videos_category = require("../model/videos_category");

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

        res.status(status).json(hsl);
    });
};

exports.videosByCategory = async(param, res) => {
    
}
'use strict';
const user = require('./app/controller/user.ctrl');
const videos = require('./app/controller/videos.ctrl');
const category = require('./app/controller/category.ctrl');
const { authJwt } = require("./app/middlewares");

module.exports = function(app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.route("/")
        .get((req, res) => {
            res.json({message : 'Welcome to PITO'});
        }
    );
    
    // Function for Mobile
    app.post('/user/login', user.loginUser);
    app.post('/user/loginSSO', user.loginUserSSO);
    app.post('/user/register', user.registerUser);
    app.get('/user/videos', [authJwt.isUser], videos.getVideos);
    app.get('/user/category', [authJwt.isUser], category.getAllRecord);
    app.post('/user/getUserDetails', [authJwt.isUser], user.getUserDetails);
    app.post('/user/insertUserDetails', [authJwt.isUser], user.insertUserDetails);
    app.post('/user/registerMerchant', [authJwt.isUser], user.registerMerchant);
    app.get('/user/listmerchant', [authJwt.isUser], user.listMerchant);
    app.get('/user/getVideosByCategory', [authJwt.isUser], videos.videosByCategory);
    app.post('/user/videosPage', [authJwt.isUser], videos.videosPage);
    app.post('/user/actionVidLikes', [authJwt.isUser], videos.actionVidLikes);
    app.post('/user/actionVidComments', [authJwt.isUser], videos.actionVidComments);

    // Function for Web
    app.post('/merchant/login', user.loginMerchant);
    app.post('/admin/login', user.loginAdmin);

    app.get('/tes_jwt', [authJwt.isUser], function(req,res){
        res.json({message : 'Berhasil tes token'});
    });
};
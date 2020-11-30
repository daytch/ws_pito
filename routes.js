'use strict';
const user = require('./app/controller/user.ctrl');
const videos = require('./app/controller/videos.ctrl');
const category = require('./app/controller/category.ctrl');
const favorites = require('./app/controller/favorites.ctrl');
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
    app.get('/user/home', [authJwt.isUser], videos.getVideos);
    app.get('/user/category', [authJwt.isUser], category.getAllRecord);
    app.post('/user/registerMerchant', [authJwt.isUser], user.registerMerchant);
    app.post('/user/merchantPage', [authJwt.isUser], user.merchantPage);
    app.post('/user/videosPage', [authJwt.isUser], videos.videosPage);
    app.post('/user/actionFav', [authJwt.isUser], favorites.actionFav);
    app.post('/user/submitProfile', [authJwt.isUser], user.submitProfile);
    app.get('/user/getProfile', [authJwt.isUser], user.getProfile);
    app.post('/user/changePassword', [authJwt.isUser], user.changePassword);
    app.post('/user/listVideos', [authJwt.isUser], videos.listVideos);
    app.post('/user/forgotPassword', user.forgotPasswordReq);
    app.get('/user/listVideosByCategory', [authJwt.isUser], videos.listVideosByCategory);
    app.get('/user/listMerchant', [authJwt.isUser], user.listMerchantPaging);
    app.get('/user/listVideosByMerchant', [authJwt.isUser], videos.listVideosByMerchant);
    app.get('/user/getFavourites', [authJwt.isUser], favorites.getFav);
    
    app.post('/user/actionVidComments', [authJwt.isUser], videos.actionVidComments);
    
    app.post('/user/resetPassword', [authJwt.isResetPassword], user.resetPassword);

    // Function for Web
    app.post('/merchant/login', user.loginMerchant);
    app.post('/merchant/submitLivestream', [authJwt.isMerchant], videos.submitLivestream);
    app.post('/admin/login', user.loginAdmin);

    app.get('/tes_jwt', [authJwt.isUser], function(req,res){
        res.json({message : 'Berhasil tes token'});
    });
};
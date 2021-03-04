'use strict';
const user = require('./app/controller/user.ctrl');
const videos = require('./app/controller/videos.ctrl');
const category = require('./app/controller/category.ctrl');
const favorites = require('./app/controller/favorites.ctrl');
const notification = require('./app/controller/notification.ctrl');
const ticket = require("./app/controller/ticket.ctrl");
const { authJwt,dynamiclink } = require("./app/middlewares");
const fs = require("fs");

module.exports = function(app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.route("/")
        .get((req, response) => {
            response.writeHead(404, {
                'Content-Type': 'text/html'
            });
            fs.readFile('html/index.html', null, function (error, data) {
                if (error) {
                    response.writeHead(404);
                    respone.write('Whoops! File not found!');
                } else {
                    response.write(data);
                }
                response.end();
            });
            // response.write("Ok");
            // response.end();
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
    app.get('/user/getNotification', [authJwt.isUser], notification.getNotification);
    app.post('/user/updateNotifReadAll', [authJwt.isUser], notification.notifReadAll);
    app.post('/user/updateNotifMute', [authJwt.isUser], user.updateMute);
    app.post('/user/insertShareVideo', [authJwt.isUser], videos.insertShareVideo);
    app.get('/user/getVideosByKeyword', [authJwt.isUser], videos.getVideosSearch);
    app.post('/user/logout', [authJwt.isUser], user.logoutUser);
    
    app.post('/user/actionVidComments', [authJwt.isUser], videos.actionVidComments);
    // Function for Web
    app.post('/user/resetPassword', [authJwt.isResetPassword], user.resetPassword);
    // Merchant
    app.post('/merchant/login', user.loginMerchant);
    app.post('/merchant/loginSSO', user.logiMerchantSSO);
    app.post('/merchant/submitLivestream', [authJwt.isMerchant], videos.submitLivestream);
    app.get('/merchant/category', [authJwt.isMerchant], category.getAllRecord);
    app.get('/merchant/getDashboard', [authJwt.isMerchant], videos.getDashboard);
    app.get('/merchant/listVideos', [authJwt.isMerchant], videos.listVideosMerchant);
    app.get('/merchant/getVideosDetail', [authJwt.isMerchant], videos.getVideosDetail);
    app.get('/merchant/getProfile', [authJwt.isMerchant], user.getMerchantProfile);
    app.post('/merchant/submitProfile', [authJwt.isMerchant], user.submitMerchantProfile);
    app.get('/merchant/listVideosHistory', [authJwt.isMerchant], videos.listVideosHistoryMerchant);
    app.post('/merchant/createTicket', [authJwt.isMerchant], ticket.createTicket);
    app.post('/merchant/insertMessageTicket', [authJwt.isMerchant], ticket.insertMessage);
    app.get('/merchant/listTicket', [authJwt.isMerchant], ticket.listTicketMerchant);
    app.get('/merchant/listMessage', [authJwt.isMerchant], ticket.listMessageByTicket);
    app.post('/merchant/deleteLivestream', [authJwt.isMerchant], videos.deleteLivestream);
    app.post('/merchant/closeTicket', [authJwt.isMerchant], ticket.closeTicket);
    app.get('/merchant/getNotification', [authJwt.isMerchant], notification.getNotification);

    // Admin
    app.post('/admin/login', user.loginAdmin);
    app.get('/admin/listTicket', [authJwt.isAdmin], ticket.listTicketAdmin);
    app.post('/admin/insertMessageTicket', [authJwt.isAdmin], ticket.insertMessage);
    app.get('/admin/listMessage', [authJwt.isAdmin], ticket.listMessageByTicket);
    app.get('/admin/userList', [authJwt.isAdmin], user.getListUser);
    app.get('/admin/merchantList', [authJwt.isAdmin], user.getListMerchant);
    app.get('/admin/listCategory', [authJwt.isAdmin], category.getList);
    app.post('/admin/insertCategory', [authJwt.isAdmin], category.insertCategory);
    app.post('/admin/updateCategory', [authJwt.isAdmin], category.updateCategory);
    app.post('/admin/deleteCategory', [authJwt.isAdmin], category.updateActive);
    app.get('/admin/getDashboard', [authJwt.isAdmin], user.dashboardAdmin);
    app.get('/admin/getMerchantProfileByAdmin', [authJwt.isAdmin], user.getMerchantProfileByAdmin);
    app.post('/admin/submitLivestreamByAdmin', [authJwt.isAdmin], videos.submitLivestreamByAdmin);
    app.post('/admin/submitProfileMerchant', [authJwt.isAdmin], user.submitMerchantProfileByAdmin);
    app.get('/admin/getProfileUser', [authJwt.isAdmin], user.getProfileUserByAdmin);
    app.post('/admin/submitProfileUser', [authJwt.isAdmin], user.updateNameUserByAdmin);
    app.post('/admin/listVideos', [authJwt.isAdmin], videos.listVideos);
    app.get('/admin/getVideosByKeyword', [authJwt.isAdmin], videos.getVideosSearch);
    app.post('/admin/deleteLivestream', [authJwt.isAdmin], videos.deleteLivestreamByAdmin);
    app.post('/admin/disableUser', [authJwt.isAdmin], user.disableUserByAdmin);
    app.post('/admin/enableUser', [authJwt.isAdmin], user.enableUserByAdmin);
    app.get("/shareurl/:type/:id", async(req, response) => {
        var prm = req.params;

        var type = prm.type;
        var id = prm.id;
        var agent = req.headers['user-agent'];
        var url = "https://pito.com.sg";
        if(agent.includes("Android") || agent.includes("iPhone") || agent.includes("iPad") || agent.includes("iPod")){
            url = "pito://"+type+"?"+type+"_id="+id;
        }

        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.write("<html><head><title>PITO</title></head><body>Redirect to</body><script>location.replace('"+url+"');</script></html>");
        response.end();
    });
    
    app.get('/tes_jwt', [authJwt.isUser], function(req,res){
        res.json({message : 'Berhasil tes token'});
    });

    app.post("/tesf", function(req,res){
        console.log(req.headers);
        console.log(req.body);
        return res.json({
            sts : "ok"
        });
    });
};
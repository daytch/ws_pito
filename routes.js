'use strict';
const user = require('./app/controller/user.ctrl');
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

    // Function for Web
    app.post('/merchant/login', user.loginMerchant);
    app.post('/admin/login', user.loginAdmin);

    app.get('/tes_jwt', [authJwt.verifyToken, authJwt.isUser], function(req,res){
        res.json({message : 'Berhasil tes token'});
    });
};
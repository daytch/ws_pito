const config = require("../config/auth.config");
const users = require("../model/users");
const merchant = require("../model/merchant");
const videos_ctrl = require("../controller/videos.ctrl");

const jwt = require("jsonwebtoken");
const { user } = require("../config/db.config");

exports.loginUser = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    if(req.email == ""){
        // Gagal
        return res.status(500).json({
            isSuccess : false,
            message : "Login Failed"
        });
    }
    await users.loginUser(req.email, req.password, "User", res, this.processLogin);
};

exports.loginUserSSO = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    if(req.email == ""){
        // Gagal
        return res.status(500).json({
            isSuccess : false,
            message : "Login Failed"
        });
    }
    await users.loginUserSSO(req.email, "User", res, this.processLogin);
};

exports.loginMerchant = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    await users.loginUser(req.email, req.password, "Merchant", res, this.processLogin);
};

exports.loginAdmin = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    await users.loginUser(req.email, req.password, "Admin", res, this.processLogin);
};

exports.registerUser = async(param, res) => {
    var req = param.body;
    if(req.email == ""){
        // Gagal
        return res.status(500).json({
            isSuccess : false,
            message : "Register User gagal"
        });
    }
    await users.registerUser(req, async(err, rtn) => {
        if(rtn != null){
            if(rtn.affectedRows > 0){
                // Sukses
                var prm = {
                    username : req.username
                };
                var usr = await users.getAllRecord(prm);
                var id_user = "";
                for(let u of usr){
                    id_user = u.id;
                }

                var prmRoles = {
                    userId : id_user,
                    roleId : 1 // Roles Default User
                };
                await users.registerUsersRole(prmRoles, function(errRole, rtnRole){
                    if(rtnRole != null){
                        if(rtnRole.affectedRows > 0){
                            return res.status(200).json({
                                isSuccess : true,
                                message : "Register User berhasil"
                            });
                        }
                        else {
                            return res.status(500).json({
                                isSuccess : false,
                                message : "Register User gagal"
                            });
                        }
                    }
                    else {
                        console.log("registerUser-error");
                        console.log(errRole);

                        return res.status(500).json({
                            isSuccess : false,
                            message : "Register User gagal"
                        });
                    }
                });
            }
            else {
                // Gagal
                return res.status(500).json({
                    isSuccess : false,
                    message : "Register User gagal"
                });
            }
        }
        else {
            console.log("registerUser-error");
            console.log(err);

            return res.status(500).json({
                isSuccess : false,
                message : "Register User gagal"
            });
        }
    });
};

exports.getUserDetails = async(param, res) => {
    var req = param.body;
    var dt = await users.getUserDetails(req.userId);

    var rtn = {};
    var status = 500; // Default if failed.
    if(dt.length > 0){
        status = 200;
        rtn = dt[dt.length - 1];
    }
    else {
        rtn = {
            message : "User details not found"
        };
    }

    return res.status(status).json(rtn);
}

exports.insertUserDetails = async(param, res) => {
    var req = param.body;
    var ins = {
        affectedRows : 0
    };
    if(req.userId != undefined){
        ins = await users.insertUsertDetails(req);
    }
    
    var rtn = {
        isSuccess : '',
        message : ''
    }
    var status = 500; // Default if failed.
    if(ins.affectedRows > 0){
        status = 200;
        rtn.isSuccess = true;
        rtn.message = "Insert User details success";
    }
    else {
        rtn.isSuccess = false;
        rtn.message = "Insert User details failed";
    }

    return res.status(status).json(rtn);
}

exports.registerMerchant = async(param, res) => {
    var req = param.body;
    var ins = {
        affectedRows : 0
    };
    var msg = "";

    if(req.userId != undefined){
        ins = await merchant.insertMerchantDetails(req);
        if(ins.affectedRows > 0){
            var id_role = 0;
            var role = await users.getRolesByName("Merchant");
            for(var r of role){
                id_role = r.id;
            }
            var prm = {
                userId : req.userId,
                roleId : id_role
            };
            ins = await users.registerUsersRoleAwait(prm);
            if(ins.affectedRows > 0){
                msg = "Success Register Merchant";
            }
        }
    }

    var status = 500;
    var isSuccess = false;
    if(msg == ""){
        msg = "Failed Register Merchant";
    }
    else {
        status = 200;
        isSuccess = true;
    }

    return res.status(status).json({
        isSuccess : isSuccess,
        message : msg
    });
}

exports.listMerchant = async(param,res) => {
    var req = param.body;
    var id_merchant = 0;
    if(req.id_merchant != undefined && req.id_merchant != ""){
        id_merchant = req.id_merchant;
    }
    
    var id_role = 0;
    var role = await users.getRolesByName("Merchant");
    for(var r of role){
        id_role = r.id;
    }

    var usr = await users.getListMerchant(id_role, id_merchant);
    var status = 500;
    var isSuccess = false;
    var data = [];
    var dt = {};
    for(var u of usr){
        dt = {
            id : u.userId,
            name : u.first_name
        };
        data.push(dt);
    }

    if(data.length > 0){
        status = 200;
        isSuccess = true;
    }

    return res.status(status).json(data);
}

exports.merchantPage = async(param,res) => {
    var req = param.body;
    var merchant_id = req.merchantId;
    var user_id = req.userId;
    var rtn = {};

    if(merchant_id == undefined || merchant_id == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to get merchant details"
        });
    }

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

    var data_merchant = await users.getUserDetailsWithName(merchant_id);
    for(var m of data_merchant){
        rtn = {
            name : m.name,
            profile_image_url : m.img_avatar,
            totalSubscriber : subs,
            info : '',
            description : m.about_me,
            categories : [],
            isSubscriber : isSubs,
            facebook_url : m.fb_url,
            instagram_url : m.ig_url,
            tiktok_url : m.tiktok_url,
            share_url : '',
            detail : {}
        };

        var dtls = {};  // Object merchant details

        // var merchant_dtls = await merchant.getRecord(merchant_id);
        // var merch_fb = "";
        // var merch_ig = "";
        // var merch_tiktok = "";
        // for(var dtls of merchant_dtls){
        //     merch_fb = dtls.fb_url;
        //     merch_ig = dtls.ig_url;
        //     merch_tiktok = dtls.tiktok_url;
        // }

        dtls = {
            live_videos : await videos_ctrl.videosMerchantByMoment(merchant_id, "live_videos"),
            upcoming_videos : await videos_ctrl.videosMerchantByMoment(merchant_id, "upcoming_videos"),
            previous_videos : await videos_ctrl.videosMerchantByMoment(merchant_id, "previous_videos")
        };

        rtn.detail = dtls;
    }

    return res.status(200).json({
        isSuccess : true,
        message : "Success to get merchant details",
        data : [rtn]
    });
}

exports.processLogin = async(err,rtn,res) => {
    var dt = {};
    var status = 0;

    if(rtn != null){
        var cnt = rtn.length;
        if(cnt > 0){
            var userId = "";
            var roleName = "";  // Untuk Token
            var roleArr = [];
            var userEmail = "";
            var name = "";
            for(var p of rtn){
                userId = p.id;
                userEmail = p.email;
                name = p.name;
                if(roleName != ""){
                    roleName += ",";
                }
                roleName += p.role_name;  // Untuk Token
                roleArr.push(p.role_name);
            }

            var image = "";
            if(userId != ""){
                var dtls = await users.getUserDetails(userId);
                for(var d of dtls){
                    image = d.img_avatar;
                }
            }

            status = 200;
            var token = jwt.sign({ id : userId, role : roleName }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            dt = {
                isSuccess : true,
                message : 'Success',
                id : userId,
                name : name,
                email : userEmail,
                image : image,
                roles : roleArr,
                token : token
            }
        }
        else {
            status = 500;
            dt = {
                isSuccess : false,
                message : 'Username or password did not match'
            }
        }
    }
    else {
        status = 500;
        dt = {
            isSuccess : false,
            message : 'Login Failed'
        }
    }

    return res.status(status).json(dt);
}
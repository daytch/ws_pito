const config = require("../config/auth.config");
const users = require("../model/users");
const merchant = require("../model/merchant");
const videos = require("../model/videos");
const videos_ctrl = require("../controller/videos.ctrl");

const jwt = require("jsonwebtoken");
const { mailer,uploadfile } = require("../middlewares");
const moment = require("moment");
const bcrypt = require("bcrypt");

exports.loginUser = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    if(req.email == ""){
        // Gagal
        return res.status(500).json({
            isSuccess : false,
            message : "Login Failed, email has been null"
        });
    }
    var verif = await verifyLogin(req.email, req.password);
    if(!verif){
        return res.status(500).json({
            isSuccess : false,
            message : 'Username or password did not match'
        });
    }

    await users.loginUser(req.email, "", res, this.processLogin);
};

exports.loginUserSSO = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    if(req.email == undefined || req.email == ""){
        // Gagal
        return res.status(500).json({
            isSuccess : false,
            message : "Login Failed"
        });
    }
    var login = await users.loginUserSSO(req.email, "User");
    if(login.length == 0){
        var salt = await bcrypt.genSalt(config.regSalt);
        var password = await bcrypt.hash("defaultpassSSO202011", salt);

        var parm = {
            email : req.email,
            source : req.source,
            password : password,
            name : req.name
        };
        await users.registerUser(parm, async(err, rtn) => {
            if(rtn != null){
                if(rtn.affectedRows > 0){
                    // Sukses
                    var prm = {
                        email : req.email
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
                    await users.registerUsersRole(prmRoles, async(errRole, rtnRole) => {
                        if(rtnRole != null){
                            if(rtnRole.affectedRows > 0){
                                var prm_dtls = {
                                    userId : id_user,
                                    img_avatar : req.img_avatar,
                                    isMute : 0
                                };
                                var ins_dtls = await users.insertUsertDetails(prm_dtls);
                                if(ins_dtls.affectedRows > 0){
                                    // Direct login
                                    await users.loginUser(req.email, "", res, this.processLogin);
                                }
                                else {
                                    return res.status(500).json({
                                        isSuccess : false,
                                        message : "Register User failed on details"
                                    });
                                }
                            }
                            else {
                                return res.status(500).json({
                                    isSuccess : false,
                                    message : "Register User failed"
                                });
                            }
                        }
                        else {
                            console.log("registerUser-error");
                            console.log(errRole);
    
                            return res.status(500).json({
                                isSuccess : false,
                                message : "Register User failed"
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
    }
    else {
        await users.loginUser(req.email, "", res, this.processLogin);
    }
};

exports.loginMerchant = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    if(req.email == ""){
        // Gagal
        return res.status(500).json({
            isSuccess : false,
            message : "Login Failed, email has been null"
        });
    }
    var verif = await verifyLogin(req.email, req.password);
    if(!verif){
        return res.status(500).json({
            isSuccess : false,
            message : 'Username or password did not match'
        });
    }
    await users.loginUser(req.email, "Merchant", res, this.processLogin);
};

exports.loginAdmin = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    if(req.email == ""){
        // Gagal
        return res.status(500).json({
            isSuccess : false,
            message : "Login Failed, email has been null"
        });
    }
    var verif = await verifyLogin(req.email, req.password);
    if(!verif){
        return res.status(500).json({
            isSuccess : false,
            message : 'Username or password did not match'
        });
    }
    await users.loginUser(req.email, "Admin", res, this.processLogin);
};

exports.registerUser = async(param, res) => {
    var req = param.body;
    if(req.email == undefined || req.email == ""){
        // Gagal
        return res.status(500).json({
            isSuccess : false,
            message : "Register User failed"
        });
    }
    var check_user = await users.getAllRecord(req);
    if(check_user.length > 0){
        // Gagal
        return res.status(500).json({
            isSuccess : false,
            message : "Email has been registered"
        });
    }

    req.source = 'App';     // Register from Application
    var salt = await bcrypt.genSalt(config.regSalt);
    req.password = await bcrypt.hash(req.password, salt);

    await users.registerUser(req, async(err, rtn) => {
        if(rtn != null){
            if(rtn.affectedRows > 0){
                // Sukses
                var prm = {
                    email : req.email
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
                await users.registerUsersRole(prmRoles, async(errRole, rtnRole) => {
                    if(rtnRole != null){
                        if(rtnRole.affectedRows > 0){
                            var prm_dtls = {
                                userId : id_user,
                                img_avatar : '',
                                isMute : 0
                            };
                            var ins_dtls = await users.insertUsertDetails(prm_dtls);
                            if(ins_dtls.affectedRows > 0){
                                return res.status(200).json({
                                    isSuccess : true,
                                    message : "Register User success"
                                });
                            }
                            else {
                                return res.status(500).json({
                                    isSuccess : false,
                                    message : "Register User failed"
                                });
                            }
                        }
                        else {
                            return res.status(500).json({
                                isSuccess : false,
                                message : "Register User failed"
                            });
                        }
                    }
                    else {
                        console.log("registerUser-error");
                        console.log(errRole);

                        return res.status(500).json({
                            isSuccess : false,
                            message : "Register User failed"
                        });
                    }
                });
            }
            else {
                // Gagal
                return res.status(500).json({
                    isSuccess : false,
                    message : "Register User failed"
                });
            }
        }
        else {
            console.log("registerUser-error");
            console.log(err);

            return res.status(500).json({
                isSuccess : false,
                message : "Register User failed"
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
    var user_id = param.userId;
    var req = param.body;
    req.userId = user_id;
    var prm = {
        userId : user_id
    };
    var msg = "";
    var isRegister = await merchant.getRecord(prm);
    if(isRegister.length == 0){
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

exports.listMerchant =async(user_id, type) => {
    var id_merchant = 0;    // to get All    
    var id_role = 0;
    var role = await users.getRolesByName("Merchant");
    for(var r of role){
        id_role = r.id;
    }

    var usr = await users.getListMerchant(id_role, id_merchant, type);
    var data = [];
    var dt = {};
    for(var u of usr){
        var cnt_sub = 0;
        var countsubs = await merchant.getCountSubs(u.id);
        for(var c of countsubs){
            cnt_sub = c.cnt;
        }

        var cnt_live = 0;
        var countlive = await videos.getCountVideosByUserId(u.id);
        for(var l of countlive){
            cnt_live = l.cnt;
        }

        var cat = [];
        var merch_cat = await merchant.getCategoryByUserId(u.id);
        for(var mc of merch_cat){
            cat.push(mc.name);
        }

        var isSubs = false;
        var checksubs = await merchant.getCountSubsById(u.id, user_id);
        if(checksubs.length > 0){
            isSubs = true;
        }

        dt = {
            id : u.id,
            name : u.name,
            totalSubscriber : cnt_sub,
            profile_image_url : u.img_avatar,
            total_livestream : cnt_live,
            description : u.about,
            join_date : u.createdAt,
            categories : cat,
            isSubscriber : isSubs,
            facebook_url : u.fb_url,
            instagram_url : u.ig_url,
            tiktok_url : u.tiktok_url,
            share_url : "",
            detail : []
        };
        
        data.push(dt);
    }

    return data;
}

exports.merchantPage = async(param,res) => {
    var req = param.body;
    var merchant_id = req.merchantId;
    var user_id = param.userId;
    var rtn = {};

    if(merchant_id == undefined || merchant_id == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to get merchant details, Merchant id is null"
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

    // var data_merchant = await users.getUserDetailsWithName(merchant_id);
    var id_role = 0;
    var role = await users.getRolesByName("Merchant");
    for(var r of role){
        id_role = r.id;
    }
    var data_merchant = await users.getListMerchant(id_role, merchant_id, "");
    for(var m of data_merchant){
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
            share_url : '',
            detail : {}
        };

        var dtls = {
            live_videos : await videos_ctrl.videosMerchantByMoment(merchant_id, "live_videos",user_id),
            upcoming_videos : await videos_ctrl.videosMerchantByMoment(merchant_id, "upcoming_videos", user_id),
            previous_videos : await videos_ctrl.videosMerchantByMoment(merchant_id, "previous_videos",user_id)
        };

        rtn.detail = dtls;
    }

    return res.status(200).json({
        isSuccess : true,
        message : "Success to get merchant details",
        data : rtn
    });
}

exports.forgotPasswordReq = async(param,res) => {
    var req = param.body;
    if(req.email == undefined || req.email == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to forgot password, email has null"
        });
    }
    var interval_time = 86400; // 24 hours

    var name = "";
    var token = "";
    var usr = await users.getAllRecord(req);
    for(var u of usr){
        name = u.name;
        token = jwt.sign({ email : u.email, desc : "Forgot Password" }, config.secret, {
            expiresIn: interval_time
        });
    }

    if(usr.length > 0){
        var exp_time  = moment().add(interval_time, "s");
        var exp_str = exp_time.format("YYYY-MM-DD HH:mm:ss");
        var ins = await users.insertForgotPass(req.email, 0, exp_str, token);

        if(ins.affectedRows > 0){
            var url = "https://pito-api.herokuapp.com/user/resetPassword?token=" + token;
            var subject = "Pito User Forgot Password";
            var text = "Hi " + name + ",<br/><br/>";
                text += "Please reset your password on this link :<br/>";
                text += url + " <br/>";
                text += "Expired on " + exp_str + " <br/><br/>";
                text += "Regards,<br/>Pito Team";

            var mail = await mailer.sendMail(req.email, subject, text);

            if(mail){
                return res.status(200).json({
                    isSuccess : true,
                    message : "Success send email forgot password"
                });
            }
            else {
                return res.status(500).json({
                    isSuccess : false,
                    message : "Failed send email forgot password"
                });
            }
        }
        else {
            return res.status(500).json({
                isSuccess : false,
                message : "Failed send email forgot password"
            });
        }
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to forgot password, User is not registered"
        });
    }
    
}

exports.resetPassword = async(param, res) => {
    var req = param.body;
    if(req.email == undefined || req.email == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to reset password, email has null"
        });
    }

    var upd = await users.changePassword(req.email, req.password);
    if(upd.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Success to reset password"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to reset password"
        });
    }
}

exports.changePassword = async(param, res) => {
    var req = param.body;
    if(req.email == undefined || req.email == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to change password, email has null"
        });
    }
    var prm = {
        email : req.email,
        password : req.old_password
    }
    var cek = await users.getAllRecord(prm);
    if(cek.length > 0){
        var upd = await users.changePassword(req.email, req.new_password);
        if(upd.affectedRows > 0){
            return res.status(200).json({
                isSuccess : true,
                message : "Success to change password"
            });
        }
        else {
            return res.status(500).json({
                isSuccess : false,
                message : "Failed to change password"
            });
        }
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed to change password, Username or password did not match"
        });
    }
}

exports.listFav = async(param,res) => {
    var req = param.body;
    var type = req.type;
    var user_id = req.userId;

    if(user_id == undefined || user_id == ""){
        return res.status(500).json({
            isSuccess : true,
            message : "Failed to get list favorite"
        });
    }
}

async function verifyLogin(email, loginpass){
    var rtn = false;
    var prm = {
        email : email
    };
    var usr = await users.getAllRecord(prm);
    if(usr.length > 0){
        var pass = "";
        for(let u of usr){
            pass = u.password;
        }
        var isSame = await bcrypt.compare(loginpass, pass);
        if(isSame){
            rtn = true;
        }
    }

    return rtn;
}

exports.processLogin = async(err,rtn,res,role) => {
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

            // Login User
            if(role == ""){
                if(!roleName.includes("User")){
                    status = 500;
                    dt = {
                        isSuccess : false,
                        message : 'Username or password did not match'
                    }
                    return res.status(status).json(dt);
                }
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

exports.uploadFile = async(param, res) => {
    var req = param.body;
    var upload = uploadfile();
    upload(param,res,function(err) { 
  
        if(err) { 
  
            // ERROR occured (here it can be occured due 
            // to uploading image of size greater than 
            // 1MB or uploading different file type) 
            res.json(err) 
        } 
        else { 
  
            // SUCCESS, image successfully uploaded 
            res.json({msg : "Success, Image uploaded!"}) 
        } 
    });
}
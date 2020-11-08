const config = require("../config/auth.config");
const users = require("../model/users");
const merchant = require("../model/merchant");

const jwt = require("jsonwebtoken");
const { user } = require("../config/db.config");

exports.loginUser = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    await users.loginUser(req.username, req.password, "", res, processLogin);
};

exports.loginMerchant = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    await users.loginUser(req.username, req.password, "Merchant", res, processLogin);
};

exports.loginAdmin = async(param, res) => {
    // res.json({message : 'halo ' + req.username + ', pass ' + req.password});
    var req = param.body;
    await users.loginUser(req.username, req.password, "Admin", res, processLogin);
};

exports.registerUser = async(param, res) => {
    var req = param.body;
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

    res.status(status).json(rtn);
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

    res.status(status).json(rtn);
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

    res.status(status).json({
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

    res.status(status).json(data);
}

function processLogin(err,rtn,res){
    var dt = {};
    var status = 0;

    if(rtn != null){
        var cnt = rtn.length;
        if(cnt > 0){
            var userId = "";
            var roleName = "";  // Untuk Token
            var roleArr = [];
            var userEmail = "";
            var userName = "";
            for(var p of rtn){
                userId = p.id;
                userEmail = p.email;
                userName = p.username;
                if(roleName != ""){
                    roleName += ",";
                }
                roleName += p.role_name;  // Untuk Token
                roleArr.push(p.role_name);
            }

            status = 200;
            var token = jwt.sign({ id : userId, role : roleName }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            dt = {
                isSuccess : true,
                message : 'Success',
                id : userId,
                username : userName,
                email : userEmail,
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
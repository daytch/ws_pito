const config = require("../config/auth.config");
const users = require("../model/users");

const jwt = require("jsonwebtoken");

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
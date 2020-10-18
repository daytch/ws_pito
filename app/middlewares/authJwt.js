const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

verifyToken = (req, res, next) => {
    // console.log(req.headers);
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: err// "Unauthorized!"
            });
        }

        req.userId = decoded.id;
        req.roleName = decoded.role;
        // console.log(decoded);
        next();
    });
};

isUser = (req,res,next) => {
    if(!req.roleName.includes("User")){
        return res.status(401).send({
            message: "Unauthorized Token"// "Unauthorized!"
        });
    }
    next();
};

isMerchant = (req,res,next) => {
    if(!req.roleName.includes("Merchant")){
        return res.status(401).send({
            message: "Unauthorized Token"// "Unauthorized!"
        });
    }
    next();
};

isAdmin = (req,res,next) => {
    if(!req.roleName.includes("Admin")){
        return res.status(401).send({
            message: "Unauthorized Token"// "Unauthorized!"
        });
    }
    next();
};

// isAdmin = (req, res, next) => {
//     User.where('id',req.userId)
//     .fetch()
//     .then(user=>{

//     })
//     User.findByPk(req.userId).then(user => {
//         user.getRoles().then(roles => {
//             for (let i = 0; i < roles.length; i++) {
//                 if (roles[i].name === "admin") {
//                     next();
//                     return;
//                 }
//             }

//             res.status(403).send({
//                 message: "Require Admin Role!"
//             });
//             return;
//         });
//     });
// };

// isMerchant = (req, res, next) => {
//     User.findByPk(req.userId).then(user => {
//         user.getRoles().then(roles => {
//             for (let i = 0; i < roles.length; i++) {
//                 if (roles[i].name === "moderator") {
//                     next();
//                     return;
//                 }
//             }

//             res.status(403).send({
//                 message: "Require Moderator Role!"
//             });
//         });
//     });
// };

// isMerchantOrAdmin = (req, res, next) => {
//     User.findByPk(req.userId).then(user => {
//         user.getRoles().then(roles => {
//             for (let i = 0; i < roles.length; i++) {
//                 if (roles[i].name === "moderator") {
//                     next();
//                     return;
//                 }

//                 if (roles[i].name === "admin") {
//                     next();
//                     return;
//                 }
//             }

//             res.status(403).send({
//                 message: "Require Moderator or Admin Role!"
//             });
//         });
//     });
// };

const authJwt = {
    verifyToken: verifyToken,
    isUser : isUser,
    isAdmin: isAdmin,
    isMerchant: isMerchant,
    // isMerchantOrAdmin: isMerchantOrAdmin
};
module.exports = authJwt;
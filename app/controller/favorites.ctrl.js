const favorites = require("../model/favorites");

exports.actionFav = async(param, res) => {
    var req = param.body;
    var user_id = param.userId;
    var type = req.type;
    var pkey = req.pkey;
    var ins = {
        affectedRows : 0
    };

    if(user_id === undefined || type === undefined || pkey === undefined){
        return res.status(500).json({
            isSuccess : false,
            message : "Submit favourites failed, parameter undefined"
        });
    }

    var new_status = 1;
    var check = await favorites.getRecord(user_id, type, "", pkey);
    if(check.length > 0){
        var status = check[check.length - 1].status;
        if(status == 1){
            new_status = 0;
        }

        ins = await favorites.submitRecord(user_id, type, new_status, pkey, false);
    }
    else {
        ins = await favorites.submitRecord(user_id, type, new_status, pkey, true);
    }

    if(ins.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Submit favourites success"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Submit favourites failed"
        });
    }
}
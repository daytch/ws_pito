const category = require("../model/category");
const videos = require("../model/videos");
const merchant = require("../model/merchant");
const search = require("../model/search");

exports.getAllRecord = async(param, res) => {
    var cat = await category.getAllRecord();
    var listcat = [];
    

    for(var c of cat){
        var objCat = {
            id : c.id,
            text : c.name
        };
        listcat.push(objCat);
    }

    var status = 500;
    var rtn = {
        isSuccess: false,
        message: "Failed",
        data : [
            objCat
        ],
        total: 0
    }
    if(listcat.length > 0){
        status = 200;
        rtn.isSuccess = true;
        rtn.message = "Success";
        rtn.data = listcat;
        rtn.total = listcat.length;
    }

    return res.status(status).json(rtn);
};

exports.getList = async(param, res) => {
    var cat = await category.getAllRecord();
    var listcat = [];
    
    for(var c of cat){
        var dt = await videos.getCountVideosByCat("",c.id,"");
        var total_livestream = 0;
        for(var d of dt){
            total_livestream = d.cnt;
        }

        dt = await merchant.getCountCategory(c.id);
        var total_merchant = 0;
        for(var d of dt){
            total_merchant = d.cnt;
        }

        dt = await videos.getCountViewVideosByCat(c.id);
        var total_views = 0;
        for(var d of dt){
            total_views = d.cnt;
        }

        dt = await search.getCountCategoryById(c.id);
        var total_searches = 0;
        for(var d of dt){
            total_searches = d.cnt;
        }

        var objCat = {
            id : c.id,
            name : c.name,
            // slug : c.name,
            total_livestream : total_livestream,
            total_merchant : total_merchant,
            total_searches : total_searches,
            total_views : total_views/*,
            total_favorites : 0,
            total_shared : 0*/
        };
        listcat.push(objCat);
    }

    var status = 200;
    var rtn = {
        isSuccess: true,
        data : listcat
    }
    return res.status(status).json(rtn);
}

exports.insertCategory = async(param, res) => {
    var req = param.body;

    var ins = await category.insertRecord(req);
    if(ins.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Success insert data"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed insert data"
        });
    }
}

exports.updateCategory = async(param, res) => {
    var req = param.body;

    if(req.id === undefined || req.id == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "Failed update data, id is null"
        });
    }
    var ins = await category.updateRecord(req);
    if(ins.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Success update data"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed update data"
        });
    }
}

exports.updateActive = async(param, res) => {
    var req = param.body;
    if(req.id === undefined || req.id == ""){
        return res.status(500).json({
            isSuccess : false,
            message : "Failed update data, id is null"
        });
    }
    var ins = await category.updateActive(req);
    if(ins.affectedRows > 0){
        return res.status(200).json({
            isSuccess : true,
            message : "Success delete data"
        });
    }
    else {
        return res.status(500).json({
            isSuccess : false,
            message : "Failed delete data"
        });
    }
}
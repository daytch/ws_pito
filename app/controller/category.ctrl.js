const category = require("../model/category");

exports.getAllRecord = async(param, res) => {
    var cat = await category.getAllRecord();
    var listcat = [];
    var objCat = {
        id : '',
        text : ''
    };

    for(var c of cat){
        objCat.id = c.id;
        objCat.text = c.name;
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
const conf = require("../config/upload.config");
const fsPromises = require("fs").promises;

exports.processUpload = async(files, user_id) => {
    var upload_name = files.name;
    var filepath = files.path;
    var filesize = files.size;
    var filetype = files.type;
    var i = 0;
    // for(var objFile of Object.entries(files)){
    //     for(var f of objFile){
    //         if(i == 1){
    //             upload_name = f.name;
    //             filepath = f.path;
    //             filesize = f.size;
    //             filetype = f.type;
    //         }
    //         i++;
    //     }
    // }
    // Check size
    if(filesize > conf.maxSize){
        var rtn = {
            error : true,
            message : "File over max size"
        };
        return rtn;
    }
    // Check File Type
    // var arrtype = filetype.split("/");
    // var ftype = arrtype[arrtype.length - 1];
    // if(!conf.filetypes.includes(ftype)){
    //     var rtn = {
    //         error : true,
    //         message : "File type not allowed " + filetype
    //     };
    //     console.log(arrtype);
    //     return rtn;
    // }
    if(!filetype.includes("image")){
        var rtn = {
            error : true,
            message : "File type not allowed " + filetype,
            filename : ""
        };
        console.log(filetype);
        return rtn;
    }

    var arrName = upload_name.split(".");
    var ext_file = arrName[arrName.length - 1];
    var fileName = "user" + user_id + "_" + Date.now() + "." + ext_file;
    var new_path = appRoot + '/'+ conf.folder +'/' + fileName;
    var rtn = {
        error : true,
        message : "Failed to save file"
    }

    try{
        await fsPromises.copyFile(filepath, new_path);
        rtn = {
            error : false,
            filename : fileName
        }
    }
    catch(err){
        console.log(err);
    }

    return rtn;
}
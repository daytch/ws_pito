const axios = require("axios").default;

exports.create = async(type, id, title, desc) => {
    var data = {
        "dynamicLinkInfo": {
            // "domainUriPrefix": "https://pito.page.link",
            "domainUriPrefix": "https://link.pito.com.sg",
            "link": "https://api.pito.com.sg/shareurl/"+type+"/"+id,
            "androidInfo": {
                "androidPackageName": "com.pito"
            },
            "iosInfo": {
                "iosBundleId": "com.pito"
            },
            "socialMetaTagInfo": {
                "socialTitle": title,
                "socialDescription": desc,
                "socialImageLink": ""
            }
          
        }
    }

    var url = "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyA2F6NaUmeZbaKwYWW_fIkJ3k9iR1tHH-I";

    var rtn = {};
    try{
        var process = await axios.post(url, data);
        if(process.status == 200){
            rtn = {
                error : false,
                link : process.data.shortLink
            }
        }
        else {
            console.error(process.status);
            rtn = {
                error : true,
                link : ""
            }
        }
    }
    catch(error) {
        console.error(error);
        rtn = {
            error : true,
            link : ""
        }
    }

    return rtn;
}

exports.createIframe = async(type, url) => {
    var rtn = {
        isSuccess : false
    }
    if(url == ""){
        return rtn;
    }

    if(type == "fb"){
        // if(url.substr(url.length-1, 1) != "/"){
        //     url += "/";
        // }
        // rtn += '<iframe src="https://www.facebook.com/plugins/video.php?href='+url+'&show_text=0" height="530" width="530" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>';

        var urls = "https://graph.facebook.com/oembed_video?";
        urls += "access_token=199209148505469|6a671bd86be0d70d41f2107d67bf0ba5";
        urls += "&url="+url;
        urls += "&useiframe=true";

        try{
            var process = await axios.get(urls);
            if(process.status == 200){
                rtn = {
                    isSuccess : true,
                    iframe : process.data.html,
                    height : process.data.height,
                    width : process.data.width
                }
            }
            else {
                console.error(process.status);
                rtn = {
                    isSuccess : false
                }
            }
        }
        catch(error) {
            console.error(error);
            rtn = {
                isSuccess : false
            }
        }
    }

    return rtn;
}
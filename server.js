var express = require('express'),
    app = express(),
    port = process.env.PORT || 8080,
    bodyParser = require('body-parser'),
    cors = require("cors"),
    path = require("path");

app.use("*", cors());
app.use('/pic', express.static('pic'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes');
routes(app);

global.appRoot = path.resolve(__dirname);
app.listen(port);
console.log('RESTful API server started on: ' + port);

var { sendNotif } = require("./app/middlewares");
sendNotif.init();

// Job Notification
var videos = require("./app/controller/videos.ctrl");
setInterval(() => {
    videos.jobVideo();
}, 300000);
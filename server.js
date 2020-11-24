var express = require('express'),
    app = express(),
    port = process.env.PORT || 8080,
    bodyParser = require('body-parser'),
    path = require("path");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes');
routes(app);

global.appRoot = path.resolve(__dirname);
app.listen(port);
console.log('RESTful API server started on: ' + port);
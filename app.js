var app = require('express')();
var router = require('./lib/routers/calcRouter');
var server = {};
app.use("/calculator", router);
server = app.listen(6000);
exports.app = app;
exports.server = server;



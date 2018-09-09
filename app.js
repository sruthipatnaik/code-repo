var app = require('express')();
var request = require('supertest');
var router = require('./lib/routers/calcRouter');
app.use("/calculator", router);
app.listen(8080);
exports.app = app;
exports.request = request;


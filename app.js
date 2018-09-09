var app = require('express')();
var router = require('./lib/routers/calcRouter');
app.use("/calculator", router);
app.listen(6000);
exports.app = app;



var app = require('express')();
var router = require('./lib/routers/calcRouter');
app.use("/calculator", router);
app.listen(5000);
exports.app = app;



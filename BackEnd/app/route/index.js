const express = require("express");
const route = express.Router();

route.use("/admin",require('./admin'))
route.use("/user",require('./user'))
route.use("/",require('./admin'))

module.exports = route;

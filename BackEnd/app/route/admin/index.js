const express = require("express");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const route = express.Router();
const Auth = require("../../auth/auth");
const User = require("../../controller/user");
const common = require("../../utils/common");

route.post("/login", jsonParser, Auth.login);
route.post("/user/add", common.jwtDecode, jsonParser, User.create);
route.post("/user/block/:id", common.jwtDecode, jsonParser, User.blockedUser);
route.delete("/user/delete/:id", common.jwtDecode, jsonParser, User.deleteUser);

module.exports = route;

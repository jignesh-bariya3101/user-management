const express = require("express");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const route = express.Router();
const Auth = require("../../auth/auth");
const User = require("../../controller/user");
const common = require("../../utils/common");

route.get("/verify/:uniqueCode", jsonParser, User.verifyEmail);
route.get("/verify/OTP/:OTP", jsonParser, User.verifyOTP);
route.post("/update-password/:OTP", jsonParser, User.updatePassword);
route.post("/resend/OTP", jsonParser, User.resendOTP);
route.post("/login", jsonParser, Auth.userLogin);
route.get("/list", jsonParser, common.jwtDecode, User.getAllUser);

module.exports = route;

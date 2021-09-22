const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { ROLE } = require("../utils/constant");
const HttpError = require("../models/http-error");
const common = require("../utils/common");

const login = async (req, res, next) => {
  try {
    const validatelogin = Joi.object({
      email: Joi.string().email().valid().required(),
      password: Joi.string().required(),
    });
    const result = await validatelogin.validateAsync(req.body);
    console.log("result :>> ", result);
    try {
      const getAdmin = await User.findOne({
        email: result.email,
      }).lean();
      if (getAdmin) {
        const passwordMatch = await bcrypt.compare(
          result.password,
          getAdmin.password
        );
        if (passwordMatch) {
          const payload = {
            userId: getAdmin._id,
            email: getAdmin.email,
            role: getAdmin.role,
            time: new Date(),
          };
          const token = common.jwtEncode(payload);
          if (token && token.err) {
            const err = new HttpError(token.err, 500);
            return next(err);
          }
          return res.status(200).json({
            success: true,
            data: token,
            message: "LoggedIn Successfully.",
          });
        } else {
          const err = new HttpError("Invalid Password.", 400);
          return next(err);
        }
      } else {
        const err = new HttpError("Invalid email address.", 400);
        return next(err);
      }
    } catch (error) {
      const err = new HttpError(error.message, 500);
      return next(err);
    }
  } catch (error) {
    const err = new HttpError(error.message, 500);
    return next(err);
  }
};

const userLogin = async (req, res, next) => {
  try {
    const validatelogin = Joi.object({
      email: Joi.string().email().valid().required(),
      password: Joi.string().required(),
    });
    const result = await validatelogin.validateAsync(req.body);
    console.log("result :>> ", result);
    try {
      const getUser = await User.findOne({
        email: result.email,
        role: ROLE.USER,
      }).lean();
      if (getUser) {
        if (!getUser.isEmailVerified) {
          const err = new HttpError("Please verified email address.", 400);
          return next(err);
        }
        if (getUser.isBlocked) {
          const err = new HttpError(
            "Your account looks like blocked. Please contact administrator.",
            400
          );
          return next(err);
        }
        if (!getUser.isOTPVerified) {
          const err = new HttpError("Your OTP verification is remain.", 400);
          return next(err);
        }
        const passwordMatch = await bcrypt.compare(
          result.password,
          getUser.password
        );
        if (passwordMatch) {
          const payload = {
            userId: getUser._id,
            email: getUser.email,
            role: getUser.role,
            time: new Date(),
          };
          const token = common.jwtEncode(payload);
          if (token && token.err) {
            const err = new HttpError(token.err, 500);
            return next(err);
          }
          return res.status(200).json({
            success: true,
            data: token,
            message: "LoggedIn Successfully.",
          });
        } else {
          const err = new HttpError("Invalid Password.", 400);
          return next(err);
        }
      } else {
        const err = new HttpError("Invalid email address.", 400);
        return next(err);
      }
    } catch (error) {
      const err = new HttpError(error.message, 500);
      return next(err);
    }
  } catch (error) {
    const err = new HttpError(error.message, 500);
    return next(err);
  }
};

module.exports = { login: login, userLogin: userLogin };

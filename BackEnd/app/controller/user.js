const nodemailer = require("nodemailer");
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
Joi.objectId = require("joi-objectid")(Joi);
const User = require("../models/user");
const resMessage = require("../utils/resMessage");
const { ROLE } = require("../utils/constant");
const HttpError = require("../models/http-error");
const common = require("../utils/common");

const create = async (req, res, next) => {
  try {
    if (req.user && req.user.role === ROLE.ADMIN) {
      const validatelogin = Joi.object({
        fname: Joi.string().required(),
        lname: Joi.string().required(),
        email: Joi.string().email().valid().required(),
        mobile_no: Joi.string().optional(),
        gender: Joi.string().optional(),
      });
      const result = await validatelogin.validateAsync(req.body);
      try {
        const checkEmail = await User.findOne({
          $or: [
            {
              email: result.email,
            },
            {
              mobile_no: result.mobile_no,
            },
          ],
        }).lean();
        if (checkEmail) {
          const err = new HttpError(
            "Email Or Mobile Number Already exists",
            400
          );
          return next(err);
        }
        result.role = ROLE.USER;
        result.uniqueCode = common.generateString();
        result.OTP = common.generateOTP();
        const createUser = await User.create(result);
        if (createUser) {
          let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          });

          let mailDetails = {
            from: process.env.SMTP_USER,
            to: createUser.email,
            subject: "Email Vrtification.",
            text: "Verify your account.",
            html: `<h2>Hello ${
              createUser.fname + " " + createUser.lname
            }! </h2> Your OTP : ${
              createUser.OTP
            }</br> <h3> <a href="http://localhost:${
              process.env.PORT || 4000
            }/user/verify/${
              createUser.uniqueCode
            }" target="_blank">Click Here</a> link to verify your email address. </br>`,
          };

          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
              console.log("Error Occurs", err);
            } else {
              const error = new HttpError(err.message, 500);
              return next(error);
            }
          });

          return res.status(201).json({
            success: true,
            data: createUser,
            message: "User created successfully.",
          });
        } else {
          const err = new HttpError(
            "Something went wrong while creating user. Please try after sometimes",
            500
          );
          return next(err);
        }
      } catch (error) {
        const err = new HttpError(error.message, 500);
        return next(err);
      }
    } else {
      const err = new HttpError(
        resMessage.UNAUTHORIZE.message,
        resMessage.UNAUTHORIZE.status
      );
      return next(err);
    }
  } catch (error) {
    const err = new HttpError(error.message, 500);
    return next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { uniqueCode } = req.params;
    try {
      console.log("uniqueCode :>> ", uniqueCode);
      const verifyEmail = await User.findOne({ uniqueCode: uniqueCode }).lean();
      if (verifyEmail) {
        console.log("verifyEmail :>> ", verifyEmail);
        if (verifyEmail.isEmailVerified) {
          const err = new HttpError("Email Already verified", 400);
          return next(err);
        }
        await User.updateOne(
          { uniqueCode: uniqueCode },
          {
            $set: { isEmailVerified: true },
          }
        );
        return res.redirect("https://google.com");
      } else {
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

const verifyOTP = async (req, res, next) => {
  try {
    const { OTP } = req.params;
    try {
      console.log("OTP :>> ", OTP);
      const verifyOTP = await User.findOne({ OTP: OTP }).lean();
      console.log("verifyOTP :>> ", verifyOTP);
      if (verifyOTP) {
        if (verifyOTP.isOTPVerified) {
          const err = new HttpError("OTP already vrified", 400);
          return next(err);
        }
        console.log("verifyOTP :>> ", verifyOTP);
        await User.updateOne(
          { OTP: OTP },
          {
            $set: { isOTPVerified: true },
          }
        );
        return res.status(200).json({
          success: true,
          data: null,
          message: "OTP verified",
        });
      } else {
        const err = new HttpError("Invalid OTP", 400);
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

const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    try {
      const checkEmail = await User.findOne({ email: email }).lean();
      if (checkEmail) {
        let mailTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        const OTP = common.generateOTP();
        let mailDetails = {
          from: process.env.SMTP_USER,
          to: email,
          subject: "Email Vrtification.",
          text: "Verify your account.",
          html: `<h2>Your OTP Is : ${OTP}</h2>`,
        };

        mailTransporter.sendMail(mailDetails, function (err, data) {
          if (err) {
            console.log("Error Occurs", err);
            const error = new HttpError(err.message, 500);
            return next(error);
          } else {
            console.log("Mail Send Successfully.");
          }
        });

        await User.updateOne(
          { email: email },
          {
            $set: { OTP: OTP, isOTPVerified: false },
          }
        );
        return res.status(200).json({
          success: true,
          data: null,
          message: "OTP send successfully.Please check your email inbox.",
        });
      } else {
        const err = new HttpError(
          "Record(s) not found with provided email address.",
          400
        );
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

const updatePassword = async (req, res, next) => {
  try {
    const { OTP } = req.params;
    const { password } = req.body;
    try {
      console.log("OTP :>> ", OTP);
      const verifyOTP = await User.findOne({
        OTP: OTP,
        isOTPVerified: false,
      }).lean();

      if (verifyOTP) {
        if (verifyOTP.isOTPVerified) {
          const err = new HttpError("OTP already vrified", 400);
          return next(err);
        }
        console.log("verifyOTP :>> ", verifyOTP);
        await User.updateOne(
          { OTP: OTP },
          {
            $set: {
              password: await bcrypt.hash(password, 10),
              isPasswordSet: true,
              isOTPVerified: true,
            },
          }
        );
        return res.status(200).json({
          success: true,
          data: null,
          message: "Password Successfully Changed.",
        });
      } else {
        const err = new HttpError("Invalid OTP", 400);
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

const blockedUser = async (req, res, next) => {
  try {
    if (req.user && req.user.role === ROLE.ADMIN) {
      const { id } = req.params;
      try {
        const getUser = await User.findOne({
          _id: id,
        }).lean();

        if (getUser) {
          await User.updateOne(
            { _id: id },
            {
              $set: {
                isBlocked: true,
              },
            }
          );
          return res.status(200).json({
            success: true,
            data: null,
            message: "User's account successfully blocked.",
          });
        } else {
          const err = new HttpError("Invalid User Id", 400);
          return next(err);
        }
      } catch (error) {
        const err = new HttpError(error.message, 500);
        return next(err);
      }
    } else {
      const err = new HttpError(
        resMessage.UNAUTHORIZE.message,
        resMessage.UNAUTHORIZE.status
      );
      return next(err);
    }
  } catch (error) {
    const err = new HttpError(error.message, 500);
    return next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.user && req.user.role === ROLE.ADMIN) {
      const { id } = req.params;
      try {
        const getUser = await User.findOne({
          _id: id,
        }).lean();

        if (getUser) {
          await User.remove({ _id: id });
          return res.status(200).json({
            success: true,
            data: null,
            message: "User's account successfully deleted.",
          });
        } else {
          const err = new HttpError("Invalid User Id", 400);
          return next(err);
        }
      } catch (error) {
        const err = new HttpError(error.message, 500);
        return next(err);
      }
    } else {
      const err = new HttpError(
        resMessage.UNAUTHORIZE.message,
        resMessage.UNAUTHORIZE.status
      );
      return next(err);
    }
  } catch (error) {
    const err = new HttpError(error.message, 500);
    return next(err);
  }
};

const getAllUser = async (req, res, next) => {
  try {
    let query = {};
    if (req.user && req.user.role === ROLE.USER) {
      query = {
        role: req.user.role,
      };
    }
    const getAllUser = await User.find(query).lean();
    if (getAllUser && getAllUser.length > 0) {
      return res.status(200).json({
        success: true,
        data: getAllUser,
        message: "Record(s) found.",
      });
    } else {
      return res.status(200).json({
        success: true,
        data: getAllUser,
        message: "Record(s) not found.",
      });
    }
  } catch (error) {
    const err = new HttpError(error.message, 500);
    return next(err);
  }
};

module.exports = {
  create: create,
  verifyEmail: verifyEmail,
  verifyOTP: verifyOTP,
  resendOTP: resendOTP,
  updatePassword: updatePassword,
  getAllUser: getAllUser,
  blockedUser: blockedUser,
  deleteUser: deleteUser,
};

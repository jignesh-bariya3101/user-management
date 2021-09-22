const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { ROLE } = require("../utils/constant");

const User = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    mobile_no: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: false,
      enum: Object.values(ROLE),
    },
    hobbies: [],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    uniqueCode: {
      type: String,
      unique: true,
    },
    OTP: {
      type: String,
    },
    isOTPVerified: {
      type: Boolean,
      default: false,
    },
    isPasswordSet: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

User.index({ email: 1 });
User.plugin(mongoosePaginate);
User.plugin(aggregatePaginate);
module.exports = mongoose.model("User", User);

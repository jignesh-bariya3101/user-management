const User = require("../models/user");
const jwt = require("jsonwebtoken");

const jwtEncode = (payload) => {
  try {
    return jwt.sign(payload, process.env.TokenKey, { expiresIn: "48h" });
  } catch (err) {
    console.log("error :>> ", err);
    return { err: err.message };
  }
};

const jwtDecode = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, process.env.TokenKey);
    console.log("decodedToken :>> ", decodedToken);
    if (Date.now() <= decodedToken.exp * 1000) {
      req.userData = { userId: decodedToken.userId };

      const checkUser = await User.findOne({
        _id: decodedToken.userId,
      });
      if (checkUser) {
        req.user = decodedToken;
        next();
      } else {
        return res.status(403).json({
          success: false,
          data: null,
          message: "Authentication failed!",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Authentication failed! Token Expired. Please login again.",
      });
    }
  } catch (err) {
    console.log("err.message :>> ", err.message);
    return res.status(403).json({
      success: false,
      data: null,
      message: "Authentication failed!",
    });
  }
};

const generateString = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  console.log("result :>> ", result.trim());
  return result.trim();
};

const generateOTP = () => {
  const characters = "0123456789";
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  console.log("result :>> ", result.trim());
  return result.trim();
};

module.exports = {
  jwtEncode,
  jwtDecode,
  generateString: generateString,
  generateOTP: generateOTP,
};

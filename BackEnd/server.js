require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const passport = require("passport");
const app = express();
const HttpError = require("./app/models/http-error");
const initMongo = require("./app/config/mongo");
const { ROLE } = require("./app/utils/constant");
// Setup express server port from ENV, default: 4000
app.set("port", process.env.PORT || 4000);

// Enable only in development HTTP request logger middleware
if (process.env.env === "development") {
  global.call = app.use(
    morgan(function (tokens, req, res) {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
      ].join(" ");
    })
  );
  // global.call = app.use(morgan("dev"));
}
app.use(morgan("dev"));

const User = require("./app/models/user");
const bcrypt = require("bcryptjs");
//for Health check
app.get("/test", async (req, res) => {
  await User.create({
    fname: "Jignesh",
    lname: "Bariya",
    email: "jbariya123@gmail.com",
    password: await bcrypt.hash("Jignesh@123", 10),
    gender: "male",
    mobile_no: "9173868812",
    role: ROLE.ADMIN,
  });
  return res.status(200).send("OK");
});

// for parsing json
app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
// for parsing application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

/**
 * use cors
 */
app.use(cors());

/**
 * allow cors origin
 */
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,authorization"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

// Init all other stuff
app.use(passport.initialize());
app.use(compression());
app.use(helmet());

const routes = require("./app/route");
app.use(routes);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  return res.json({ message: error.message || "An unknown error occurred!" });
});

module.exports = app;

Promise.all([initMongo()])
  .then((values) => {
    app.listen(app.get("port"), () => {
      console.log(
        `Server listening in ${process.env.NODE_ENV} mode to the port ${app.get(
          "port"
        )} ${new Date()}`
      );
    });
    app.timeout = 320000;
  })
  .catch((error) => {
    console.log("config error >> ", error);
  });

app.timeout = 320000;

const mongoose = require("mongoose");

let DB_URL = process.env.DEV
  ? process.env.MONGO_URI
  : `mongodb://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB_NAME}`;

// const loadModels = require("../app/models").loadModels;

module.exports = () => {
  const connect = () => {
    return new Promise((resolve) => {
      mongoose.Promise = global.Promise;
      mongoose.connect(
        DB_URL,
        {
          keepAlive: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          //   useFindAndModify: false,
        },
        (err) => {
          let dbStatus = "";
          if (err) {
            dbStatus = `*    DB1 Error connecting to DB: ${err}\n****************************\n`;
          }
          dbStatus = `*    DB1 Connection: OK\n****************************\n`;
          if (process.env.NODE_ENV !== "test") {
            // Prints initialization
            console.log("*************DB***************");
            console.log("*    Starting Server");
            console.log(`*    Port: ${process.env.PORT || 3000}`);
            console.log(`*    NODE_ENV: ${process.env.NODE_ENV}`);
            console.log(`*    Database: MongoDB`);
            console.log(dbStatus);
            resolve(dbStatus);
          }
        }
      );
      //   mongoose.set("useCreateIndex", true);
      //   mongoose.set("useFindAndModify", false);
    });
  };

  connect();

  mongoose.connection.on("error", (err) => console.log("DB1 Error : ", err));
  mongoose.connection.on("disconnected", connect);
};

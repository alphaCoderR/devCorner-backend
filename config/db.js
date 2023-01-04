const mongoose = require("mongoose");
const config = require("config");
const dbUrl = config.get("offlineUrl");

const connectDb = async () => {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex:true
    });
    mongoose.set("useFindAndModify", false);
    mongoose.set("useNewUrlParser",true);
    console.log("MongoDb Connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDb;

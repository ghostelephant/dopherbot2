require("dotenv").config();
const dbName = process.env.DB_NAME || "rawrball_xd";
const connectionString = process.env.CLOUD_DB_STRING || `mongodb://localhost/${dbName}`;
const connectionOptions = {useNewUrlParser: true, useUnifiedTopology: true };

const dbConnect = [
  connectionString,
  connectionOptions
];

module.exports = {
  dbName,
  dbConnect 
};
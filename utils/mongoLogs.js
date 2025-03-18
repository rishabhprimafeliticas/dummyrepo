const mongoose = require("mongoose");

const redisLogSchema = new mongoose.Schema({
  header: String,
  url: String,
  body: String,
  message: String,
  // logs: { type: Array, default: null },
  insertedAt: { type: Date, default: Date.now },
});

const RedisLog = mongoose.model("RedisLog", redisLogSchema);

async function bulkInsertLogs(logs) {
  const logsParse = logs.map((log) => {
    const logObj = JSON.parse(log);
    return {
      header:
        typeof logObj.header === "object"
          ? JSON.stringify(logObj.header)
          : logObj.header,
      url:
        typeof logObj.url === "object"
          ? JSON.stringify(logObj.url)
          : logObj.url,
      body:
        typeof logObj.body === "object"
          ? JSON.stringify(logObj.body)
          : logObj.body,
      message:
        typeof logObj.message === "object"
          ? JSON.stringify(logObj.message)
          : logObj.message,
    };
  });

  await RedisLog.insertMany(logsParse);
  console.log(`Inserted logs into MongoDB.`);
}

module.exports = { bulkInsertLogs };

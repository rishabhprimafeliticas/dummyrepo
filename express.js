require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
var xss = require("xss-clean");
var cache = require("memory-cache");
const helmet = require("helmet");
const moment = require("moment");
const { request, gql } = require("graphql-request");
const axios = require("axios"); // Requests
const WINDOW_SIZE_IN_HOURS = 24;
const MAX_WINDOW_REQUEST_COUNT = 2000;
const WINDOW_LOG_INTERVAL_IN_HOURS = 1000;
// import asyncHandler from 'express-async-handler';
const asyncHandler = require("express-async-handler");
const interval = "* 12 * * *";
const cromb_job_etd = require("./scripts/crom-job");
const schedule = require("node-schedule");
const { connectRedis } = require("./config/redisConfig");
const morgan = require("morgan");
const customRedisRateLimiter = async (req, res, next) => {
  // const record = await redisClient.quit();
  try {
    // check that redis client exists
    // if (!redisClient) {
    //   throw new Error('Redis client does not exist!');
    //   process.exit(1);
    // }
    if (!cache) {
      throw new Error("Redis client does not exist!");
      process.exit(1);
    }
    // fetch records of current user using IP address, returns null when no record is found
    // var record = await redisClient.get(req.ip);
    var record = cache.get(req.ip);

    const currentRequestTime = moment();
    //  if no record is found , create a new record for user and store to redis
    if (record == null) {
      let newRecord = [];
      let requestLog = {
        requestTimeStamp: currentRequestTime.unix(),
        requestCount: 1,
      };
      newRecord.push(requestLog);
      // await redisClient.set(req.ip, JSON.stringify(newRecord));
      cache.put(req.ip, JSON.stringify(newRecord));
      // record = await redisClient.get(req.ip);
      record = await cache.get(req.ip);

      // next();
    }

    let data = JSON.parse(record);
    let windowStartTimestamp = moment()
      .subtract(WINDOW_SIZE_IN_HOURS, "hours")
      .unix();

    let requestsWithinWindow = data.filter((entry) => {
      return entry.requestTimeStamp > windowStartTimestamp;
    });
    // console.log('requestsWithinWindow', requestsWithinWindow);
    let totalWindowRequestsCount = requestsWithinWindow.reduce(
      (accumulator, entry) => {
        return accumulator + entry.requestCount;
      },
      0
    );
    // if number of requests made is greater than or equal to the desired maximum, return error
    if (totalWindowRequestsCount > MAX_WINDOW_REQUEST_COUNT) {
      return res.status(429).jsonp({
        status: false,
        message: `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_HOURS} hrs limit!`,
      });
    } else {
      // if number of requests made is less than allowed maximum, log new entry
      let lastRequestLog = data[data.length - 1];
      let potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime
        .subtract(WINDOW_LOG_INTERVAL_IN_HOURS, "hours")
        .unix();
      //  if interval has not passed since last request log, increment counter
      if (
        lastRequestLog.requestTimeStamp >
        potentialCurrentWindowIntervalStartTimeStamp
      ) {
        lastRequestLog.requestCount++;
        data[data.length - 1] = lastRequestLog;
      } else {
        //  if interval has passed, log new entry for current user and timestamp
        data.push({
          requestTimeStamp: currentRequestTime.unix(),
          requestCount: 1,
        });
      }
      // console.log(req.ip, JSON.stringify(data))
      // await redisClient.set(req.ip, JSON.stringify(data));
      cache.put(req.ip, JSON.stringify(data));

      next();
    }
  } catch (error) {
    if (error) {
      next(error);
    }
  }
};

const app = express();

async function connectRedisFunction() {
  // Connect to Redis
  await connectRedis();
}

connectRedisFunction();

app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));

// Log requests to the console.
app.use(morgan("dev"));

app.use(
  cors({
    // origin: ["https://dev.wearaware.co"],
  })
);

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send(`Server is up and running on port: ${process.env.PORT}!`);
});

// app.use(customRedisRateLimiter);
app.use("/auth", require("./api/auth"));
app.use("/kyc", require("./api/kyc"));
app.use("/aware-token", require("./api/aware-token"));
app.use("/send-aware-token", require("./api/send-token"));
app.use("/admin-common", require("./api/admin-common"));
app.use("/final-brand", require("./api/final-brand"));
app.use("/update-aware-token", require("./api/update-aware-token"));
app.use("/scripts", require("./api/scripts"));

schedule.scheduleJob(interval, asyncHandler(cromb_job_etd.ETDNotificationSync));

// app.listen(process.env.PORT, async () => {
//   console.log(`Example app listening at http://localhost:${process.env.PORT}`);
// });

// app.listen(process.env.PORT, '0.0.0.0', () => {
//   console.log(`Example app listening at http://localhost:${process.env.PORT}`);
// });

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});

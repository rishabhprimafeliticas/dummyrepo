const { getClient } = require("../config/redisConfig");

async function storeReqMiddleware(req, res, next) {
  try {
    const redisClient = getClient();

    const reqData = {
      method: req.method,
      url: "",
      headers: "",
      body: "",
      params: req.params,
      query: req.query,
    };

    const existingReq = await redisClient.get("req");
    if (!existingReq) {
      await redisClient.set("req", JSON.stringify(reqData), { NX: true });
    }

    next();
  } catch (error) {
    next(error);
  }
}

async function redisQueueMiddleware(req, res, next) {
  try {
    const redisClient = getClient();

    const userId = req.headers.userId || req.headers.userid;
    if (!userId) {
      return next(new Error("Missing userId in request headers."));
    }

    const newData = req.body.data;
    console.log("New data:", newData);
    if (!newData || !Array.isArray(newData)) {
      return next(new Error("req.body.data must be an array of objects."));
    }

    const key = `user:${userId}`;

    const queueStrArr = await redisClient.lRange(key, 0, -1);
    let queue = [];
    const existingIds = new Set();

    for (const itemStr of queueStrArr) {
      try {
        const item = JSON.parse(itemStr);
        queue.push(item);
        if (item.body && item.body._id) {
          existingIds.add(item.body._id);
        }
      } catch (err) {
        console.error(`Error parsing Redis value for userId ${userId}:`, err);
      }
    }

    for (const newItem of newData) {
      if (!newItem._id) {
        console.warn("New item is missing _id:", newItem);
        continue;
      }
      if (!existingIds.has(newItem._id)) {
        const itemToStore = {
          url: req.url,
          headers: req.headers,
          body: newItem,
        };
        const serialized = JSON.stringify(itemToStore);
        await redisClient.rPush(key, serialized);
        existingIds.add(newItem._id);
        queue.push(itemToStore);
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { redisQueueMiddleware, storeReqMiddleware };

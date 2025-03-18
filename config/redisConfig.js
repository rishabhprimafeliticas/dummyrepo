const { createClient } = require("redis");

let client = null;

async function connectRedis() {
  const redisHost = process.env.REDIS_HOST || "127.0.0.1";
  const redisPort = process.env.REDIS_PORT || 6379;
  const redisPassword = process.env.REDIS_PASSWORD || "";

  client = createClient({
    socket: {
      host: redisHost,
      port: redisPort,
    },
    password: redisPassword,
  });

  try {
    await client.connect();
    console.log("Redis client connected");
  } catch (err) {
    console.error("Redis connection error:", err);
    process.exit(1);
  }
  return client;
}

function getClient() {
  if (!client) {
    throw new Error("Redis client not initialized");
  }
  return client;
}



module.exports = { connectRedis, getClient };

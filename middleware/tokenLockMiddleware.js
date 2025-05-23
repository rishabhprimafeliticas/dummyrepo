const { default: mongoose } = require("mongoose");
const { getClient } = require("../config/redisConfig");
const account_details = require("../models/account_details");
const aw_tokens = require("../models/aw_tokens");
const send_aw_tokens = require("../models/send_aw_tokens");
const update_aw_tokens = require("../models/update_aw_tokens");

const ensureSendTokenEditableAndLock = async (req, res, next) => {
  try {
    // Extract the token ID and user ID from the request
    const tokenId =
      req.body.send_aware_token_id || req.headers.send_aware_token_id;
    const userId = req.headers.userid;

    console.log("---------------------------------------------------------");
    console.log("Token ID:", tokenId);
    console.log("User ID:", userId);
    console.log("Request Headers:", req.url);
    console.log("---------------------------------------------------------");

    // If no token ID or user ID is provided, skip the lock check
    if (!tokenId || !userId) {
      return next();
    }

    const redisClient = getClient();
    const lockKey = `send_token_lock:${tokenId}`;

    // Get the key from Redis
    const lockedBy = await redisClient.get(lockKey);

    // If the token is locked by another user
    if (lockedBy && lockedBy !== userId) {
      return res.status(401).json({
        status: false,
        message: `This token is currently being edited by another user. Please try again later.`,
      });
    }

    // If the token is not locked or locked by the current user, set/renew the lock
    await redisClient.set(lockKey, userId, { EX: 300 }); // Lock expires after 5 minutes

    // Add a cleanup function to the response object to release the lock when done
    if (req.url === "/v2/post_recap" && req.method === "POST") {
      res.on("finish", async () => {
        // Only release the lock if it belongs to this user
        const currentLock = await redisClient.get(lockKey);
        if (currentLock === userId) {
          await redisClient.del(lockKey);
        }
      });
    }

    next();
  } catch (error) {
    console.error("Token lock middleware error:", error);
    next();
  }
};

const ensureSendTokenAccessibleAndHandleDeleteLock = async (req, res, next) => {
  try {
    // Extract the token ID and user ID from the request
    const tokenId =
      req.body.send_aware_token_id || req.headers.send_aware_token_id;
    const userId = req.headers.userid;

    console.log("---------------------------------------------------------");
    console.log("Token ID:", tokenId);
    console.log("User ID:", userId);
    console.log("Request Headers:", req.url);
    console.log("---------------------------------------------------------");

    // If no token ID or user ID is provided, skip the lock check
    if (!tokenId || !userId) {
      return next();
    }

    const redisClient = getClient();
    const lockKey = `send_token_lock:${tokenId}`;

    // Get the key from Redis
    const lockedBy = await redisClient.get(lockKey);

    // If the token is locked by another user
    if (lockedBy && lockedBy !== userId) {
      return res.status(401).json({
        status: false,
        message: `This token is currently being edited by another user. Please try again later.`,
      });
    }

    // Cleanup function to delete the key from Redis
    if (req.url === "/v2/delete_send_aware_token" && req.method === "POST") {
      if (lockedBy && lockedBy === userId) {
        await redisClient.del(lockKey);
      }
    }

    next();
  } catch (error) {
    console.error("Token lock middleware error:", error);
    next();
  }
};

const ensureSendTokenExists = async (req, res, next) => {
  try {
    // Extract the token ID and user ID from the request
    const tokenId =
      req.body.send_aware_token_id || req.headers.send_aware_token_id;
    const userId = req.headers.userid;

    console.log("---------------------------------------------------------");
    console.log("Token ID:", tokenId);
    console.log("User ID:", userId);
    console.log("Request Headers:", req.url);
    console.log("---------------------------------------------------------");

    // If no token ID or user ID is provided, skip the lock check
    if (!tokenId || !userId) {
      return next();
    }

    const user = await account_details.findOne({
      _id: mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: `User not found.`,
      });
    }

    if (user && (user.role_id == 1 || user.role_id == 10)) {
      return next();
    }

    const sendToken = await send_aw_tokens.findOne({
      _id: tokenId,
    });

    if (!sendToken) {
      return res.status(401).json({
        status: false,
        message: `Token not found.`,
      });
    }

    if (sendToken && sendToken.status.toLowerCase() === "send") {
      return res.status(401).json({
        status: false,
        message: `Token already sent.`,
      });
    }

    next();
  } catch (error) {
    console.error("Token lock middleware error:", error);
    next();
  }
};

const ensureCreateTokenEditableAndLock = async (req, res, next) => {
  try {
    // Extract the token ID and user ID from the request
    const tokenId = req.body.aware_token_id || req.headers.aware_token_id;
    const userId = req.headers.userid;

    console.log("---------------------------------------------------------");
    console.log("Token ID:", tokenId);
    console.log("User ID:", userId);
    console.log("Request Headers:", req.url);
    console.log("---------------------------------------------------------");

    // If no token ID or user ID is provided, skip the lock check
    if (!tokenId || !userId) {
      return next();
    }

    const redisClient = getClient();
    const lockKey = `create_token_lock:${tokenId}`;

    // Get the key from Redis
    const lockedBy = await redisClient.get(lockKey);

    // If the token is locked by another user
    if (lockedBy && lockedBy !== userId) {
      return res.status(401).json({
        status: false,
        message: `This token is currently being edited by another user. Please try again later.`,
      });
    }

    // If the token is not locked or locked by the current user, set/renew the lock
    await redisClient.set(lockKey, userId, { EX: 300 }); // Lock expires after 5 minutes

    // Add a cleanup function to the response object to release the lock when done
    if (req.url === "/v2/post_digital_twin" && req.method === "POST") {
      res.on("finish", async () => {
        // Only release the lock if it belongs to this user
        const currentLock = await redisClient.get(lockKey);
        if (currentLock === userId) {
          await redisClient.del(lockKey);
        }
      });
    }

    next();
  } catch (error) {
    console.error("Token lock middleware error:", error);
    next();
  }
};

const ensureCreateTokenAccessibleAndHandleDeleteLock = async (
  req,
  res,
  next
) => {
  try {
    // Extract the token ID and user ID from the request
    const tokenId = req.body.aware_token_id || req.headers.aware_token_id;
    const userId = req.headers.userid;

    console.log("---------------------------------------------------------");
    console.log("Token ID:", tokenId);
    console.log("User ID:", userId);
    console.log("Request Headers:", req.url);
    console.log("---------------------------------------------------------");

    // If no token ID or user ID is provided, skip the lock check
    if (!tokenId || !userId) {
      return next();
    }

    const redisClient = getClient();
    const lockKey = `create_token_lock:${tokenId}`;

    // Get the key from Redis
    const lockedBy = await redisClient.get(lockKey);

    // If the token is locked by another user
    if (lockedBy && lockedBy !== userId) {
      return res.status(401).json({
        status: false,
        message: `This token is currently being edited by another user. Please try again later.`,
      });
    }

    // Cleanup function to delete the key from Redis
    if (req.url === "/v2/delete_aware_token" && req.method === "POST") {
      if (lockedBy && lockedBy === userId) {
        await redisClient.del(lockKey);
      }
    }

    next();
  } catch (error) {
    console.error("Token lock middleware error:", error);
    next();
  }
};

const ensureCreateTokenExists = async (req, res, next) => {
  try {
    // Extract the token ID and user ID from the request
    const tokenId = req.body.aware_token_id || req.headers.aware_token_id;
    const userId = req.headers.userid;

    console.log("---------------------------------------------------------");
    console.log("Token ID:", tokenId);
    console.log("User ID:", userId);
    console.log("Request Headers:", req.url);
    console.log("---------------------------------------------------------");

    // If no token ID or user ID is provided, skip the lock check
    if (!tokenId || !userId) {
      return next();
    }

    const user = await account_details.findOne({
      _id: mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: `User not found.`,
      });
    }

    if (user && (user.role_id == 1 || user.role_id == 10)) {
      return next();
    }

    const createToken = await aw_tokens.findOne({
      _id: tokenId,
    });

    if (!createToken) {
      return res.status(401).json({
        status: false,
        message: `Token not found.`,
      });
    }

    next();
  } catch (error) {
    console.error("Token lock middleware error:", error);
    next();
  }
};

const ensureUpdateTokenEditableAndLock = async (req, res, next) => {
  try {
    // Extract the token ID and user ID from the request
    const tokenId =
      req.body.update_aware_token_id || req.headers.update_aware_token_id;
    const userId = req.headers.userid;

    console.log("---------------------------------------------------------");
    console.log("Token ID:", tokenId);
    console.log("User ID:", userId);
    console.log("Request Headers:", req.url);
    console.log("---------------------------------------------------------");

    // If no token ID or user ID is provided, skip the lock check
    if (!tokenId || !userId) {
      return next();
    }

    const redisClient = getClient();
    const lockKey = `update_token_lock:${tokenId}`;

    // Get the key from Redis
    const lockedBy = await redisClient.get(lockKey);

    // If the token is locked by another user
    if (lockedBy && lockedBy !== userId) {
      return res.status(401).json({
        status: false,
        message: `This token is currently being edited by another user. Please try again later.`,
      });
    }

    // If the token is not locked or locked by the current user, set/renew the lock
    await redisClient.set(lockKey, userId, { EX: 300 }); // Lock expires after 5 minutes

    // Add a cleanup function to the response object to release the lock when done
    if (req.url === "/v2/post_updated_digital_twin" && req.method === "POST") {
      res.on("finish", async () => {
        // Only release the lock if it belongs to this user
        const currentLock = await redisClient.get(lockKey);
        if (currentLock === userId) {
          await redisClient.del(lockKey);
        }
      });
    }

    next();
  } catch (error) {
    console.error("Token lock middleware error:", error);
    next();
  }
};

const ensureUpdateTokenAccessibleAndHandleDeleteLock = async (
  req,
  res,
  next
) => {
  try {
    // Extract the token ID and user ID from the request
    const tokenId =
      req.body.update_aware_token_id || req.headers.update_aware_token_id;
    const userId = req.headers.userid;

    console.log("---------------------------------------------------------");
    console.log("Token ID:", tokenId);
    console.log("User ID:", userId);
    console.log("Request Headers:", req.url);
    console.log("---------------------------------------------------------");

    // If no token ID or user ID is provided, skip the lock check
    if (!tokenId || !userId) {
      return next();
    }

    const redisClient = getClient();
    const lockKey = `update_token_lock:${tokenId}`;

    // Get the key from Redis
    const lockedBy = await redisClient.get(lockKey);

    // If the token is locked by another user
    if (lockedBy && lockedBy !== userId) {
      return res.status(401).json({
        status: false,
        message: `This token is currently being edited by another user. Please try again later.`,
      });
    }

    // Cleanup function to delete the key from Redis
    if (req.url === "/v2/delete_update_aware_token" && req.method === "POST") {
      if (lockedBy && lockedBy === userId) {
        await redisClient.del(lockKey);
      }
    }

    next();
  } catch (error) {
    console.error("Token lock middleware error:", error);
    next();
  }
};

const ensureUpdateTokenExists = async (req, res, next) => {
  try {
    // Extract the token ID and user ID from the request
    const tokenId =
      req.body.update_aware_token_id || req.headers.update_aware_token_id;
    const userId = req.headers.userid;

    console.log("---------------------------------------------------------");
    console.log("Token ID:", tokenId);
    console.log("User ID:", userId);
    console.log("Request Headers:", req.url);
    console.log("---------------------------------------------------------");

    // If no token ID or user ID is provided, skip the lock check
    if (!tokenId || !userId) {
      return next();
    }

    const user = await account_details.findOne({
      _id: mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: `User not found.`,
      });
    }

    if (user && (user.role_id == 1 || user.role_id == 10)) {
      return next();
    }

    const createToken = await update_aw_tokens.findOne({
      _id: tokenId,
    });

    if (!createToken) {
      return res.status(401).json({
        status: false,
        message: `Token not found.`,
      });
    }

    next();
  } catch (error) {
    console.error("Token lock middleware error:", error);
    next();
  }
};

const ensurePoAccessibleWithLock = async (req, res, next) => {
  try {
    // Extract the PO ID and user ID from the request
    const poId = req.body.po_id;
    const userId = req.headers.userid;

    console.log("---------------------------------------------------------");
    console.log("PO ID:", poId);
    console.log("User ID:", userId);
    console.log("Request Headers:", req.url);
    console.log("---------------------------------------------------------");

    // If no PO ID or user ID is provided, deny access
    if (!poId || !userId) {
      return res.status(401).json({
        status: false,
        message: "Purchase order ID or user ID missing",
      });
    }

    const redisClient = getClient();
    const lockKey = `po_id_lock:${poId}`;

    // Get the key from Redis
    const lockedBy = await redisClient.get(lockKey);

    // If the PO is not locked by this user, deny access
    if (lockedBy && lockedBy !== userId) {
      return res.status(401).json({
        status: false,
        message: "You do not have an active lock on this purchase order",
      });
    }

    // If the PO is not locked or locked by the current user, set/renew the lock
    await redisClient.set(lockKey, userId, { EX: 300 }); // Lock expires after 5 minutes

    if (
      req.url === "/v2/send_pos_to_admin_for_approval" &&
      req.method === "POST"
    ) {
      res.on("finish", async () => {
        // Only release the lock if it belongs to this user
        const currentLock = await redisClient.get(lockKey);
        if (currentLock === userId) {
          await redisClient.del(lockKey);
        }
      });
    }

    // User has a valid lock, allow the request to proceed
    next();
  } catch (error) {
    console.error("PO lock middleware error:", error);
    return res.status(500).json({
      status: false,
      message: "Error checking purchase order lock status",
    });
  }
};

// Export the middleware
module.exports = {
  ensureSendTokenEditableAndLock,
  ensureSendTokenAccessibleAndHandleDeleteLock,
  ensureSendTokenExists,
  ensureCreateTokenEditableAndLock,
  ensureCreateTokenAccessibleAndHandleDeleteLock,
  ensureCreateTokenExists,
  ensureUpdateTokenEditableAndLock,
  ensureUpdateTokenAccessibleAndHandleDeleteLock,
  ensureUpdateTokenExists,
  ensurePoAccessibleWithLock,
};

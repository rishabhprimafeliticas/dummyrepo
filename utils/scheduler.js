const { getClient } = require("../config/redisConfig");
const web3_handler = require("../Iotex/web3");
const { bulkInsertLogs } = require("./mongoLogs");
const loggerhandler = require("../logger/log");
var mongoose = require("mongoose");
var kyc_details = require("../models/kyc_details");
const product_lines = require("../models/product_lines");
const draft_info = require("../models/draft_info");
const aw_tokens = require("../models/aw_tokens");
const physical_assets = require("../models/physical_asset");
const update_physical_asset = require("../models/update_physical_asset");
const update_aw_tokens = require("../models/update_aw_tokens");
var callstack = require("../scripts/call-stack");
const purchase_orders = require("../models/purchase_orders");
const notifications = require("../models/notifications");

let schedulerRunning = false;

async function startScheduler() {
  // If the scheduler is already running, exit early
  if (schedulerRunning) {
    console.log("Scheduler is already running in startScheduler function");
    return;
  }
  schedulerRunning = true;
  console.log("Inside Scheduler function");

  try {
    // Initialize Redis client connection
    const redisClient = getClient();
    // Set to track keys that have been processed in the current cycle
    let processedKeys = new Set();

    // Scheduler loop: runs continuously until there are no active keys to process
    while (true) {
      // Retrieve all keys that start with "user" (excluding keys for logs)
      let userKeys = await redisClient.keys("user*");
      userKeys = userKeys.filter((key) => !key.startsWith("logs:"));
      console.log("User keys:", userKeys);

      // Retrieve the request key-value pair from Redis and parse it
      let reqKeyValue = await redisClient.get("req");
      reqKeyValue = reqKeyValue ? JSON.parse(reqKeyValue) : {};
      console.log("Request key-value pair:", reqKeyValue);

      // Create a list of active keys (user lists that are not empty)
      const activeKeys = [];
      for (const key of userKeys) {
        const len = await redisClient.lLen(key);
        if (len > 0) {
          activeKeys.push({ key, len });
        }
      }
      // If there are no active keys to process, stop the scheduler
      if (activeKeys.length === 0) {
        console.log("All user lists are empty. Scheduler stopping.");
        break;
      }

      // Determine the maximum list length among active keys
      const maxLen = Math.max(...activeKeys.map((item) => item.len));
      // Filter keys that have the maximum length
      const candidates = activeKeys.filter((item) => item.len === maxLen);
      let selectedKey;

      // If there's a single candidate, select it directly
      if (candidates.length === 1) {
        selectedKey = candidates[0].key;
      } else {
        // Otherwise, select from candidates that haven't been processed yet in this cycle
        let candidateKeys = activeKeys
          .map((item) => item.key)
          .filter((key) => !processedKeys.has(key));
        // If all candidates have been processed, reset the set to allow re-selection
        if (candidateKeys.length === 0) {
          processedKeys = new Set();
          candidateKeys = activeKeys.map((item) => item.key);
        }
        // Select a random candidate key and mark it as processed
        const randomIndex = Math.floor(Math.random() * candidateKeys.length);
        selectedKey = candidateKeys[randomIndex];
        processedKeys.add(selectedKey);
      }

      // Retrieve the first item in the list from the selected key
      const itemStr = await redisClient.lIndex(selectedKey, 0);
      // Skip if the item does not exist
      if (!itemStr) continue;

      // Parsing the retrieved item from JSON string
      let item;
      try {
        item = JSON.parse(itemStr);
      } catch (err) {
        console.error(`Error parsing item for key ${selectedKey}:`, err);
        try {
          // Remove invalid items so they are not processed repeatedly
          await redisClient.lPop(selectedKey);
          console.log(`Removed invalid item from ${selectedKey}`);
        } catch (popErr) {
          console.error(
            `Error removing invalid item from ${selectedKey}:`,
            popErr
          );
        }
        continue;
      }

      // Construct the request object by merging global request key-values with item specific data
      const req = {
        ...reqKeyValue,
        url: item.url,
        headers: item.headers,
        body: item.body,
      };

      // Log which URL is being processed for the given request
      console.log(`Processing request for URL: ${req.url}`);

      let controllerResponse;
      try {
        // Process the request based on the URL
        if (req.url === "/v2/transfer-token") {
          controllerResponse =
            await updateTokenStatusAndTransferAwareTokenBackground(req);
        } else if (req.url === "/v2/update-transfer-token") {
          controllerResponse =
            await updateTokenStatusAndTransferUpdateAwareTokenBackground(req);
        } else {
          console.error(
            `Invalid URL in request for key ${selectedKey}: ${req.url}`
          );
          await redisClient.lPop(selectedKey);
          continue;
        }
      } catch (err) {
        console.error(`Error processing request for ${selectedKey}:`, err);
        controllerResponse = { success: false, message: err.toString() };
      }

      console.log(
        "-----------------------------------------------------------------------------------------------------------------------------------"
      );
      console.log("Controller Response", controllerResponse);
      console.log(
        "-----------------------------------------------------------------------------------------------------------------------------------"
      );

      // Log the result of the process
      console.log(
        `👉 Process result: ${
          controllerResponse.success ? "Success 🚀🚀🚀🚀" : "Failed 😭😭😭😭"
        }`
      );

      // Always remove the processed item from Redis, regardless of success
      try {
        await redisClient.lPop(selectedKey);
        console.log(`Removed item from list for key ${selectedKey}`);
      } catch (err) {
        console.error(`Error removing item from ${selectedKey}:`, err);
      }

      // If the process was successful, log success; otherwise, log the error to a separate logs list
      if (controllerResponse.success) {
        console.log(`Successfully processed item for key ${selectedKey}`);
      } else {
        try {
          // Create a log entry detailing the failure
          const logKey = "logs";
          const logKeyValue = JSON.stringify({
            header: req.headers,
            url: req.url,
            body: req.body,
            message: controllerResponse.message,
          });
          // Push the log into the Redis logs list
          await redisClient.rPush(logKey, logKeyValue);

          // If the log list reached a certain threshold, perform bulk insertion into MongoDB and clear the logs
          const logCount = await redisClient.lLen(logKey);
          if (logCount >= 1) {
            // Adjust condition as needed
            const logsArray = await redisClient.lRange(logKey, 0, -1);
            await bulkInsertLogs(logsArray);
            await redisClient.del(logKey);
            console.log(`Bulk inserted logs and cleared log list.`);
          }
        } catch (err) {
          console.error("Error logging failed item:", err);
        }
      }
      // Brief pause before processing the next item
      await sleep(100);
    }
  } catch (err) {
    console.error("Scheduler encountered an error:", err);
  } finally {
    // Reset the running flag when the scheduler stops or errors out
    schedulerRunning = false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateTokenStatusAndTransferAwareTokenBackground(req) {
  try {
    console.log("Inside background", req);
    const { _id, token_status, aware_id, message } = req.body;
    const { userid } = req.headers;

    const reviewedBy = userid ? userid : null;
    const reviewedOn = new Date();

    // Fetch token details and associated asset concurrently
    const [aw_token_avaliable, assets_avaliable] = await Promise.all([
      aw_tokens
        .findOne({ _id: mongoose.Types.ObjectId(_id) })
        .select(["_id", "_awareid"])
        .catch((ex) => {
          loggerhandler.logger.error(`Error finding aw_token: ${ex}`);
          throw new Error("Failed to fetch token details.");
        }),
      physical_assets
        .findOne({ _awareid: aware_id, aware_token_id: _id.toString() })
        .catch((ex) => {
          loggerhandler.logger.error(`Error finding asset: ${ex}`);
          throw new Error("Failed to fetch asset details.");
        }),
    ]);

    if (!aw_token_avaliable || !assets_avaliable) {
      loggerhandler.logger.error("Token or asset not found.");
      throw new Error("Token or asset not found.");
    }

    // Handle token approval or rejection
    if (token_status === "approved") {
      // Convert callback-based function to Promise-based
      const createTokenResult = await new Promise((resolve, reject) => {
        web3_handler.createAwareTokenAsync(_id, async function (response) {
          if (response.status == false) {
            loggerhandler.logger.error("Token creation failed.");
            reject(new Error(response.message));
            return;
          }

          try {
            await aw_tokens.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(_id) },
              {
                reviewedBy: reviewedBy,
                reviewedOn: reviewedOn,
              }
            );

            // Notify user for approval
            await notifications.create({
              notification_sent_to: assets_avaliable._awareid,
              message: `Your ${assets_avaliable.weight} tokens are approved by your manager. You can send them now.`,
            });

            const kyc_details_avaliable = await kyc_details
              .findOne({ aware_id: assets_avaliable._awareid })
              .select(["_id", "company_name", "manager_id"]);

            await notifications.create({
              notification_sent_to: kyc_details_avaliable?.manager_id || "",
              message: `Asset ID - ${assets_avaliable.aware_asset_id} has been successfully approved and added to the user's wallet.`,
            });

            resolve({
              success: true,
              message: "Token creation successful.",
            });
          } catch (error) {
            reject(error);
          }
        });
      });

      return createTokenResult;
    } else {
      // Reject token and update status
      await aw_tokens.findOneAndUpdate(
        { _awareid: aware_id, _id: mongoose.Types.ObjectId(_id) },
        {
          status: "Rejected",
          message,
          reviewedBy: reviewedBy,
          reviewedOn: reviewedOn,
        },
        { new: true }
      );

      // Notify user for rejection
      await notifications.create({
        notification_sent_to: assets_avaliable._awareid,
        message: `Your ${assets_avaliable.weight} tokens are rejected. Please make corrections and resend the request.`,
      });

      const kyc_details_avaliable = await kyc_details
        .findOne({ aware_id: assets_avaliable._awareid })
        .select(["_id", "company_name", "manager_id"]);

      await notifications.create({
        notification_sent_to: kyc_details_avaliable?.manager_id || "",
        message: `Asset ID - ${assets_avaliable.aware_asset_id} approval request has been declined. Please contact administrator.`,
      });

      return { success: false, message: "Token was rejected." };
    }
  } catch (ex) {
    loggerhandler.logger.error(
      `Unhandled error in background processing: ${ex}`
    );
    return { success: false, message: ex.toString() };
  }
}

async function updateTokenStatusAndTransferUpdateAwareTokenBackground(req) {
  try {
    // Fetch token details and associated asset concurrently
    console.log("Inside Update Background", req.body);
    const { _id, token_status, aware_id, message } = req.body;
    const { userid } = req.headers;

    const reviewedBy = userid ? userid : null;
    const reviewedOn = new Date();

    const [update_aw_token_avaliable, assets_avaliable] = await Promise.all([
      update_aw_tokens
        .findOne({ _id: mongoose.Types.ObjectId(_id) })
        .select(["_id", "_awareid"])
        .catch((ex) => {
          throw new Error("Failed to fetch token details.");
        }),
      update_physical_asset
        .findOne({
          _awareid: aware_id,
          update_aware_token_id: _id.toString(),
        })
        .catch((ex) => {
          throw new Error("Failed to fetch token details.");
        }),
    ]);

    if (!update_aw_token_avaliable || !assets_avaliable) {
      loggerhandler.logger.error("Token or asset not found.");
      throw new Error("Token or asset not found.");
    }

    if (token_status == "approved") {
      // Find product lines
      var temp_product_lines_avaliable = await product_lines
        .findOne({
          "product_line.update_aware_token_id": _id,
          deleted: false,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          throw new Error("Failed to fetch product lines.");
        });

      console.log("Get inside web3!");

      // Convert callback-based function to Promise-based
      const updateTokenResult = await new Promise((resolve, reject) => {
        web3_handler.updateAwareTokenAsync(_id, async function (response) {
          if (response.status == false) {
            loggerhandler.logger.error("Token update failed.");
            reject(new Error(response.message));

            console.log("RISHAB");
            return;
          }

          try {
            let product_line = temp_product_lines_avaliable?.product_line;

            if (temp_product_lines_avaliable) {
              let elementIndex = product_line.findIndex(
                (obj) => obj.update_aware_token_id == req.body._id
              );
              product_line[elementIndex].update_status = "APPROVED";
              await product_lines
                .findOneAndUpdate(
                  {
                    po_id: temp_product_lines_avaliable?.po_id,
                    deleted: false,
                  },
                  { product_line: product_line },
                  { new: true }
                )
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  throw ex;
                });
            }

            let send_status_checker = product_line?.find((ele) => {
              return ele.update_status == "SEND";
            });

            if (!send_status_checker) {
              await purchase_orders
                .findOneAndUpdate(
                  {
                    _id: mongoose.Types.ObjectId(
                      temp_product_lines_avaliable?.po_id
                    ),
                    deleted: false,
                  },
                  { locked: false }
                )
                .catch((ex) => {
                  loggerhandler.logger.error(
                    `${ex} ,email:${req.headers.email}`
                  );
                  throw ex;
                });
            }

            await update_aw_tokens.findOneAndUpdate(
              { _id: mongoose.Types.ObjectId(_id), _awareid: aware_id },
              {
                reviewedBy,
                reviewedOn,
              }
            );

            await notifications.create({
              notification_sent_to: aware_id,
              message: `Your ${assets_avaliable.weight} tokens are approved by your manager. You can send them now.`,
            });

            const kyc_details_avaliable = await kyc_details
              .findOne({ aware_id: assets_avaliable._awareid })
              .select(["_id", "company_name", "manager_id"]);

            await notifications.create({
              notification_sent_to: kyc_details_avaliable?.manager_id || "",
              message: `Asset ID - ${assets_avaliable.updated_aware_asset_id} has been successfully approved and added to the user's wallet.`,
            });

            resolve({
              success: true,
              message: "Token update successful.",
            });
          } catch (error) {
            reject(error);
          }
        });
      });

      return updateTokenResult;
    } else {
      // Get physical assets and product lines
      var update_physical_assets_found = await update_physical_asset
        .findOne({ update_aware_token_id: _id })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          throw new Error("Failed to fetch physical assets.");
        });

      var temp_product_lines_avaliable = await product_lines
        .findOne({
          "product_line.update_aware_token_id": _id,
          deleted: false,
        })
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          throw new Error("Failed to fetch product lines.");
        });

      // Update product line status
      if (temp_product_lines_avaliable) {
        let product_line = temp_product_lines_avaliable.product_line;
        let elementIndex = product_line.findIndex(
          (obj) => obj.update_aware_token_id == _id
        );

        product_line[elementIndex].update_status = "Rejected";
        product_line[elementIndex].message = req.body.message;

        // Set draft status to CONCEPT
        await draft_info
          .findOneAndUpdate(
            {
              _id: mongoose.Types.ObjectId(product_line[elementIndex].draft_id),
            },
            { status: "CONCEPT" },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            throw new Error("Failed to update draft info.");
          });

        // Update product lines
        await product_lines
          .findOneAndUpdate(
            { po_id: temp_product_lines_avaliable?.po_id, deleted: false },
            { product_line: product_line },
            { new: true }
          )
          .catch((ex) => {
            loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
            throw new Error("Failed to update product lines.");
          });
      }

      // Handle unlocking tokens - wait for all promises to settle
      if (
        update_physical_assets_found &&
        update_physical_assets_found.assetdataArrayMain
      ) {
        const unlockPromises =
          update_physical_assets_found.assetdataArrayMain.map(
            async (dataset) => {
              return callstack.unlockedWTheLockedTokensAndAddingBalance(
                dataset,
                req
              );
            }
          );

        await Promise.all(unlockPromises).catch((error) => {
          loggerhandler.logger.error(`${error} ,email:${req.headers.email}`);
          // Don't throw here to continue with other operations
        });
      }

      // Update token status
      await update_aw_tokens
        .findOneAndUpdate(
          {
            _awareid: aware_id,
            _id: mongoose.Types.ObjectId(_id),
          },
          { status: "Rejected", message: message, reviewedBy, reviewedOn },
          { new: true }
        )
        .catch((ex) => {
          loggerhandler.logger.error(`${ex} ,email:${req.headers.email}`);
          throw new Error("Failed to update token status.");
        });

      // Send notifications
      await notifications.create({
        notification_sent_to: aware_id,
        message: `Your ${assets_avaliable.weight} tokens are rejected. Please make corrections and resend the request.`,
      });

      const kyc_details_avaliable = await kyc_details
        .findOne({ aware_id: assets_avaliable._awareid })
        .select(["_id", "company_name", "manager_id"]);

      await notifications.create({
        notification_sent_to: kyc_details_avaliable?.manager_id || "",
        message: `Asset ID - ${assets_avaliable.updated_aware_asset_id} approval request has been declined. Please contact administrator.`,
      });

      return { success: false, message: "Token was rejected." };
    }
  } catch (ex) {
    loggerhandler.logger.error(
      `Unhandled error in background processing: ${ex}`
    );

    console.log("Abhishek");

    return { success: false, message: ex.toString() };
  }
}

module.exports = { startScheduler, schedulerRunning };

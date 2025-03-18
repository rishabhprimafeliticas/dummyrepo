"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addresses = void 0;
const tslib_1 = require("tslib");
const ropsten_json_1 = tslib_1.__importDefault(require("./config/ropsten.json"));
const iotexTestNet_json_1 = tslib_1.__importDefault(require("./config/iotexTestNet.json"));
/**
 * Mapping from Network to Officially Deployed Instances of the PebbleGo Media Protocol
 */
exports.addresses = {
    ropsten: ropsten_json_1.default,
    iotexTest: iotexTestNet_json_1.default,
};
//# sourceMappingURL=addresses.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAwareProfiles = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const AWARE_API_BASE_URL = 'https://wearaware.co';
const MAX_USERS_PER_REQUEST = 100;
/**
 * Returns a list of Pebble user profiles given a list of up to 100 addresses
 * @param addresses
 */
async function getAwareProfiles(addresses) {
    if (addresses.length === 0) {
        throw new Error('Empty addresses array');
    }
    if (addresses.length > MAX_USERS_PER_REQUEST) {
        throw new Error(`Addresses array exceeds max length of ${MAX_USERS_PER_REQUEST}`);
    }
    try {
        const res = await axios_1.default.post(`${AWARE_API_BASE_URL}/api/users`, { addresses });
        if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
            throw new Error();
        }
        return res.data;
    }
    catch (err) {
        let msg;
        if (err.response && err.response.data && typeof err.response.data === 'string') {
            msg = err.response.data;
        }
        else if (err.message) {
            msg = err.message;
        }
        else {
            msg = 'Error retrieving users';
        }
        throw new Error(msg);
    }
}
exports.getAwareProfiles = getAwareProfiles;
//# sourceMappingURL=users.js.map
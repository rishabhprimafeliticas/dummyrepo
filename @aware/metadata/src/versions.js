"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVersion = exports.supportedVersionsTypeMapping = exports.supportedVersions = void 0;
/**
 *
 */
exports.supportedVersions = {
    aware: ['20221012']
};
/**
 *
 */
exports.supportedVersionsTypeMapping = {
    aware: {
        '20221012': 'Aware20221012'
    }
};
/**
 *
 * @param verboseVersion
 */
function validateVersion(verboseVersion) {
    const [name, calVer] = verboseVersion.split('-');
    // require name exists in `versions`
    if (!(name in exports.supportedVersions)) {
        throw new Error(`There are no versions with the ${name} project name`);
    }
    // require calVer exists in `versions`
    if (exports.supportedVersions[name].indexOf(calVer) == -1) {
        throw new Error(`There are no versions in the ${name} namespace with the ${calVer} calendar version`);
    }
    return;
}
exports.validateVersion = validateVersion;
//# sourceMappingURL=versions.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMetadata = exports.parseMetadata = exports.generateMetadata = exports.supportedVersionsTypeMapping = exports.supportedVersions = exports.validateVersion = exports.MetadataTypes = void 0;
const tslib_1 = require("tslib");
const src_1 = require("../../@aware/metadata/src");
Object.defineProperty(exports, "validateVersion", { enumerable: true, get: function () { return src_1.validateVersion; } });
Object.defineProperty(exports, "supportedVersions", { enumerable: true, get: function () { return src_1.supportedVersions; } });
Object.defineProperty(exports, "supportedVersionsTypeMapping", { enumerable: true, get: function () { return src_1.supportedVersionsTypeMapping; } });
const MetadataTypes = tslib_1.__importStar(require("../../@aware/metadata/types/types"));
exports.MetadataTypes = MetadataTypes;
/**
 * Generates alphabetized, minified JSON for the specified Pebblego Metadata Schema Version.
 * Raises an Error if the data does not conform to the Schema Version specified.
 *
 * @param version
 * @param data
 */
function generateMetadata(version, data) {
    const generator = new src_1.Generator(version);
    return generator.generateJSON(data);
}
exports.generateMetadata = generateMetadata;
/**
 * Parses the metadata into the Schema Version Interface
 *
 * @param version
 * @param json
 */
function parseMetadata(version, json) {
    const parser = new src_1.Parser(version);
    return parser.parse(json);
}
exports.parseMetadata = parseMetadata;
/**
 * Validates the metadata for the specified schema.
 * Raises if the schema version is not supported.
 *
 * @param version
 * @param data
 */
function validateMetadata(version, data) {
    const validator = new src_1.Validator(version);
    return validator.validate(data);
}
exports.validateMetadata = validateMetadata;
//# sourceMappingURL=metadata.js.map
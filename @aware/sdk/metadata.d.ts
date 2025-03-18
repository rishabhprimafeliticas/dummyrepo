import { validateVersion, supportedVersions, supportedVersionsTypeMapping } from './@aware/metadata/src';
import * as MetadataTypes from './@aware/metadata/types/types';
export { MetadataTypes };
export { validateVersion, supportedVersions, supportedVersionsTypeMapping };
export declare type JSONLike = {
    [key: string]: any;
};
/**
 * Generates alphabetized, minified JSON for the specified Pebblego Metadata Schema Version.
 * Raises an Error if the data does not conform to the Schema Version specified.
 *
 * @param version
 * @param data
 */
export declare function generateMetadata(version: string, data: JSONLike): string;
/**
 * Parses the metadata into the Schema Version Interface
 *
 * @param version
 * @param json
 */
export declare function parseMetadata(version: string, json: string): MetadataTypes.Aware20221012;
/**
 * Validates the metadata for the specified schema.
 * Raises if the schema version is not supported.
 *
 * @param version
 * @param data
 */
export declare function validateMetadata(version: string, data: JSONLike): boolean;

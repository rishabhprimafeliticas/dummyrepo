

// const express = require("express");
// var asyncHandler = require('express-async-handler');
// router = express.Router();

// var exempted_email = require('../models/exempted_email');
// var account_details = require('../models/account_details');
// var kyc_details = require('../models/kyc_details');
// var physical_asset = require('../models/physical_asset');
// const mongoose = require('mongoose');

// // Route to export aggregated materials info
// router.get('/v1/materials_info', asyncHandler(async (req, res) => {
//     try {
//         // Step 1: Get the exempted emails
//         var exempted_email_exist = await exempted_email.find({});
//         const emails = [];
//         const map8 = new Map();
//         for (const item of exempted_email_exist) {
//             if (!map8.has(item.email)) {
//                 map8.set(item.email, true);
//                 emails.push(item.email);
//             }
//         }

//         // Step 2: Get accounts excluding exempted emails
//         var accounts = await account_details.find({ role_id: { $ne: 1 }, email: { $nin: emails } }).select(['kyc_id', 'email', 'first_name', 'last_name', 'role_id']);

//         // Step 3: Collect kyc_ids
//         const kyc_ids = [];
//         const map = new Map();
//         for (const item of accounts) {
//             if (!map.has(mongoose.Types.ObjectId(item.kyc_id))) {
//                 map.set(mongoose.Types.ObjectId(item.kyc_id), true);
//                 kyc_ids.push(mongoose.Types.ObjectId(item.kyc_id));
//             }
//         }

//         // Step 4: Fetch KYC details to get aware_ids
//         var kyc_details_data = await kyc_details.find({ _id: { $in: kyc_ids } }).select(['aware_id', 'company_name']);
//         const aware_ids = [];
//         const map2 = new Map();
//         for (const item of kyc_details_data) {
//             if (!map2.has(mongoose.Types.ObjectId(item.aware_id))) {
//                 map2.set(mongoose.Types.ObjectId(item.aware_id), true);
//                 aware_ids.push(mongoose.Types.ObjectId(item.aware_id));
//             }
//         }

//         // Step 5: Fetch physical asset data using aware_ids
//         let physical_asset_data = await physical_asset.find({ _id: { $in: aware_ids } });
//         let updated_physical_asset_data = await update_physical_assets.find({ _id: { $in: aware_ids } });


//         // Step 6: Aggregating unique materials and their weights
//         const materialSummary = [];

//         for (let asset of physical_asset_data) {
//             const weight = parseFloat(asset.weight); // Total weight of the asset
//             for (let composition of asset.compositionArrayMain) {
//                 // Find if the material already exists in the materialSummary
//                 const existingMaterial = materialSummary.find(item =>
//                     item.composition_material === composition.composition_material &&
//                     item.feedstock_recycled_materials === composition.feedstock_recycled_materials &&
//                     item.sustainability_claim === composition.sustainability_claim &&
//                     item.sustainable === composition.sustainable
//                 );

//                 const materialWeight = (weight * composition.percentage) / 100;

//                 // If material exists, update the total weight
//                 if (existingMaterial) {
//                     existingMaterial.total_weight += materialWeight;
//                 } else {
//                     // Otherwise, add a new material entry
//                     materialSummary.push({
//                         composition_material: composition.composition_material,
//                         feedstock_recycled_materials: composition.feedstock_recycled_materials,
//                         sustainability_claim: composition.sustainability_claim,
//                         sustainable: composition.sustainable,
//                         total_weight: materialWeight
//                     });
//                 }
//             }
//         }

//         for (let asset of updated_physical_asset_data) {
//             const weight = parseFloat(asset.weight); // Total weight of the asset
//             for (let composition of asset.tempcompositionArrayMain) {
//                 // Find if the material already exists in the materialSummary
//                 const existingMaterial = materialSummary.find(item =>
//                     item.composition_material === composition.composition_material &&
//                     item.feedstock_recycled_materials === composition.feedstock_recycled_materials &&
//                     item.sustainability_claim === composition.sustainability_claim &&
//                     item.sustainable === composition.sustainable
//                 );

//                 const materialWeight = (weight * composition.percentage) / 100;

//                 // If material exists, update the total weight
//                 if (existingMaterial) {
//                     existingMaterial.total_weight += materialWeight;
//                 } else {
//                     // Otherwise, add a new material entry
//                     materialSummary.push({
//                         composition_material: composition.composition_material,
//                         feedstock_recycled_materials: composition.feedstock_recycled_materials,
//                         sustainability_claim: composition.sustainability_claim,
//                         sustainable: composition.sustainable,
//                         total_weight: materialWeight
//                     });
//                 }
//             }
//         }

//         // Prepare response data
//         res.status(200).json({
//             success: true,
//             data: materialSummary
//         });
//     } catch (error) {
//         // Handle errors
//         console.error("Error exporting materials info: ", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to export materials info"
//         });
//     }
// }));

// // Route to export user role and country data
// router.get('/v1/roles_countries', asyncHandler(async (req, res) => {
//     try {
//         // Step 1: Get exempted emails
//         var exempted_email_exist = await exempted_email.find({});
//         const emails = [];
//         const map8 = new Map();
//         for (const item of exempted_email_exist) {
//             if (!map8.has(item.email)) {
//                 map8.set(item.email, true);
//                 emails.push(item.email);
//             }
//         }

//         // Step 2: Get account details excluding exempted emails
//         var accounts = await account_details.find({ email: { $nin: emails } }).select(['kyc_id', 'role_id', 'email']);

//         // Step 3: Collect kyc_ids from accounts
//         const kyc_ids = accounts.map(account => mongoose.Types.ObjectId(account.kyc_id));

//         // Step 4: Fetch KYC details to get country based on kyc_ids
//         var kyc_details_data = await kyc_details.find({ _id: { $in: kyc_ids } }).select(['_id', 'country']);

//         // Step 5: Create a map to link KYC ID to country
//         const kycCountryMap = new Map();
//         for (const kyc of kyc_details_data) {
//             kycCountryMap.set(kyc._id.toString(), kyc.country);
//         }

//         // Step 6: Group users by role_id and country
//         const roleCountrySummary = {};

//         for (const account of accounts) {
//             const roleId = account.role_id;
//             const kycId = account.kyc_id;
//             const country = kycCountryMap.get(kycId.toString()) || "Unknown";

//             // Initialize role entry if it doesn't exist
//             if (!roleCountrySummary[roleId]) {
//                 roleCountrySummary[roleId] = {};
//             }

//             // Increment the count for this country under the specific role
//             if (!roleCountrySummary[roleId][country]) {
//                 roleCountrySummary[roleId][country] = 1;
//             } else {
//                 roleCountrySummary[roleId][country] += 1;
//             }
//         }

//         // Step 7: Return the result
//         res.status(200).json({
//             success: true,
//             data: roleCountrySummary
//         });
//     } catch (error) {
//         // Handle errors
//         console.error("Error fetching role and country data: ", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to retrieve role and country data"
//         });
//     }
// }));

// module.exports = router;


const express = require("express");
var asyncHandler = require('express-async-handler');
router = express.Router();

var exempted_email = require('../models/exempted_email');
var account_details = require('../models/account_details');
var kyc_details = require('../models/kyc_details');
var physical_asset = require('../models/physical_asset');
var update_physical_asset = require('../models/update_physical_asset');
var selected_transaction_certificates = require('../models/selected_transaction_certificates');
var send_aw_tokens = require('../models/send_aw_tokens');
var aw_tokens = require('../models/aw_tokens');
var purchase_orders = require('../models/purchase_orders');






const mongoose = require('mongoose');

// Helper function to handle errors
function handleError(res, message, error) {
    console.error(message, error);
    res.status(500).json({ success: false, message, "error": error.message });
}

// Route to export aggregated materials info
router.get('/v1/materials_info', asyncHandler(async (req, res) => {
    try {
        // Step 1: Get the exempted emails
        const exemptedEmails = await exempted_email.find({}).distinct('email');

        // Step 2: Get accounts excluding exempted emails
        const accounts = await account_details.find({ role_id: { $ne: 1 }, email: { $nin: exemptedEmails } })
            .select(['kyc_id']);

        // Step 3: Collect unique kyc_ids
        const kycIds = [...new Set(accounts.map(account => mongoose.Types.ObjectId(account.kyc_id)))];

        // Step 4: Fetch KYC details to get aware_ids
        const kycDetails = await kyc_details.find({ _id: { $in: kycIds } })
            .select(['aware_id', 'company_name']);

        // Step 5: Collect unique aware_ids (as strings)
        const awareIds = [...new Set(kycDetails.map(kyc => kyc.aware_id))];

        console.log("awareIds", awareIds.length)

        const aware_token_ids = await aw_tokens.find({ _awareid: { $in: awareIds }, status: 'Approved', blockchain_id: { $ne: null } })
            .select('_id');

        console.log("aware_token_ids", aware_token_ids.length)


        const awareIds_filtered = aware_token_ids.map(token => token._id.toString());

        console.log("awareIds_filtered", awareIds_filtered.length)


        // Step 5: Fetch physical asset data using aware_ids
        // const physicalAssets = await physical_asset.find({ _awareid: { $in: awareIds_filtered } });
        // const updatedPhysicalAssets = await update_physical_asset.find({ _awareid: { $in: awareIds_filtered } });
        const physicalAssets = await physical_asset.find({ aware_token_id: { $in: awareIds_filtered } });



        console.log("physicalAssets", physicalAssets)
        // console.log("updatedPhysicalAssets", updatedPhysicalAssets)

        // Helper function to aggregate material weight
        const aggregateMaterials = (assets, compositionArrayKey, materialSummary) => {
            for (let asset of assets) {
                const weight = parseFloat(asset.weight); // Total weight of the asset
                for (let composition of asset[compositionArrayKey]) {
                    const materialWeight = (weight * composition.percentage) / 100;
                    const existingMaterial = materialSummary.find(item =>
                        item.composition_material === composition.composition_material &&
                        item.feedstock_recycled_materials === composition.feedstock_recycled_materials &&
                        item.sustainability_claim === composition.sustainability_claim &&
                        item.sustainable === composition.sustainable
                    );
                    if (existingMaterial) {
                        existingMaterial.total_weight += materialWeight;
                    } else {
                        materialSummary.push({
                            composition_material: composition.composition_material,
                            feedstock_recycled_materials: composition.feedstock_recycled_materials,
                            sustainability_claim: composition.sustainability_claim,
                            sustainable: composition.sustainable,
                            total_weight: materialWeight
                        });
                    }
                }
            }
        };

        console.log("Done")


        // Step 6: Aggregate unique materials and their weights
        const materialSummary = [];
        aggregateMaterials(physicalAssets, 'compositionArrayMain', materialSummary);
        // aggregateMaterials(updatedPhysicalAssets, 'tempcompositionArrayMain', materialSummary);

        // Prepare response data
        res.status(200).json({ success: true, data: materialSummary });
    } catch (error) {
        handleError(res, "Failed to export materials info", error);
    }
}));

// Route to export user role and country data
router.get('/v1/roles_countries', asyncHandler(async (req, res) => {
    try {
        // Step 1: Get exempted emails
        const exemptedEmails = await exempted_email.find({}).distinct('email');

        // Step 2: Get account details excluding exempted emails
        const accounts = await account_details.find({ email: { $nin: exemptedEmails } })
            .select(['kyc_id', 'role_id']);

        // Step 3: Collect kyc_ids from accounts
        const kycIds = [...new Set(accounts.map(account => mongoose.Types.ObjectId(account.kyc_id)))];

        // Step 4: Fetch KYC details to get country based on kyc_ids
        const kycDetails = await kyc_details.find({ _id: { $in: kycIds } }).select(['_id', 'country']);

        // Step 5: Create a map to link KYC ID to country
        const kycCountryMap = new Map(kycDetails.map(kyc => [kyc._id.toString(), kyc.country]));

        // console.log("kycCountryMap", kycCountryMap)

        // // Step 6: Group users by role_id and country
        // const roleCountrySummary = {};
        // for (const account of accounts) {
        //     const roleId = account.role_id;
        //     const country = kycCountryMap.get(account.kyc_id.toString()) || "Unknown";
        //     roleCountrySummary[roleId] = roleCountrySummary[roleId] || {};
        //     roleCountrySummary[roleId][country] = (roleCountrySummary[roleId][country] || 0) + 1;
        // }

        // Step 6: Group users by role_id and country
        const roleCountrySummary = {};
        for (const account of accounts) {
            const roleId = account.role_id;
            const kycId = account.kyc_id;

            // Ensure kyc_id is not null or undefined
            if (!kycId) {
                console.warn(`Missing kyc_id for account: ${account.email}`);
                continue; // Skip this account if kyc_id is null or undefined
            }

            const country = kycCountryMap.get(kycId.toString()) || "Unknown";
            roleCountrySummary[roleId] = roleCountrySummary[roleId] || {};
            roleCountrySummary[roleId][country] = (roleCountrySummary[roleId][country] || 0) + 1;
        }

        // Step 7: Return the result
        res.status(200).json({ success: true, data: roleCountrySummary });
    } catch (error) {
        handleError(res, "Failed to retrieve role and country data", error);
    }
}));

// Route to export how many TC's are there
router.get('/v1/fetch_tcs', asyncHandler(async (req, res) => {
    try {
        // Step 1: Get distinct exempted emails
        const exemptedEmails = await exempted_email.find({}).distinct('email');

        // Step 2: Get account details excluding exempted emails, and collect kyc_ids
        const accounts = await account_details.find({ email: { $nin: exemptedEmails } })
            .select('kyc_id')
            .distinct('kyc_id');

        // Step 3: Fetch KYC details to get aware_ids
        const kycDetails = await kyc_details.find({ _id: { $in: accounts } })
            .select('aware_id')
            .distinct('aware_id');

        // Step 4: Fetch selected transaction certificates using aware_ids
        const total_requests = await send_aw_tokens.find({ _awareid: { $in: kycDetails } });;

        console.log({ total_requests })

        const selectedTransactionCertificates = await selected_transaction_certificates.find({ _awareid: { $in: kycDetails } })
            .select('transaction_certificates');

        // Step 5: Count the number of objects with non-empty transaction certificates
        const count = selectedTransactionCertificates.filter(tc => tc.transaction_certificates.length > 0).length;

        // Step 6: Return the count as a result
        res.status(200).json({ success: true, data: { count, "total_requests": total_requests.length } });
    } catch (error) {
        console.error("Error fetching transaction certificates: ", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve transaction certificate data"
        });
    }
}));

function groupAndSum(jsonArray) {
    const groupedByYear = jsonArray.reduce((acc, item) => {
        const year = new Date(item.purchase_order.created_date).getFullYear();
        if (!acc[year]) {
            acc[year] = 0;
        }
        acc[year] += item.total_quantity;
        return acc;
    }, {});
    const groupedByBrand = jsonArray.reduce((acc, item) => {
        const brand = item.brand;
        if (!acc[brand]) {
            acc[brand] = 0;
        }
        acc[brand] += item.total_quantity;
        return acc;
    }, {});
    return {
        groupedByYear,
        groupedByBrand,
    };
}

router.get('/v1/fetch_overview', asyncHandler(async (req, res) => {
    try {
        const PO_List = await purchase_orders.aggregate([
            {
                $addFields: {
                    string_id: { $toString: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "purchase_order_details",
                    localField: "string_id",
                    foreignField: "po_id",
                    as: "purchase_order_details"
                }
            },
            {
                $lookup: {
                    from: "product_lines",
                    localField: "string_id",
                    foreignField: "po_id",
                    as: "product_lines"
                }
            },
            {
                $match: {
                    product_lines: { $ne: [] }
                }
            },
            {
                $addFields: {
                    product_line_count: {
                        $sum: {
                            $map: {
                                input: "$product_lines",
                                as: "productLine",
                                in: { $size: "$$productLine.product_line" }
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$product_lines"
            },
            {
                $unwind: "$product_lines.product_line"
            },
            {
                $group: {
                    _id: "$_id",
                    total_quantity: {
                        $sum: {
                            $toDouble: {
                                $ifNull: [
                                    {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$product_lines.product_line.production_quantity", ""] }, { $eq: ["$product_lines.product_line.production_quantity", null] }] },
                                            then: "0",
                                            else: "$product_lines.product_line.production_quantity"
                                        }
                                    },
                                    "0"
                                ]
                            }
                        }
                    },
                    product_line_count: { $first: "$product_line_count" },
                    brand: { $first: { $arrayElemAt: ["$purchase_order_details.brand", 0] } },
                    purchase_order: { $first: "$$ROOT" },
                }
            },
            {
                $project: {
                    _id: 1,
                    total_quantity: 1,
                    product_line_count: 1,
                    brand: 1,
                    purchase_order: {
                        _id: "$purchase_order._id",
                        _awareid: "$purchase_order._awareid",
                        status: "$purchase_order.status",
                        create_token_stepper: "$purchase_order.create_token_stepper",
                        type_of_token: "$purchase_order.type_of_token",
                        locked: "$purchase_order.locked",
                        created_date: "$purchase_order.product_lines.created_date",
                        modified_on: "$purchase_order.modified_on",
                        product_lines: "$purchase_order.product_lines"
                    }
                }
            }
        ]);
        // console.log(PO_List)
        res.status(200).json({ status: 'Success', message: 'List fetched successfully', data: groupAndSum(PO_List) })
    }
    catch (err) {
        console.log("Error : ", err)
        res.status(500).json({ status: 'Failed', message: 'Internal Server Error!', error: err })
    }
}))

module.exports = router;

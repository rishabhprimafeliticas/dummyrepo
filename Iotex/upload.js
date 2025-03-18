// import fs from "fs"; // Filesystem
// import { promisify } from "util"; // Promisify fs
// import { v4 as uuid } from "uuid"; // UUID generation
// import formidable from "formidable"; // Formidable form handling
// import fleekStorage from "@fleekhq/fleek-storage-js"; // Fleek storage

// // Fleek authentication
// const fleekAuth = {
//   apiKey: process.env.FLEEK_API_KEY,
//   apiSecret: process.env.FLEEK_API_SECRET,
// };

// module.exports = {

//   createWalletAsync: async function (data, callback) {

//     // Async readFile operation
//     const readFileAsync = promisify(fs.readFile);
//     const file = data.file;
//     const fileData = await readFileAsync(file.path);
//     const name = data.name;
//     const metadata = data.metadata;

//     if (fileData && name && metadata) {
//       // Upload media to Fleek
//       const { publicUrl: fileUrl } = await fleekStorage.upload({
//         ...fleekAuth,
//         key: uuid(),
//         data: fileData,
//       });
//       // Upload metdata to Fleek
//       const { publicUrl: metadataUrl } = await fleekStorage.upload({
//         ...fleekAuth,
//         key: uuid(),
//         data: metadata,
//       });
//       // Return fileUrl and metadataUrl
//       callback({ fileUrl, metadataUrl });
//     }
//     else {
//       // Else, return 501
//       callback(null);
//     }

//   }

// }


// // export default async (req, res) => {
// //   // Setup incoming form data
// //   const form = new formidable.IncomingForm({ keepExtensions: true });
// //   // console.log("1");
// //   // Collect data from form
// //   const data = await new Promise((res, rej) => {
// //     // Parse form data
// //     form.parse(req, (err, fields, files) => {
// //       // if error, reject promise
// //       if (err) return rej(err);
// //       // Else, return fields and files
// //       res({ fields, files });
// //     });

// //   });

// //   // Collect file and metadataJSON from POST request
// //   // console.log("2");
// //   // Collect uploaded media

// //   // console.log("3");
// //   // If file, name, and metadata provided


// //   // End
// //   res.end();
// // };

// // // Remove bodyParser from endpoint
// // export const config = {
// //   api: {
// //     bodyParser: false,
// //   },
// // };

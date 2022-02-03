// NO_HTTP_REMOVE
// import * as selfsigned from "selfsigned";
// import { v4 as uuidv4 } from "uuid";

// export function generateSelfSignedData() {
//     return new Promise((resolve, reject) => {
//         const opts = {
//             algorithm: "sha256",
//             // clientCertificate: true,
//             // clientCertificateCN: "KB insecure client",
//             days: 30,
//             extensions: [{
//                 altNames: [{
//                     type: 2, // DNSName
//                     value: "localhost",
//                 }],
//                 name: "subjectAltName",
//             }],
//         };
//         const rand = uuidv4();
//         const attributes = [{ name: "commonName", value: "KB insecure server " + rand }];

//         selfsigned.generate(attributes, opts, (err, keys) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }

//             resolve(keys);
//         });
//     });
// }

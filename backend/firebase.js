import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync("./firebase-admin.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "smartvault-73088.appspot.com", // your bucket name
});

const bucket = admin.storage().bucket();

export { bucket };
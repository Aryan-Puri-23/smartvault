// best best best 

// file.js (update schema for disk storage)
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    filename: { type: String, required: true },     // stored filename in uploads/
    originalname: { type: String, required: true }, // original uploaded name
    customName: { type: String }, 
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    description: { type: String, default: "" },
    favorite: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    path: { type: String, required: true },         // location in /uploads
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);





// firebase

// import mongoose from "mongoose";
// const fileSchema = new mongoose.Schema(
//   {
//     userId: { type: String, required: true },
//     filename: { type: String, required: true },
//     firebaseName: { type: String, required: true },
//     originalname: { type: String, required: true },
//     customName: { type: String },
//     mimetype: { type: String, required: true },
//     size: { type: Number, required: true },
//     description: { type: String, default: "" },
//     favorite: { type: Boolean, default: false },
//     tags: { type: [String], default: [] },
//     path: { type: String, required: true },
//     downloads: { type: Number, default: 0 },
//     url: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("File", fileSchema);


// import mongoose from "mongoose";
// const fileSchema = new mongoose.Schema(
//   {
//     userId: { type: String, required: true },
//     filename: { type: String, required: true },        // original name
//     firebaseName: { type: String, required: true },    // Firebase stored name
//     originalname: { type: String, required: true },
//     customName: { type: String }, 
//     mimetype: { type: String, required: true },
//     size: { type: Number, required: true },
//     description: { type: String, default: "" },
//     favorite: { type: Boolean, default: false },
//     tags: { type: [String], default: [] },
//     path: { type: String, required: true },           // Firebase URL
//     downloads: { type: Number, default: 0 },
//     url: { type: String, required: true },  
//   },
//   { timestamps: true }
// );

// export default mongoose.model("File", fileSchema);


import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    action: { type: String, enum: ["ADD", "EDIT", "DELETE", "DOWNLOAD"], required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
    fileName: String,
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Log", logSchema);



// import mongoose from "mongoose";

// const logSchema = new mongoose.Schema(
//   {
//     userId: { type: String, required: true },
//     action: { type: String, enum: ["ADD", "EDIT", "DELETE"], required: true },
//     fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
//     fileName: String,
//     timestamp: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Log", logSchema);

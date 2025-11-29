import mongoose from "mongoose";
const AssetSchema = new mongoose.Schema({
  name: String,
  category: { type: String, enum: ["shirt", "pant", "shoe"] },
  imagePath: String,
  embedding: [Number],
});

export default mongoose.model("Asset", AssetSchema);
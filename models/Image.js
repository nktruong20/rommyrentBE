const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    images: [{
      public_id: { type: String, required: true }, // Lưu public_id của ảnh trên Cloudinary
      url: { type: String, required: true }, // URL ảnh từ Cloudinary
      isMain: { type: Boolean, default: false }, // Xác định ảnh chính
    }],
  },
  { timestamps: { createdAt: "create_at" } }
);

module.exports = mongoose.model("Image", imageSchema);

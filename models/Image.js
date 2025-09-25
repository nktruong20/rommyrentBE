const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
        isMain: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: { createdAt: "create_at" } }
);

module.exports = mongoose.model("Image", imageSchema);

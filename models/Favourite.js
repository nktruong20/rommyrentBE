const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  },
  { timestamps: { createdAt: "created_at" } }
);

module.exports = mongoose.model("Favourite", favouriteSchema);

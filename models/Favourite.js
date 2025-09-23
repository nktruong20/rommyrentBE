const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // user nào thích
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room" }, // phòng nào được thích
  },
  { timestamps: { createdAt: "created_at" } }
);

module.exports = mongoose.model("Favourite", favouriteSchema);

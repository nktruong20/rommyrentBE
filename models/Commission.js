const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    room_price: { type: Number, required: true },
    commission_percent: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    note: { type: String },
  },
  { timestamps: { createdAt: "create_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Commission", commissionSchema);

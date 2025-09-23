const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    scheduled_time: { type: Date, required: true },
    assigned_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    create_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "assigned", "accepted", "done", "canceled"],
      default: "pending",
    },
    note: { type: String },
    commission_snapshot: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        percent: { type: Number },
        amount: { type: Number }, // tiền hoa hồng tính ra từ room.price
        role: { type: String },   // admin/assistant/ctv
      },
    ],
  },
  { timestamps: { createdAt: "create_at" } }
);


module.exports = mongoose.model("Schedule", scheduleSchema);

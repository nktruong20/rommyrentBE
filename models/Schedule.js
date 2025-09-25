const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    assigned_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    create_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "assigned", "accepted", "viewed", "done", "canceled"],
      default: "pending",
    },
    note: { type: String },
    commission_snapshot: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        percent: { type: Number },
        amount: { type: Number },
        role: { type: String },
      },
    ],
  },
  { timestamps: { createdAt: "create_at", updatedAt: "updated_at" } }
);

scheduleSchema.pre("validate", function (next) {
  if (!this.end_time && this.start_time) {
    const durationMinutes = 90;
    this.end_time = new Date(this.start_time.getTime() + durationMinutes * 60000);
  }
  next();
});

module.exports = mongoose.model("Schedule", scheduleSchema);

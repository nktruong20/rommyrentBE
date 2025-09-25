const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    role: {
      type: String,
      enum: ["boss", "admin", "assistant", "CTV"],
      default: "CTV",
    },
    avatar: { type: String },
    commission_percent: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  if (this.isNew && (this.role === "admin" || this.role === "assistant")) {
    this.commission_percent = 5;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);

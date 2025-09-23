const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    // Ai nhận hoa hồng (CTV tạo lịch hẹn / người môi giới)
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Phòng được chốt
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },

    // Giá phòng tại thời điểm chốt (snapshot, để sau này không bị thay đổi nếu room.price đổi)
    room_price: { type: Number, required: true },

    // % hoa hồng áp dụng (snapshot, lấy từ room.commission_percent)
    commission_percent: { type: Number, required: true },

    // Số tiền thực nhận (tính = room_price * commission_percent / 100)
    amount: { type: Number, required: true },

    // Trạng thái thanh toán hoa hồng
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    // Ghi chú nếu cần
    note: { type: String },
  },
  { timestamps: { createdAt: "create_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Commission", commissionSchema);

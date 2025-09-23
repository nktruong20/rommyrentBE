const mongoose = require("mongoose");

// ✅ Snapshot người tạo (id + name + phone)
const CreatedBySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    apartmentName: { type: String, required: true }, 
    address: { type: String, required: true },
    type: {
      type: String,
      enum: ["phòng trọ", "chung cư", "nhà ở", "chung cư mini"],
      required: true,
    },
    price: { type: Number, required: true }, 
    area: { type: Number, required: true },
    description: { type: String },

    // ✅ Giờ bạn nhập trực tiếp % hoa hồng khi tạo phòng
    commission_percent: { type: Number, required: true },

    // ⚠️ Giữ để tương thích dữ liệu cũ
    create_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ✅ Thông tin người tạo
    createdBy: { type: CreatedBySchema },

    status: {
      type: String,
      enum: ["Còn trống", "Đã thuê", "Đang bảo trì"],
      default: "Còn trống",
    },

    floor: { type: Number, default: 1 },
    numberOfRooms: { type: Number, default: 1 },

    utilities: {
      electricity: { type: Number, default: 0 },
      water: { type: Number, default: 0 },
      internet: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
    },

    commonAmenities: {
      camera: { type: Boolean, default: false },
      smartLock: { type: Boolean, default: false },
      fireAlarm: { type: Boolean, default: false },
      privateToilet: { type: Boolean, default: false },
      washingArea: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      staircase: { type: Boolean, default: false },
      elevator: { type: Boolean, default: false },
      fireExtinguisher: { type: Boolean, default: false },
    },

    images: [
      {
        public_id: { type: String },
        url: { type: String },
        isMain: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);

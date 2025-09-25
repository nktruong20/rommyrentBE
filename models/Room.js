const mongoose = require("mongoose");

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
    detailAddress: { type: String, trim: true },
    province: { code: String, name: String },
    district: { code: String, name: String },
    ward: { code: String, name: String },
    address: { type: String },
    type: {
      type: String,
      enum: [
        "phòng trọ",
        "chung cư",
        "nhà nguyên căn",
        "biệt thự",
        "mặt bằng/cửa hàng",
        "văn phòng",
        "nhà xưởng/kho",
      ],
      required: true,
    },
    price: { type: Number, required: true },
    area: { type: Number, required: true },
    description: { type: String },
    commission_percent: { type: Number, required: true },
    create_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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

roomSchema.pre("save", function (next) {
  let addressParts = [];
  if (this.detailAddress) addressParts.push(this.detailAddress);
  if (this.ward?.name) addressParts.push(this.ward.name);
  if (this.district?.name) addressParts.push(this.district.name);
  if (this.province?.name) addressParts.push(this.province.name);
  this.address = addressParts.join(", ");
  next();
});

module.exports = mongoose.model("Room", roomSchema);

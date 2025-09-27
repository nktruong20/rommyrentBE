const Room = require("../models/Room");

exports.createRoom = async (req, res) => {
  try {
    const me = req.user;
    if (!me?._id) return res.status(401).json({ error: "Bạn chưa đăng nhập" });

    const { utilities, commonAmenities, ...roomData } = req.body;
    if (!roomData.apartmentName || !roomData.price || !roomData.area || !roomData.type) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }
    if (!utilities || !commonAmenities) {
      return res.status(400).json({ error: "Thiếu utilities hoặc commonAmenities" });
    }

    const room = new Room({
      ...roomData,
      utilities,
      commonAmenities,
      create_by: me._id,
      createdBy: {
        user: me._id,
        name: me.name || "",
        phone: me.phone || "",
      },
    });

    const savedRoom = await room.save();
    return res.status(201).json(savedRoom);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("create_by", "name phone role")
      .populate("createdBy.user", "name phone role");

    return res.json(rooms);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("create_by", "name phone role")
      .populate("createdBy.user", "name phone role");
    if (!room) return res.status(404).json({ error: "Room not found" });
    return res.json(room);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { createdBy, create_by, ...roomData } = req.body;
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: roomData },
      { new: true, runValidators: true }
    );
    if (!updatedRoom) return res.status(404).json({ error: "Room not found" });
    return res.json(updatedRoom);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    return res.json({ message: "Room deleted successfully" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.getRoomsFiltered = async (req, res) => {
  try {
    const { provinceCode, districtCode, wardCode } = req.query;
    const query = {};
    if (provinceCode) query["province.code"] = provinceCode;
    if (districtCode) query["district.code"] = districtCode;
    if (wardCode) query["ward.code"] = wardCode;

    const rooms = await Room.find(query)
      .populate("create_by", "name phone role")
      .populate("createdBy.user", "name phone role");
    return res.json(rooms);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

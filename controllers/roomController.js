const Room = require("../models/Room");

// ================== Tạo phòng mới ==================
exports.createRoom = async (req, res) => {
  try {
    const me = req.user; // ✅ do authMiddleware gán
    if (!me?._id) return res.status(401).json({ error: "Bạn chưa đăng nhập" });

    const { utilities, commonAmenities, createdBy, create_by, ...roomData } = req.body;

    if (!utilities || !commonAmenities) {
      return res.status(400).json({ error: "Thiếu utilities hoặc commonAmenities" });
    }

    const room = new Room({
      ...roomData,
      utilities,
      commonAmenities,
      // giữ field cũ để tương thích
      create_by: me._id,
      // snapshot mới (không tin client)
      createdBy: {
        user: me._id,
        name: me.name || "",
        phone: me.phone || "",
      },
    });

    const savedRoom = await room.save();
    return res.status(201).json(savedRoom);
  } catch (err) {
    console.error("❌ Error in createRoom:", err);
    return res.status(400).json({ error: err.message });
  }
};

// ================== Lấy tất cả phòng ==================
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("create_by") // giữ nguyên để không vỡ chỗ khác
      .populate("createdBy.user", "name phone role");
    return res.json(rooms);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// ================== Lấy 1 phòng theo ID ==================
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("create_by")
      .populate("createdBy.user", "name phone role");
    if (!room) return res.status(404).json({ error: "Room not found" });
    return res.json(room);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// ================== Cập nhật phòng ==================
exports.updateRoom = async (req, res) => {
  try {
    // ❌ không cho sửa lịch sử người tạo
    const { createdBy, create_by, ...roomData } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });

    Object.assign(room, roomData);

    const updatedRoom = await room.save();
    return res.json(updatedRoom);
  } catch (err) {
    console.error("❌ Error in updateRoom:", err);
    return res.status(400).json({ error: err.message });
  }
};

// ================== Xoá phòng ==================
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });

    await Room.findByIdAndDelete(req.params.id);
    return res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("❌ Error in deleteRoom:", err);
    return res.status(400).json({ error: err.message });
  }
};

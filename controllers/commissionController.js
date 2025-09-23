const Commission = require("../models/Commission");
const Room = require("../models/Room");
const User = require("../models/User");
/**
 * ✅ Tạo commission thủ công
 */
exports.createCommission = async (req, res) => {
  try {
    const { user_id, room_id, note } = req.body;

    if (!user_id || !room_id) {
      return res.status(400).json({ error: "Thiếu user_id hoặc room_id" });
    }

    // Lấy thông tin phòng để tính hoa hồng
    const room = await Room.findById(room_id);
    if (!room) return res.status(404).json({ error: "Không tìm thấy phòng" });

    const amount = room.price * (room.commission_percent / 100);

    const commission = await Commission.create({
      user_id,
      room_id,
      room_price: room.price,
      commission_percent: room.commission_percent,
      amount,
      note,
    });

    res.json(commission);
  } catch (err) {
    console.error("❌ Error createCommission:", err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * ✅ Lấy commissions (boss → tất cả, role khác → chỉ của mình)
 */
exports.getCommissions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Chưa xác thực" });
    }

    const { page = 1, pageSize = 10, status } = req.query;
    const query = status ? { status } : {};

    // Boss xem tất cả, role khác chỉ xem của mình
    if (req.user.role !== "boss") {
      query.user_id = req.user._id;
    }

    const total = await Commission.countDocuments(query);

    const commissions = await Commission.find(query)
      .populate("user_id", "name email role")
      .populate("room_id", "apartmentName address price")
      .sort({ create_at: -1 })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    res.json({
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      data: commissions,
    });
  } catch (err) {
    console.error("❌ Error getCommissions:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ Lấy commissions của chính user (/me)
 */
exports.getMyCommissions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Chưa xác thực" });
    }

    const { page = 1, pageSize = 10, status } = req.query;
    const query = { user_id: req.user._id };
    if (status) query.status = status;

    const total = await Commission.countDocuments(query);

    const commissions = await Commission.find(query)
      .populate("room_id", "apartmentName address price")
      .sort({ create_at: -1 })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    res.json({
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      data: commissions,
    });
  } catch (err) {
    console.error("❌ Error getMyCommissions:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ Lấy chi tiết 1 commission
 */
exports.getCommissionById = async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id)
      .populate("user_id", "name email phone role")
      .populate("room_id", "apartmentName address price");

    if (!commission) {
      return res.status(404).json({ error: "Không tìm thấy hoa hồng" });
    }

    res.json(commission);
  } catch (err) {
    console.error("❌ Error getCommissionById:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✅ Cập nhật trạng thái commission
 */
exports.updateCommissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Thiếu trạng thái mới" });
    }

    const commission = await Commission.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!commission) {
      return res.status(404).json({ error: "Không tìm thấy hoa hồng" });
    }

    res.json(commission);
  } catch (err) {
    console.error("❌ Error updateCommissionStatus:", err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * ✅ Xóa commission
 */
exports.deleteCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const commission = await Commission.findByIdAndDelete(id);

    if (!commission) {
      return res.status(404).json({ error: "Không tìm thấy hoa hồng" });
    }

    res.json({ message: "Xóa hoa hồng thành công" });
  } catch (err) {
    console.error("❌ Error deleteCommission:", err);
    res.status(400).json({ error: err.message });
  }
};
exports.getStaffRevenue = async (req, res) => {
  try {
    // chỉ Boss/Admin mới xem được toàn bộ
    if (req.user.role !== "boss" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Không có quyền" });
    }

    // Lấy toàn bộ user
    const users = await User.find({}, "_id name email phone role");

    // Lấy tất cả commissions
    const commissions = await Commission.find().populate("user_id", "name email role");

    // Gom doanh thu theo user + theo tháng
    const result = users.map((u) => {
      let revenue = 0;
      let commission = 0;
      const monthlyRevenue = {};

      commissions
        .filter((c) => c.user_id && String(c.user_id._id) === String(u._id))
        .forEach((c) => {
          const monthKey = `${c.create_at.getFullYear()}-${String(
            c.create_at.getMonth() + 1
          ).padStart(2, "0")}`;

          // Doanh thu sau khi trừ hoa hồng
          const netRevenue = c.room_price - c.amount;

          revenue += netRevenue;
          commission += c.amount;

          if (!monthlyRevenue[monthKey]) {
            monthlyRevenue[monthKey] = 0;
          }
          monthlyRevenue[monthKey] += netRevenue;
        });

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        revenue,
        commission,
        monthlyRevenue,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Error getStaffRevenue:", err);
    res.status(500).json({ error: err.message });
  }
};
const User = require("../models/User");
const Commission = require("../models/Commission");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= ĐĂNG KÝ =================
// ✅ Đăng ký mặc định (CTV)
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email đã được sử dụng" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: "CTV",
    });

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Đăng ký nhân sự (Admin tạo: role = admin | assistant)
exports.registerManagement = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email đã được sử dụng" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: role || "CTV",
    });

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ================= ĐĂNG NHẬP =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ================= LẤY DANH SÁCH USER =================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy danh sách user" });
  }
};

// ================= LẤY DANH SÁCH NHÂN SỰ =================
exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ["admin", "assistant"] } })
      .select("name email phone address avatar role commission_percent");
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy danh sách nhân sự" });
  }
};

// ================= DELETE STAFF =================
exports.deleteStaff = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "Không tìm thấy nhân sự" });
    res.json({ message: "Xóa nhân sự thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE USER =================
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id || req.user.id;
    const { name, email, phone, avatar, address, commission_percent } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (address) user.address = address;
    if (commission_percent !== undefined) user.commission_percent = commission_percent;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ================= LẤY USER HIỆN TẠI =================
exports.getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ================= ĐĂNG XUẤT =================
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};

// ================= DOANH THU + HOA HỒNG CỦA STAFF =================
exports.getStaffRevenue = async (req, res) => {
  try {
    const staff = await User.aggregate([
      { $match: { role: { $in: ["admin", "assistant"] } } },
      {
        $lookup: {
          from: "commissions",
          localField: "_id",
          foreignField: "user_id",
          as: "commissions",
        },
      },
      {
        $addFields: {
          revenue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$commissions",
                    as: "c",
                    cond: { $eq: ["$$c.status", "paid"] },
                  },
                },
                as: "c",
                in: "$$c.room_price",
              },
            },
          },
          commission: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$commissions",
                    as: "c",
                    cond: { $eq: ["$$c.status", "paid"] },
                  },
                },
                as: "c",
                in: "$$c.amount",
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          role: 1,
          revenue: 1,
          commission: 1,
        },
      },
    ]);

    res.json(staff);
  } catch (err) {
    console.error("❌ getStaffRevenue error:", err);
    res.status(500).json({ error: err.message });
  }
};

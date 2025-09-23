const express = require("express");
const {
  register,
  registerManagement,
  login,
  getUsers,
  getStaff,
  logout,
  getMe,
  updateUser,
  getStaffRevenue,
  deleteStaff, // ✅ thêm mới
} = require("../controllers/userController");
const auth = require("../middleware/authMiddleware"); // ✅ middleware xác thực

const router = express.Router();

// ================= ĐĂNG KÝ =================
router.post("/register", register);                 // CTV tự đăng ký
router.post("/register-management", registerManagement); // Admin tạo nhân sự (admin, assistant)

// ================= ĐĂNG NHẬP / ĐĂNG XUẤT =================
router.post("/login", login);
router.post("/logout", logout);

// ================= LẤY THÔNG TIN USER =================
router.get("/", auth, getUsers);        // Danh sách user (chỉ admin mới dùng)
router.get("/staff", auth, getStaff);   // ✅ Danh sách nhân sự (admin + assistant, boss)
router.get("/staff/revenue", auth, getStaffRevenue); // ✅ Danh sách + doanh thu, hoa hồng
router.get("/me", auth, getMe);         // Lấy thông tin user hiện tại

// ================= CẬP NHẬT / XÓA USER =================
router.put("/me", auth, updateUser);    // User tự update chính mình
router.put("/:id", auth, updateUser);   // Admin update user khác
router.delete("/:id", auth, deleteStaff); // ✅ Admin xóa nhân sự

module.exports = router;

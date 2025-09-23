const express = require("express");
const multer = require('multer');
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware xử lý ảnh upload (nếu có)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Lưu ảnh tạm thời vào thư mục 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Tên file ảnh
  },
});

const upload = multer({ storage: storage });

// Tạo phòng
router.post("/", upload.array('images'),auth, createRoom); // Giả sử 'images' là tên của field ảnh trong frontend

// Lấy danh sách phòng
router.get("/", getRooms);

// Lấy phòng theo ID
router.get("/:id", getRoomById);

// Cập nhật phòng
router.put("/:id", upload.array('images'),auth, updateRoom); // Upload ảnh nếu có khi cập nhật

// Xóa phòng
router.delete("/:id",auth, deleteRoom);

module.exports = router;

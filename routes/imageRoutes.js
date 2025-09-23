const express = require("express");
const multer = require("multer");
const {
  uploadImage,
  getImagesByRoom,
  deleteImage,
} = require("../controllers/imageController");

const router = express.Router();

// Middleware xử lý upload ảnh với multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Lưu file ảnh vào thư mục 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Tên file ảnh
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.array("images", 10), uploadImage);
router.get("/:roomId", getImagesByRoom);
router.delete("/:roomId/:publicId", deleteImage);

module.exports = router;

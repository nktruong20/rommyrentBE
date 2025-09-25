const express = require("express");
const multer = require("multer");
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomsFiltered,
} = require("../controllers/roomController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.array("images"), auth, createRoom);
router.get("/", getRooms);
router.get("/filter", getRoomsFiltered);
router.get("/:id", getRoomById);
router.put("/:id", upload.array("images"), auth, updateRoom);
router.delete("/:id", auth, deleteRoom);

module.exports = router;

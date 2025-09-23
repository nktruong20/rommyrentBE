const express = require("express");
const {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
  getMySchedules,
} = require("../controllers/scheduleController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, createSchedule);
router.get("/", getSchedules);
router.put("/:id", auth, updateSchedule);
router.delete("/:id", auth, deleteSchedule);
router.get("/me", auth, getMySchedules);

module.exports = router;

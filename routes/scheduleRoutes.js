const express = require("express");
const {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
  getMySchedules,
  checkAvailability,
} = require("../controllers/scheduleController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/staff/:staffId/availability", auth, checkAvailability);
router.post("/", auth, createSchedule);
router.get("/", getSchedules);
router.get("/me", auth, getMySchedules);
router.put("/:id", auth, updateSchedule);
router.delete("/:id", auth, deleteSchedule);

module.exports = router;

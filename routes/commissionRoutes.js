const express = require("express");
const {
  createCommission,
  getCommissions,
  getMyCommissions,
  getCommissionById,
  updateCommissionStatus,
  deleteCommission,
  getStaffRevenue,
} = require("../controllers/commissionController");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createCommission);
router.get("/", getCommissions);
router.get("/me", getMyCommissions);
router.get("/staff/revenue", getStaffRevenue);
router.get("/:id", getCommissionById);
router.put("/:id/status", updateCommissionStatus);
router.delete("/:id", deleteCommission);

module.exports = router;

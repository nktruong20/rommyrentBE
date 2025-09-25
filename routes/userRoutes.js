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
  deleteStaff,
} = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/register-management", registerManagement);
router.post("/login", login);
router.post("/logout", logout);

router.get("/", auth, getUsers);
router.get("/staff", auth, getStaff);
router.get("/staff/revenue", auth, getStaffRevenue);
router.get("/me", auth, getMe);

router.put("/me", auth, updateUser);
router.put("/:id", auth, updateUser);
router.delete("/:id", auth, deleteStaff);

module.exports = router;

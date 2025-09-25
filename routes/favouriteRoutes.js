const express = require("express");
const {
  addFavourite,
  getFavouritesByUser,
  removeFavourite,
} = require("../controllers/favouriteController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addFavourite);
router.get("/me", protect, getFavouritesByUser);
router.delete("/:id", protect, removeFavourite);

module.exports = router;

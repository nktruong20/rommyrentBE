const Favourite = require("../models/Favourite");

exports.addFavourite = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { room_id } = req.body;
    if (!room_id) {
      return res.status(400).json({ message: "room_id is required" });
    }

    const existing = await Favourite.findOne({ user_id: req.user._id, room_id });
    if (existing) {
      return res.status(400).json({ message: "Phòng này đã có trong danh sách yêu thích" });
    }

    const fav = await Favourite.create({
      user_id: req.user._id,
      room_id,
    });

    res.status(201).json(fav);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFavouritesByUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const favs = await Favourite.find({ user_id: req.user._id }).populate("room_id");
    res.json(favs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFavourite = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const fav = await Favourite.findById(req.params.id);
    if (!fav) {
      return res.status(404).json({ message: "Favourite not found" });
    }

    if (fav.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền xóa mục này" });
    }

    await fav.deleteOne();
    res.json({ message: "Favourite removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

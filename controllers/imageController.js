const Image = require("../models/Image");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Upload nhiều ảnh cho 1 phòng
exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "rental_rooms",
      });

      uploadedImages.push({
        public_id: result.public_id,
        url: result.secure_url,
        isMain: false,
      });
    }

    // Nếu phòng đã có document ảnh => push thêm
    let imageDoc = await Image.findOne({ room_id: req.body.room_id });

    if (imageDoc) {
      imageDoc.images.push(...uploadedImages);
      await imageDoc.save();
    } else {
      imageDoc = await Image.create({
        room_id: req.body.room_id,
        images: uploadedImages,
      });
    }

    res.json(imageDoc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy tất cả ảnh theo room_id
exports.getImagesByRoom = async (req, res) => {
  try {
    const imageDoc = await Image.findOne({ room_id: req.params.roomId });
    res.json(imageDoc ? imageDoc.images : []);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa 1 ảnh trong mảng
exports.deleteImage = async (req, res) => {
  try {
    const { roomId, publicId } = req.params;

    const imageDoc = await Image.findOne({ room_id: roomId });
    if (!imageDoc) return res.status(404).json({ error: "Room images not found" });

    // Xóa ảnh trên Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Xóa trong DB
    imageDoc.images = imageDoc.images.filter((img) => img.public_id !== publicId);
    await imageDoc.save();

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

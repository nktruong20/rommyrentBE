const express = require("express");
const axios = require("axios");

const router = express.Router();

// Lấy tất cả tỉnh/thành
router.get("/provinces", async (req, res) => {
  try {
    const response = await axios.get("https://provinces.open-api.vn/api/p/");
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Không lấy được danh sách tỉnh/thành" });
  }
});

// Lấy tất cả quận/huyện theo tỉnh
router.get("/districts/:provinceCode", async (req, res) => {
  try {
    const { provinceCode } = req.params;
    const response = await axios.get(
      `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
    );
    res.json(response.data.districts);
  } catch (err) {
    res.status(500).json({ error: "Không lấy được danh sách quận/huyện" });
  }
});

// Lấy tất cả phường/xã theo quận
router.get("/wards/:districtCode", async (req, res) => {
  try {
    const { districtCode } = req.params;
    const response = await axios.get(
      `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
    );
    res.json(response.data.wards);
  } catch (err) {
    res.status(500).json({ error: "Không lấy được danh sách phường/xã" });
  }
});

module.exports = router;

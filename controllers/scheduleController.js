// controllers/scheduleController.js
const Schedule = require("../models/Schedule");
const Room = require("../models/Room");
const Commission = require("../models/Commission");
const User = require("../models/User");


// ✅ Tạo mới lịch hẹn
exports.createSchedule = async (req, res) => {
  try {
    const scheduleData = {
      ...req.body,
      create_by: req.user._id, // gán từ token đăng nhập
    };
    const schedule = await Schedule.create(scheduleData);
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// ✅ Lấy tất cả lịch (Admin)
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("room_id")
      .populate("assigned_user_id")
      .populate("create_by");
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateSchedule = async (req, res) => {
  try {
    const { status, assigned_user_id, note } = req.body;

    let schedule = await Schedule.findById(req.params.id)
      .populate("room_id")
      .populate("assigned_user_id")
      .populate("create_by");

    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    // Cập nhật các trường
    if (assigned_user_id) {
      schedule.assigned_user_id = assigned_user_id;
    }
    if (note !== undefined && note !== null && note.trim() !== "") {
      schedule.note = note; // chỉ ghi đè khi có note mới
    }
    if (status) {
      schedule.status = status;
    }

    // Nếu hoàn thành -> tạo hoa hồng + update room
    if (status === "done" && schedule.room_id) {
      const roomPrice = schedule.room_id.price || 0;
      const snapshots = [];

      if (schedule.assigned_user_id) {
        const assignedUser = await User.findById(schedule.assigned_user_id);
        if (assignedUser) {
          snapshots.push({
            user: assignedUser._id,
            percent: 5,
            amount: Math.round(roomPrice * 5 / 100),
            role: assignedUser.role,
          });
        }
      }

      if (schedule.create_by) {
        const ctv = await User.findById(schedule.create_by);
        if (ctv) {
          const ctvPercent =
            schedule.room_id.commission_percent ||
            ctv.commission_percent ||
            0;
          snapshots.push({
            user: ctv._id,
            percent: ctvPercent,
            amount: Math.round(roomPrice * ctvPercent / 100),
            role: "CTV",
          });
        }
      }

      schedule.commission_snapshot = snapshots;

      await Commission.insertMany(
        snapshots.map((s) => ({
          user_id: s.user,
          room_id: schedule.room_id._id,
          room_price: roomPrice,
          commission_percent: s.percent,
          amount: s.amount,
          note: `Hoa hồng từ lịch hẹn ${schedule._id}`,
          status: "paid",
        }))
      );

      await Room.findByIdAndUpdate(schedule.room_id._id, { status: "đã thuê" });
    }

    const updated = await schedule.save();

    const populated = await Schedule.findById(updated._id)
      .populate("room_id")
      .populate("assigned_user_id")
      .populate("create_by");

    return res.json(populated);
  } catch (err) {
    console.error("❌ Error in updateSchedule:", err);
    return res.status(400).json({ error: err.message });
  }
};

// ✅ Xóa lịch
exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// ✅ Lấy lịch của user hiện tại
exports.getMySchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({
      $or: [
        { create_by: req.user._id },       // lịch do mình tạo
        { assigned_user_id: req.user._id } // lịch được phân công
      ],
    })
      .populate("room_id")
      .populate("assigned_user_id")
      .populate("create_by");

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

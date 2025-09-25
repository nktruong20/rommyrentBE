const Schedule = require("../models/Schedule");
const Room = require("../models/Room");
const Commission = require("../models/Commission");
const User = require("../models/User");

exports.createSchedule = async (req, res) => {
  try {
    const scheduleData = { ...req.body, create_by: req.user._id };
    const schedule = await Schedule.create(scheduleData);
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

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

    if (assigned_user_id) {
      const conflicts = await Schedule.find({
        _id: { $ne: schedule._id },
        assigned_user_id,
        status: { $nin: ["canceled", "done"] },
        start_time: { $lt: schedule.end_time },
        end_time: { $gt: schedule.start_time },
      });
      if (conflicts.length > 0) {
        return res.status(400).json({
          error: "Nhân sự đã có lịch khác trong khoảng thời gian này",
          conflicts,
        });
      }
      schedule.assigned_user_id = assigned_user_id;
    }

    if (note !== undefined && note !== null && note.trim() !== "") {
      schedule.note = note;
    }

    if (status) {
      if (status === "done") {
        if (
          !["admin", "boss"].includes(req.user.role) &&
          (!schedule.assigned_user_id || !schedule.assigned_user_id.equals(req.user._id))
        ) {
          return res.status(403).json({ error: "Bạn không có quyền hoàn thành lịch này" });
        }
      }
      schedule.status = status;
    }

    if (status === "done" && schedule.room_id) {
      const roomPrice = schedule.room_id.price || 0;
      const snapshots = [];

      if (schedule.assigned_user_id) {
        const assignedUser = await User.findById(schedule.assigned_user_id);
        if (assignedUser) {
          snapshots.push({
            user: assignedUser._id,
            percent: 5,
            amount: Math.round((roomPrice * 5) / 100),
            role: assignedUser.role,
          });
        }
      }

      if (schedule.create_by) {
        const ctv = await User.findById(schedule.create_by);
        if (ctv) {
          const ctvPercent =
            schedule.room_id.commission_percent || ctv.commission_percent || 0;
          snapshots.push({
            user: ctv._id,
            percent: ctvPercent,
            amount: Math.round((roomPrice * ctvPercent) / 100),
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
    return res.status(400).json({ error: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMySchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({
      $or: [{ create_by: req.user._id }, { assigned_user_id: req.user._id }],
    })
      .populate("room_id")
      .populate("assigned_user_id")
      .populate("create_by");
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { time, duration = 90 } = req.query;
    const start = new Date(time);
    const end = new Date(start.getTime() + duration * 60000);

    const conflicts = await Schedule.find({
      assigned_user_id: staffId,
      status: { $nin: ["canceled", "done"] },
      start_time: { $lt: end },
      end_time: { $gt: start },
    });

    if (conflicts.length > 0) {
      return res.json({ available: false, conflicts });
    }
    res.json({ available: true, conflicts: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

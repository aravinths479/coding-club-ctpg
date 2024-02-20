const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isFaculty,
  isStudent,
} = require("../config/auth");

const Event = require("../models/Event");

// Welcome Page
router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

// Dashboard
router.get("/facultyDashboard", ensureAuthenticated, async (req, res) => {
  try {
    console.log(req.user);
    const currentDate = new Date();

    // Filter past events by eventEndDate
    const pastEvents = await Event.find({ eventEndDate: { $lt: currentDate } });

    // Filter ongoing live events by start and end date
    const ongoingEvents = await Event.find({
      eventStartDate: { $lte: currentDate },
      eventEndDate: { $gte: currentDate }
    });

    // Filter future events by eventStartDate
    const futureEvents = await Event.find({ eventStartDate: { $gt: currentDate } });

    res.render("faculty/facultyDashboard", {
      user: req.user,
      pastEvents,
      ongoingEvents,
      futureEvents
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/studentDashboard", ensureAuthenticated, (req, res) => {
  console.log(req.user);
  res.render("studentDashboard", {
    user: req.user,
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isFaculty,
  isStudent,
} = require("../config/auth");

const Event = require("../models/Event");
const Gallery = require('../models/Gallery')

// Welcome Page
router.get("/", forwardAuthenticated, (req,res)=>{
    Gallery.find({})
      .then((data)=>{
        console.log(data);
        res.render('welcome',{gallery:data})
      })
      .catch((err)=>{
        console.log(err);
      })  
});

// Dashboard
router.get(
  "/facultyDashboard",
  ensureAuthenticated,
  isFaculty,
  async (req, res) => {
    try {
      console.log(req.user);
      const currentDate = new Date();

      // Filter past events by eventEndDate
      const pastEvents = await Event.find({
        eventEndDate: { $lt: currentDate },
      });

      // Filter ongoing live events by start and end date
      const ongoingEvents = await Event.find({
        eventStartDate: { $lte: currentDate },
        eventEndDate: { $gte: currentDate },
      });

      // Filter future events by eventStartDate
      const futureEvents = await Event.find({
        eventStartDate: { $gt: currentDate },
      });

      res.render("faculty/facultyDashboard", {
        user: req.user,
        pastEvents,
        ongoingEvents,
        futureEvents,
      });
    } catch (err) {
      console.log(err);
    }
  }
);


router.get(
  "/studentDashboard",
  ensureAuthenticated,
  isStudent,
  async (req, res) => {
    try {
      console.log(req.user);
      const currentDate = new Date();

      // Filter past events by eventEndDate
      const pastEvents = await Event.find({
        eventEndDate: { $lt: currentDate },
      });

      // Filter ongoing live events by start and end date
      const ongoingEvents = await Event.find({
        eventStartDate: { $lte: currentDate },
        eventEndDate: { $gte: currentDate },
      });

      // Filter future events by eventStartDate
      const futureEvents = await Event.find({
        eventStartDate: { $gt: currentDate },
      });

      res.render("student/studentDashboard", {
        user: req.user,
        pastEvents,
        ongoingEvents,
        futureEvents,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;

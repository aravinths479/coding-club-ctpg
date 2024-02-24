const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const {
  ensureAuthenticated,
  forwardAuthenticated,
  isFaculty,
  isStudent,
} = require("../config/auth");

const Event = require("../models/Event");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const RegisteredUsers = require("../models/RegisteredUsers");

router.get("/profile", ensureAuthenticated, isStudent, async (req, res) => {
  try {
    return res.render("student/profile", { user: req.user });
  } catch (err) {
    console.log(err);
  }
});

router.post(
  "/profile-update",
  ensureAuthenticated,
  isStudent,
  async (req, res) => {
    try {
      const { name, year, rollNumber, phoneNumber, leetcodeId, gitHub } =
        req.body;

      // Find the student by their user ID
      const student = await Student.updateOne(
        { _id: req.user._id },
        { name, year, rollNumber, phoneNumber, leetcodeId, gitHub },
        { new: true } // Return the updated document
      );

      if (!student) {
        return res.status(404).send("Student not found");
      }
      req.flash("success_msg", "Profile Updated Sucessfully !");
      res.redirect("/student/profile"); // Redirect to the profile page
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get("/change-password", ensureAuthenticated, isStudent, (req, res) => {
  return res.render("student/changePassword", { user: req.user });
});

router.post(
  "/change-password",
  ensureAuthenticated,
  isStudent,
  async (req, res) => {
    const { newPassword, confirmNewPassword } = req.body;
    const studentId = req.user._id;

    try {
      const student = await Student.findById(studentId);

      if (!student) {
        req.flash("err_msg", "Student not found in Database");
        return res.redirect("/student/change-password");
      }

      // Check if the new password and confirm new password match
      if (newPassword !== confirmNewPassword) {
        req.flash("err_msg", "New Passwords do not match");
        return res.redirect("/student/change-password");
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the student's password
      student.password = hashedPassword;
      await student.save();

      req.flash("success_msg", "New Password Set Successfully");
      res.redirect("/student/change-password"); // Redirect to profile page after successful password change
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get(
  "/register-event/:id",
  ensureAuthenticated,
  isStudent,
  async (req, res) => {
    const _id = req.params.id;
    const event = await Event.findById(_id);

    if (!event) {
      // If event with the given ID is not found
      console.error("Event not found");
      // Handle the case where the event is not found
      return res.status(404).send("Event not found");
    }
    console.log(event);
    // If the event is found, extract the teamMaxSize value
    const teamMaxSize = event.teamMaxSize;
    const isTeam = event.team;
    return res.render("student/registerEvent", {
      user: req.user,
      teamMaxSize,
      isTeam,
      event,
      eventId: _id,
    });
  }
);

router.post(
  "/register-event/:eventId",
  ensureAuthenticated,
  isStudent,
  async (req, res) => {
    console.log(req.body);
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) {
      console.error("Event not found");
      return res.status(404).send("Event not found");
    }

    let registeredUser;

    if (event.team) {
      const teamMembers = req.body.teamMemberName.map((name, index) => ({
        name: name,
        rollNo: req.body.teamMemberRollNo[index],
        year: parseInt(req.body.teamMemberYear[index]),
        phoneNumber: req.body.teamMemberPhone[index],
        email: req.body.teamMemberEmail[index],
      }));

      registeredUser = new RegisteredUsers({
        user: req.user._id,
        event: eventId,
        teamName: req.body.teamName,
        teamMembers: teamMembers,
      });
    } else {
      registeredUser = new RegisteredUsers({
        user: req.user._id,
        event: eventId,
      });
    }

    // Save the registered user data to the database
    registeredUser
      .save()
      .then((savedUser) => {
        console.log("Registered for event successfully:", savedUser);
        res.redirect("/student/my-events"); // Redirect to dashboard after successful registration
      })
      .catch((error) => {
        console.error("Error saving registered user data:", error);
        res.status(500).send("Internal Server Error");
      });
  }
);

router.get("/my-events", ensureAuthenticated, isStudent, async (req, res) => {
  try {
    const registerdEvents = await RegisteredUsers.find({
      user: req.user._id,
    }).populate("event");
    console.log(registerdEvents);
    return res.render("student/myEvents", {
      user: req.user,
      events: registerdEvents,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

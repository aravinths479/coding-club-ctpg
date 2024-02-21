const express = require("express");
const { DateTime } = require("luxon");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const router = express.Router();
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isFaculty,
} = require("../config/auth");

const Event = require("../models/Event");
const RegisteredUsers = require("../models/RegisteredUsers");

// Welcome Page
router.get("/create-event", ensureAuthenticated, isFaculty, (req, res) =>
  res.render("faculty/createEvent", { user: req.user })
);

// Configure AWS
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIASGQARUQKOR4HBPUI",
    secretAccessKey: "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",
  },
});

router.post(
  "/create-event",
  ensureAuthenticated,
  isFaculty,
  async (req, res) => {
    try {
      //console.log(req.body);
      const {
        title,
        description,
        team,
        teamMinSize,
        teamMaxSize,
        eventStartDate,
        eventEndDate,
        contact,
        allowResponse,
      } = req.body;

      // Check for missing required fields
      if (!title || !description || !eventStartDate || !eventEndDate) {
        return res
          .status(400)
          .send("Title, description, start date, and end date are required.");
      }

      // Convert the checkbox value to a boolean
      const allowResponseBool = allowResponse === "on";
      const teamBool = team === "on";
      const teamMinSizeValue = teamBool ? parseInt(teamMinSize) : undefined;
      const teamMaxSizeValue = teamBool ? parseInt(teamMaxSize) : undefined;

      // Format dates to ISOString before saving to MongoDB
      const formattedStartDate = DateTime.fromISO(eventStartDate).toISO();
      const formattedEndDate = DateTime.fromISO(eventEndDate).toISO();

      const event = await Event.create({
        title,
        description,
        team: teamBool,
        teamMinSize: teamMinSizeValue,
        teamMaxSize: teamMaxSizeValue,
        eventStartDate: formattedStartDate,
        eventEndDate: formattedEndDate,
        contact,
        allowResponse: allowResponseBool,
      });

      req.flash("success_msg", "Event Created Sucessfully");
      return res.redirect("/event/create-event");
    } catch (err) {
      console.error(err);
      res.status(500).send("An error occurred while creating the event");
    }
  }
);

router.get(
  "/registered-users/:eventId",
  ensureAuthenticated,
  isFaculty,
  async (req, res) => {
    const eventId = req.params.eventId;
    try {
      // Query the database to find the event document by its ID
      const event = await Event.findById(eventId);

      if (!event) {
        // If event with the given ID is not found
        console.error("Event not found");
        // Handle the case where the event is not found
        return res.status(404).send("Event not found");
      }

      // If the event is found, extract the teamMaxSize value
      const teamMaxSize = event.teamMaxSize;
      const eventName = event.title;

      // Once you have the event, you can use its ObjectId to find registered users
      RegisteredUsers.find({ event: eventId })
        .populate("user") // Populate the 'user' field with details from the 'Student' collection
        .exec((err, registeredUsers) => {
          if (err) {
            console.error("Error finding registered users:", err);
            return res.status(500).send("Error finding registered users");
          }

          // Now you have the registered users for the particular event
          console.log("Registered users for event:", registeredUsers);
          return res.render("faculty/registeredUsers", {
            user: req.user,
            registeredUsers,
            teamMaxSize,
            eventName,
          });
        });
    } catch (err) {
      // Handle any errors that occur during the process
      console.error("Error fetching teamMaxSize:", err);
      // Return an error response
      return res.status(500).send("Error fetching teamMaxSize");
    }
  }
);

module.exports = router;

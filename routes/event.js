const express = require("express");
const { DateTime } = require("luxon");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const uuid = require("uuid");
const mailService = require("../services/mailService");

const router = express.Router();
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isFaculty,
} = require("../config/auth");

const Event = require("../models/Event");
const RegisteredUsers = require("../models/RegisteredUsers");
const Student = require("../models/Student");

// Welcome Page
router.get("/create-event", ensureAuthenticated, isFaculty, (req, res) =>
  res.render("faculty/createEvent", { user: req.user })
);

const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
});

const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage as we'll directly upload the buffer to S3
});

router.post(
  "/create-event",
  ensureAuthenticated,
  isFaculty,
  upload.fields([
    { name: "posterImages", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ]),
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

      const posterImages = req.files["posterImages"];
      const documents = req.files["documents"];

      let totalSize = 0;

      // Calculate the total size of uploaded files
      if (posterImages) {
        for (const file of posterImages) {
          totalSize += file.size;
        }
      }

      if (documents) {
        for (const file of documents) {
          totalSize += file.size;
        }
      }

      const maxSizeInBytes = 8 * 1024 * 1024; // 8 MB

      if (totalSize > maxSizeInBytes) {
        req.flash(
          "error_msg",
          "Combined files size exceeds the limit. Please lower the memory of the files to below 8 MB."
        );
        return res.redirect("/event/create-event");
      }

      const posterUrls = [];
      const documentUrls = [];

      // Check for missing required fields
      if (!title || !description || !eventStartDate || !eventEndDate) {
        return res
          .status(400)
          .send("Title, description, start date, and end date are required.");
      }
      if (posterImages) {
        for (const file of posterImages) {
          const fileName = file.originalname;
          const fileId = uuid.v4(); // Generate UUID for fileId
          const fileUrl = `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/${fileId}_${fileName}`;

          // Upload poster image to S3
          const params = {
            Bucket: process.env.BUCKET,
            Key: fileId + "_" + fileName,
            Body: file.buffer,
            ACL: "public-read",
            ContentType: file.mimetype,
            ContentDisposition: "inline",
          };

          const command = new PutObjectCommand(params);
          await s3.send(command);

          posterUrls.push(fileUrl);
        }
      }

      if (documents) {
        for (const file of documents) {
          const fileName = file.originalname;
          const fileId = uuid.v4(); // Generate UUID for fileId
          const fileUrl = `https://coding-club.s3.us-east-1.amazonaws.com/${fileId}_${fileName}`;

          // Upload document to S3
          const params = {
            Bucket: process.env.BUCKET,
            Key: fileId + "_" + fileName,
            Body: file.buffer,
            ACL: "public-read",
            ContentType: file.mimetype,
            ContentDisposition: "inline",
          };

          const command = new PutObjectCommand(params);
          await s3.send(command);

          documentUrls.push(fileUrl);
        }
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
        posterImages: posterUrls,
        documents: documentUrls,
        allowResponse: allowResponseBool,
      });

      // sending mails
      try {
        const emailsData = await Student.find({}).select("email");
        const emails = emailsData.map((item) => item.email);

        for (const email of emails) {
          try {
            await mailService.sendEmail(
              email,
              "Test email - New Event Alert",
              title,
              `
                    <h2>Event Details:</h2>
                    <p><strong>Title:</strong> ${title}</p>
                    <p><strong>Description:</strong> ${description}</p>
                    <p><strong>Team:</strong> ${team ? "Yes" : "No"}</p>
                    <p><strong>Team Min Size:</strong> ${teamMinSize}</p>
                    <p><strong>Team Max Size:</strong> ${teamMaxSize}</p>
                    <p><strong>Event Start Date:</strong> ${eventStartDate}</p>
                    <p><strong>Event End Date:</strong> ${eventEndDate}</p>
                    <p><strong>Contact:</strong> ${contact}</p>
                    `
            );
            console.log(`Email sent successfully to: ${email}`);
          } catch (error) {
            console.error(`Error sending email to ${email}:`, error);
          }
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }

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

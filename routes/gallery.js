const express = require("express");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const uuid = require("uuid");
const router = express.Router();

const { ensureAuthenticated, isFaculty, isStudent } = require("../config/auth");
const Gallery = require("../models/Gallery");

router.get("/create-gallery", ensureAuthenticated, isFaculty, (req, res) => {
  return res.render("faculty/createGallery", { user: req.user });
});

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
  "/create-gallery",
  ensureAuthenticated,
  isFaculty,
  upload.single("coverImage"), // Changed to upload.single('coverImage') for single file upload
  async (req, res) => {
    const coverImage = req.file; // Changed to req.file for single file upload

    if (!coverImage) {
      return res.status(400).send("No cover image uploaded.");
    }

    const fileName = coverImage.originalname;
    const fileId = uuid.v4(); // Generate UUID for fileId
    const fileUrl = `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/${fileId}_${fileName}`;

    // Upload image to S3
    const params = {
      Bucket: process.env.BUCKET,
      Key: fileId + "_" + fileName,
      Body: coverImage.buffer,
      ACL: "public-read",
      ContentType: coverImage.mimetype,
      ContentDisposition: "inline",
    };

    try {
      const command = new PutObjectCommand(params);
      await s3.send(command);
      console.log(fileUrl);

      const gallery = new Gallery({
        title: req.body.title,
        description: req.body.description,
        coverImage: fileUrl, // Use fileUrl directly for single file upload
      });

      const saved = await gallery.save();
      console.log("Gallery Added Successfully", saved);
      req.flash("success_msg", "Gallery Added Successfully");
      return res.redirect("/gallery/create-gallery");
    } catch (error) {
      console.error("Error saving gallery data:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);


router.get('/view-gallery',ensureAuthenticated,isStudent,(req,res)=>{
    return res.render('student/gallery',{user:req.user})
})

module.exports = router;

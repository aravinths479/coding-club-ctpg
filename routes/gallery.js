const express = require("express");
const router = express.Router();

const { ensureAuthenticated, isFaculty } = require("../config/auth");
const Gallery = require("../models/Gallery");

router.get("/create-gallery", ensureAuthenticated, isFaculty, (req, res) => {
  return res.render("faculty/createGallery", { user: req.user });
});

router.post(
  "/create-gallery",
  ensureAuthenticated,
  isFaculty,
  async (req, res) => {
    const gallery = new Gallery({
      title: req.body.title,
      description: req.body.description,
      coverImage: [""],
    });
    gallery
      .save()
      .then((saved) => {
        console.log("Gallery Added Successfully", saved);
        req.flash("success_msg", "Gallery Added Successfully");
        return res.redirect("/gallery/create-gallery");
      })
      .catch((error) => {
        console.error("Error saving gallery data:", error);
        res.status(500).send("Internal Server Error");
      });
  }
);

module.exports = router;

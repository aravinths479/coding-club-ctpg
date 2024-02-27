const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Load User models
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

const {
  forwardAuthenticated,
  ensureAuthenticated,
  isFaculty,
} = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) =>
  res.render("login", { message: "" })
);

// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

// Register
router.post("/register", (req, res) => {
  const { name, email, password, password2, role } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2 || !role) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    const User = role === "student" ? Student : Faculty;

    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post("/login/:role", (req, res, next) => {
  if (req.params.role == "student") {
    passport.authenticate("student", {
      successRedirect: "/studentDashboard",
      failureRedirect: "/users/login",
      failureFlash: true,
    })(req, res, next);
  }
  if (req.params.role == "faculty") {
    passport.authenticate("faculty", {
      successRedirect: "/facultyDashboard",
      failureRedirect: "/users/login",
      failureFlash: true,
    })(req, res, next);
  }
});

router.get(
  "/get-all-users",
  ensureAuthenticated,
  isFaculty,
  async (req, res) => {
    try {
      const Users = await Faculty.find({ isAdmin:false});
      console.log(Users);
      return res.render("faculty/ListAdminUsers", {
        user: req.user,
        users: Users,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get("/add-user-by-admin", ensureAuthenticated, isFaculty, (req, res) => {
  return res.render("faculty/addUser", { user: req.user });
});

router.post(
  "/add-user-by-admin",
  ensureAuthenticated,
  isFaculty,
  async (req, res) => {
    try {
      console.log(req.body);
      const isFacultyAlreadyExists = await Faculty.find({
        email: req.body.email,
      });
      console.log(isFacultyAlreadyExists);
      if (isFacultyAlreadyExists.length != 0) {
        req.flash("error_msg", "User Already Exists");
        return res.redirect("/users/add-user-by-admin");
      } else {
        const facultyCreate = await Faculty.create({
          name: req.body.name,
          email: req.body.email,
        });
        console.log(facultyCreate);
        req.flash("success_msg", "New User Added With Admin Level Permissions");
        return res.redirect("/users/add-user-by-admin");
      }
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  "/remove-user/:id",
  ensureAuthenticated,
  isFaculty,
  async (req, res) => {
    try {
      const id = req.params.id;
      await Faculty.deleteOne({ _id: id });
      req.flash("success_msg", "User Deleted Sucessfully");
      return res.redirect("/users/get-all-users");
    } catch (err) {
      console.log(err);
      req.flash("error_msg", "Action Failed");
      return res.redirect("/users/get-all-users");
    }
  }
);

router.get(
  "/get-students",
  ensureAuthenticated,
  isFaculty,
  async (req, res) => {
    try {
      const firstYear = await Student.find({ year: 1 }).sort({ name: "asc" });
      const secondYear = await Student.find({ year: 2 }).sort({ name: "asc" });
      const thirdYear = await Student.find({ year: 3 }).sort({ name: "asc" });
      const fourthYear = await Student.find({ year: 4 }).sort({ name: "asc" });
      const fifthYear = await Student.find({ year: 5 }).sort({ name: "asc" });
      console.log(firstYear);
      return res.render("faculty/listStudents", {
        user: req.user,
        firstYear,
        secondYear,
        thirdYear,
        fourthYear,
        fifthYear,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get("/change-password", ensureAuthenticated, isFaculty, (req, res) => {
  return res.render("faculty/changePassword", { user: req.user });
});

router.post(
  "/change-password",
  ensureAuthenticated,
  isFaculty,
  async (req, res) => {
    const { newPassword, confirmNewPassword } = req.body;
    const facultyId = req.user._id;

    try {
      const faculty = await Faculty.findById(facultyId);

      if (!faculty) {
        req.flash("err_msg", "faculty not found in Database");
        return res.redirect("/users/change-password");
      }

      if (newPassword !== confirmNewPassword) {
        req.flash("err_msg", "New Passwords do not match");
        return res.redirect("/users/change-password");
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the student's password
      faculty.password = hashedPassword;
      await faculty.save();

      req.flash("success_msg", "New Password Set Successfully");
      res.redirect("/users/change-password"); // Redirect to profile page after successful password change
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;

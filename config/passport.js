const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Load Student and Faculty models
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

module.exports = function (passport) {
  passport.use(
    "student",
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match student
      Student.findOne({
        email: email
      }).then((student) => {
        if (!student) {
          return done(null, false, { message: "That email is not registered as a student" });
        }

        // Match password
        bcrypt.compare(password, student.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, student);
          } else {
            return done(null, false, { message: "Password incorrect" });
          }
        });
      });
    })
  );

  passport.use(
    "faculty",
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match faculty
      Faculty.findOne({
        email: email
      }).then((faculty) => {
        if (!faculty) {
          return done(null, false, { message: "That email is not registered as a faculty" });
        }

        // Match password
        bcrypt.compare(password, faculty.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, faculty);
          } else {
            return done(null, false, { message: "Password incorrect" });
          }
        });
      });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    // Deserialize based on whether it's a student or faculty
    Student.findById(id, function (err, student) {
      if (student) {
        return done(err, student);
      } else {
        Faculty.findById(id, function (err, faculty) {
          done(err, faculty);
        });
      }
    });
  });
};

const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require("passport");
const bcrypt = require("bcryptjs");

const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

module.exports = function (passport) {
  passport.use(
    "student",
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match student
      Student.findOne({
        email: email,
      }).then((student) => {
        if (!student) {
          return done(null, false, {
            message: "That email is not registered as a student",
          });
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
        email: email,
      }).then((faculty) => {
        if (!faculty) {
          return done(null, false, {
            message: "That email is not registered as a faculty",
          });
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

  passport.use(
    "google-student",
    new GoogleStrategy(
      {
        clientID: process.env.STUDENT_GOOGLE_CLIENT_ID,
        clientSecret: process.env.STUDENT_GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.STUDENT_GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async function (request, accessToken, refreshToken, profile, done) {
        const email = profile.emails[0].value;

        // Check if email domain is 'kongu.edu' and 'msc' is present before the @ symbol
        const atIndex = email.indexOf("@");
        const domain = email.substring(atIndex + 1);
        if (!(domain === "kongu.edu" && email.includes("msc@"))) {
          // If email is not valid, return false with an error message
          return done(null, false, {
            message: 'Only kongu.edu emails with "msc" are allowed.',
          });
        }

        try {
          const userExists = await Student.findOne({ email });

          if (userExists) {
            // If user exists, return user object
            return done(null, userExists);
          } else {
            // If user does not exist, create new user object
            const newUser = new Student({
              email: email,
              password: "",
              name: profile.displayName,
              rollNumber: profile.family_name,
            });
            // Save new user object to database
            await newUser.save();
            // Return new user object
            return done(null, newUser);
          }
        } catch (error) {
          // Handle database error
          return done(error);
        }
      }
    )
  );

  passport.use(
    "google-faculty",
    new GoogleStrategy(
      {
        clientID: process.env.FACULTY_GOOGLE_CLIENT_ID,
        clientSecret: process.env.FACULTY_GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.FACULTY_GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async function (request, accessToken, refreshToken, profile, done) {
        const email = profile.emails[0].value;

        
        const userExists = await Faculty.findOne({
          email: profile.emails[0].value,
        });
        if (userExists) {
          // If user exists, return user object
          return done(null, userExists);
        } else {
          // If user does not exist, flash error message and return false
          return done(null, false, {
            message: 'Email not registered',
          });
        }
      }
    )
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

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

module.exports = function (passport) {
  // Local Strategy for Student (unchanged)

  // Local Strategy for Faculty (unchanged)

  // Google OAuth Strategy for Student
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
        try {
          let student = await Student.findOne({ email: profile.emails[0].value });
          if (student) {
            // If the email is found in the student collection, return the student object
            return done(null, student);
          }
          // If the email is not registered as a student, return false
          return done(null, false);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy for Faculty
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
        try {
          // Check if the email is already registered as a faculty
          let faculty = await Faculty.findOne({ email: profile.email });
          if (faculty) {
            // If the email is found in the faculty collection, return the faculty object
            return done(null, faculty);
          }
          // If the email is not registered as a faculty, return false
          return done(null, false);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize and deserialize users (unchanged)
};

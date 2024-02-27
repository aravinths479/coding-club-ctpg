// models/User.js
const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  isFaculty: {
    type: Boolean,
    default: true,
  },
  isAdmin : {
    default : false,
    type : Boolean
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Faculty = mongoose.model("Faculty", FacultySchema);

module.exports = Faculty;

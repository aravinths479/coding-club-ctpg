// models/User.js
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  year:{
    type : Number,
    default : 0
  },
  rollNumber : {
    type : String,
    default : "",
  },
  phoneNumber : {
    type : Number,
    default : null
  },
  leetcodeId : {
    type : String,
    default : ""
  },
  gitHub : {
    type : String,
    default : ""
  },
  isStudent: {
    type: Boolean,
    default: true,
  },
  adminAcces: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  darkMode : {
    type : Boolean,
    default : false
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;

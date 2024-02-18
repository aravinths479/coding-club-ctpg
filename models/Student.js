// models/User.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  adminAcces : {
    type : Boolean,
    default : false
  },
  isBlocked : {
    type : Boolean,
    default : false,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;

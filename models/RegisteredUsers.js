const mongoose = require("mongoose");

const RegisteredUsersSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  teamName: {
    type: String,
    required: false,
  },
  teamMembers: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        rollNo: {
          type: String,
          required: true,
        },
        year: {
          type: Number,
          required: true,
        },
        phoneNumber: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
      },
    ],
    required: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const RegisteredUsers = mongoose.model(
  "RegisteredUsers",
  RegisteredUsersSchema
);
module.exports = RegisteredUsers;

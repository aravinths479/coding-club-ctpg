const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  team: {
    type: Boolean,
    required: false,
  },
  teamMinSize: {
    type: Number,
    required: function () {
      return this.team === true;
    },
  },
  teamMaxSize: {
    type: Number,
    required: function () {
      return this.team === true;
    },
  },
  eventStartDate: {
    type: Date,
    required: true,
  },
  eventEndDate: {
    type: Date,
    required: true,
  },
  posterImages: {
    type: [String],
    required: false,
  },
  documents: {
    type: [String],
    required: false,
  },
  contact: {
    type: [String],
    required: false,
  },
  allowResponse: {
    type: Boolean,
    default: true,
  },
  googleSheetLink: {
    type: String,
    required: false,
  },
  isEventEnded : {
    type:Boolean,
    default : false
  },
  winners : {
    type : [String],
    required : false
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;

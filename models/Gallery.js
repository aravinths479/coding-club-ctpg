const mongoose = require('mongoose');


const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required : false
    },
    coverImage: {
        type: [String],
        required : true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});


const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;

const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "volunteer"
    },
    status: {
        type: String,
        default: "pending"
    },
    
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    }
    

})

const volunteer = mongoose.model("volunteers", volunteerSchema)
module.exports = volunteer

const mongoose = require("mongoose");

const afiSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    email:{
        type:String,
    },
    location:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"AFI"
    },
    status:{
        type:String,
        default:"pending"
    },
    assignedTo: {
        type: String,
        default: ""
    },
    assignmentNotes: {
        type: String,
        default: ""
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    declineNote: {
        type: String,
        default: ""
    },
    
})

const afi = mongoose.model("afi",afiSchema)
module.exports = afi

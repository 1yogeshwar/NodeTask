const mongoose = require("mongoose");

const empSchema = new mongoose.Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    confirmpassword: {
        type: String
    },
    lastActivity: {
        type: Date, // Store the last activity timestamp
        default: Date.now // Default value is the current date/time
    }
});

const empCollection = mongoose.model('empCollection', empSchema);

module.exports = empCollection;

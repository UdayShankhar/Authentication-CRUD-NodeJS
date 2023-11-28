const mongoose = require("mongoose");

const AddNewUserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AddNewUser", AddNewUserSchema);
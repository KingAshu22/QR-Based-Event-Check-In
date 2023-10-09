const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uniqueID: String,
  name: String,
  checkedIn: [
    {
      date: String,
      time: String,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);

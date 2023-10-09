const mongoose = require("mongoose");
const express = require("express");
const QRCode = require("qrcode");
const User = require("./models/User");
const Admin = require("./models/Admin");

mongoose.connect("mongodb://localhost:27017/navratri_event", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/register", (req, res) => {
  res.render("registration");
});

app.post("/registration", async (req, res) => {
  try {
    // Generate a unique ID (you can use a library for this)
    const name = req.body.name;

    // Create a new user record
    const user = new User({ name });
    await user.save();

    // Generate QR code
    const qrCodeData = `http://192.168.20.13:3000/checkin/${user._id}`;
    const qrCode = await QRCode.toDataURL(qrCodeData);

    res.render("success", { qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const admin = await Admin.findOne({ username });

  if (admin && admin.password === password) {
    res.render("registration");
  } else {
    res.render("home");
  }
});

app.get("/checkin/:uniqueID", async (req, res) => {
  try {
    const uniqueID = req.params.uniqueID;
    const today = new Date().toLocaleDateString();
    console.log(today);

    // Check if the user has already checked in today
    const user = await User.findOne({ _id: uniqueID });
    if (
      user.checkedIn.length > 0 &&
      user.checkedIn[user.checkedIn.length - 1].date === today
    ) {
      res.render("already-check-in", {
        user: user,
      });
    } else {
      // Record the check-in
      user.checkedIn.push({
        date: today,
        time: new Date().toLocaleTimeString(),
      });

      await user.save();
      res.render("check-in", {
        user: user,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/qr-scanner", (req, res) => {
  res.render("verify");
});

app.post("/lookup", (req, res) => {
  const qrContent = req.body.qrContent;
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

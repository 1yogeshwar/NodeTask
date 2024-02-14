const express = require('express');
const path = require("path");
const nodemailer = require('nodemailer');
const app = express();

// Importing the empCollection model
const empCollection = require('./models/model');

const staticPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, '../tamplates/views');

app.use(express.static(staticPath));

require("./db/conn");

app.set('view engine', 'ejs');
app.set('views', templatePath);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// app.get("/", function(req, res) {
//     res.render("home");
// });

app.get("/register", function(req, res) {
    res.render("register");
});


app.get("/", function(req, res) {
  res.render("home", { message: "" });
});


const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'evalyn.keeling@ethereal.email',
      pass: 'xGSjJsGpFV4YU4c6bQ'
  }
});

app.post('/empdata', async function(req, res) {
  try {
      const password = req.body.password;
      const cpassword = req.body.confirmpassword;

      // Check if password matches confirm password
      if (password !== cpassword) {
          console.log("Password is not matching");
          return res.status(400).send("Password is not matching");
      }

      // Check if the user already exists (by email)
      const existingUser = await empCollection.findOne({ email: req.body.email });
      
      if (existingUser) {
          // User exists, update last login date
          existingUser.lastLogin = new Date();
          await existingUser.save();

          const lastLoginDaysAgo = new Date(existingUser.lastLogin);
          lastLoginDaysAgo.setDate(lastLoginDaysAgo.getDate() - 5);

          if (existingUser.lastLogin > lastLoginDaysAgo) {
              console.log("This is an active user");
              return res.render("home", { message: "This is active user" });
          } else {
              console.log("This is an Inactive user");
              return res.render("home", { message: "This is Inactive user" });
          }
      } else {
          // New user, save registration date
          const registrationDate = new Date();
          const empData = new empCollection({
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              email: req.body.email,
              password: password,
              confirmpassword: cpassword,
              registrationDate: registrationDate, // Save registration date
              lastLogin: registrationDate // Set last login as registration date
          });
          await empData.save();

          console.log("This is a new user");

          // Send registration email
          const mailOptions = {
            from: 'yogeshwarverma08@gmail.com',
            to: req.body.email,
            subject: 'Welcome to Our Platform',
            text: 'Thank you for registering with us!'
          };

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.error("Error sending email:", error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          return res.render("home", { message: "This is a new user" });
      }
  } catch (error) {
      console.error("Error processing user data:", error);
      return res.status(500).send("Error processing user data");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});

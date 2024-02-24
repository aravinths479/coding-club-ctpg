const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
require('dotenv').config();


const app = express();

// Passport Config
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").mongoURI;


// db connect
function connectToMongoDB() {
  mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
      console.log("Reconnecting to MongoDB...");
      // Retry connection
      setTimeout(connectToMongoDB, 2500); // Retry after 2.5 seconds
    });
}
// Call the function to initiate the connection
connectToMongoDB();

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

const AdminBro = require("admin-bro");
const AdminBroMongoose = require("admin-bro-mongoose");
const AdminBroExpress = require("@admin-bro/express");

const Student = require("./models/Student");
const Faculty = require("./models/Faculty");
const Event = require("./models/Event.js");
const RegisteredUsers = require("./models/RegisteredUsers.js");

AdminBro.registerAdapter(AdminBroMongoose);

const admin = new AdminBro({
  resources: [Student, Faculty, Event, RegisteredUsers],
  rootPath: "/admin",
});

const router = AdminBroExpress.buildRouter(admin);

// node database adminstartion
app.use(admin.options.rootPath, router);

app.use("/", require("./routes/index.js"));
app.use("/users", require("./routes/users.js"));
app.use("/event", require("./routes/event.js"));
app.use('/student',require('./routes/student.js'))

// process.on('warning', (warning) => {
//   console.log(warning.stack);
// });

const PORT = process.env.PORT || 4000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");

const prisma = require("./config/db");
const { sendError } = require("./utils/apiResponse");

const app = express();

// ===================
// VIEW ENGINE (EJS)
// EJS SETUP
// ===================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// EJS Layouts
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// ===================
// MIDDLEWARE
// ===================
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

// ===================
// GLOBAL VARIABLES
// ===================
// app.use((req, res, next) => {
//   res.locals.flashMessages = {
//     success: req.flash("success"),
//     error: req.flash("error"),
//   };
//   res.locals.admin = req.session.adminId || null;
//   next();
// });

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  res.locals.info_msg = req.flash("info");
  res.locals.warning_msg = req.flash("warning");
  res.locals.currentPath = req.originalUrl;
  res.locals.admin = req.session.adminId || null;
  res.locals.adminUser = req.session.admin || null;

  next();
});
// ===================
// STATIC FILES
// ===================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ===================
// ROUTES
// ===================
app.use("/admin", require("./routes/admin"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/admissions", require("./routes/api/admissions"));
app.use("/api/gallery", require("./routes/api/gallery"));

app.get("/", (req, res) => res.redirect("/admin/login"));

// ===================
// ERROR HANDLER
// ===================
app.use((err, req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return sendError(res, err.message, null, 500);
  }
  res.status(500).send(err.message);
});

// ===================
// START SERVER
// ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

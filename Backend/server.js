const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

//Setup Socket IO with Express
const socketIO = require("socket.io");
const server = require("http").createServer(app);
const io = socketIO(server);
const messaging = require("./modules/messaging/message")(io);

//Set View Engine and Static Directory Path
const publicDirectoryPath = path.join(__dirname, "./public");
app.use(express.static(publicDirectoryPath));
app.use("/uploads", express.static("uploads"));
app.set("view engine", "ejs");

//Set view directories
app.set("views", [
  path.join(__dirname, "views"),
  path.join(__dirname, "views/admin/"),
  path.join(__dirname, "views/employer/"),
  path.join(__dirname, "views/creative/"),
  path.join(__dirname, "views/connection/"),
  path.join(__dirname, "views/member/"),
]);

//Import routes
const authRouter = require("./routes/authRouter");
const adminRouter = require("./routes/adminRouter");
const creativeJobRouter = require("./routes/creativeJobRouter");
const creativePortfolioRouter = require("./routes/creativePortfolioRouter");
const employerRouter = require("./routes/employerRouter");
const connectionRouter = require("./routes/connectionRouter");
const profileRouter = require("./routes/profileRouter");
const messageRouter = require("./routes/messageRouter");

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Use Routers
app.use("/", authRouter);
app.use("/admin", adminRouter);
app.use("/creative", creativeJobRouter);
app.use("/portfolio", creativePortfolioRouter);
app.use("/employer", employerRouter);
app.use("/connection", connectionRouter);
app.use("/profile", profileRouter);
app.use("/message", messageRouter);

app.get("*", (req, res) => {
  res.json("Not Allowed");
});

server.listen(3000, () => {
  console.log("Listening on Port 3000");
});

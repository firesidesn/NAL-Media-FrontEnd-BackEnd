const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { checkOrigin } = require("../modules/config/checkOrigin");
const { compareAndQueryData, addData } = require("../modules/config/dbConfig");
const verifyToken = require("../modules/authentication/verifyToken");

router.get("/", verifyToken, (req, res) => {
  res.redirect("/dashboard");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/login", (req, res) => {
  res.render("login", { message: "Please Login!" });
});

router.post("/signup", async (req, res) => {
  //Check if user already Exists
  const userExists = await compareAndQueryData("users", "email", `${req.body.email}`);
  if (userExists.length > 0) return res.status(400).render("login", { message: "Email Already Exists" });

  //Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password.toString(), salt);

  //Creating new user
  const user = {
    firstName: req.body.firstName.toString(),
    lastName: req.body.lastName.toString(),
    email: req.body.email.toString().toLowerCase(),
    password: hashedPassword,
    type: req.body.type.toString(), // Type: {Employer, Creative, Admin}
    status: "pending",
    date: Date.now(),
  };
  try {
    await addData("users", user);
    res.render("login", { message: "Signup Successful, Please Login!" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  //Check if user is in DataBase
  const user = await compareAndQueryData("users", "email", `${req.body.email}`);
  if (user.length < 1) return res.status(400).render("login", { message: "Invalid Email" });

  //Check for valid password
  const validPassword = await bcrypt.compare(req.body.password, user[0].info.password);
  if (!validPassword) return res.status(400).render("login", { message: "Invalid Password" });

  //If everything is valid Create and assign a token. Token Expires in 12 hours
  const accessToken = jwt.sign(
    { id: user[0].id, type: user[0].info.type, status: user[0].info.status },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "6000s", //"43200s 12 hours",
    }
  );
  res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "strict" }).redirect("/dashboard");

  //Save accessToken to Client's Browser Cookie and Redirect to Dashboard
  //res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict" }).redirect("/dashboard");
});

router.get("/dashboard", verifyToken, (req, res) => {
  if (req.user.type === "Creative") res.redirect("/creative/dashboard");
  else if (req.user.type === "Employer") res.redirect("/employer/dashboard");
  else if (req.user.type === "Admin") res.redirect("/admin/dashboard");
});

router.get("/logout", async (req, res) => {
  //Saving user token to DataBase as Invalid token logout
  const token = req.cookies.accessToken;
  const invalidTokens = { invalidToken: token };

  try {
    await addData("invalidTokens", invalidTokens);
    res.render("login", { message: "You are Logged Out!" });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;

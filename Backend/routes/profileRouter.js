const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const verifyToken = require("../modules/authentication/verifyToken");
const { verifyActive } = require("../modules/authentication/verifyAuthorization");
const { queryByID, updateData } = require("../modules/config/dbConfig");
const { isPending, isSent, isFriend } = require("../modules/connection/manageConnection");
const { userFeed } = require("../modules/feed/userFeed");

router.get("/", verifyToken, verifyActive, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  let profile = await queryByID("users", req.query.id);

  //check if user is active
  if (profile.status !== "active") return res.redirect("/");

  //If viewing own Profile
  if (req.query.id === req.user.id) return res.render("viewOwnProfile", { profile, id: req.user.id });

  //Check if Request is Pending
  let check = await isPending(req.user.id, req.query.id);
  if (check)
    return res.render("viewOthersProfile", {
      profile,
      link: "/connection/accept",
      id: check,
      message: "Accept Request",
    });

  //Check if Request is Sent
  check = await isSent(req.user.id, req.query.id);
  if (check)
    return res.render("viewOthersProfile", {
      profile,
      link: "",
      id: req.query.id,
      message: "Your Connection Request is Pending",
    });

  //Check if Already Friend
  check = await isFriend(req.user.id, req.query.id);
  if (check)
    return res.render("viewOthersProfile", {
      profile,
      link: "connection/remove",
      id: check,
      message: "Remove Connection",
    });

  //If no previous connection History
  res.render("viewOthersProfile", { profile, link: "/connection/add", id: req.query.id, message: "Add Connection" });
});

router.get("/edit", verifyToken, verifyActive, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  if (req.user.id !== req.query.id) return res.redirect("/");
  let profile = await queryByID("users", req.query.id);
  res.render("editProfile", { profile });
});

router.post("/edit", verifyToken, verifyActive, async (req, res) => {
  let data = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
  };
  await updateData("users", req.user.id, data);
  res.redirect(`/profile?id=${req.user.id}`);
});

router.get("/editPassword", verifyToken, verifyActive, async (req, res) => {
  const message = "";
  res.render("editPassword", { message });
});

router.post("/editPassword", verifyToken, verifyActive, async (req, res) => {
  const user = await queryByID("users", req.user.id);
  const validPassword = await bcrypt.compare(req.body.oldPass, user.password);
  if (!validPassword) return res.status(400).render("editPassword", { message: "Invalid Old Password" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.newPass.toString(), salt);
  await updateData("users", req.user.id, { password: hashedPassword });
  res.render("editPassword", { message: "Password Updated!" });
});

router.get("/feed", verifyToken, verifyActive, async (req, res) => {
  const feed = await userFeed(req.user.id);
  const jobs = feed.jobs;
  const portfolios = feed.portfolio;
  const mutualConnection = feed.mutualConnection;
  //res.json(mutualConnection);
  res.render("userFeed", { jobs, portfolios, mutualConnection });
});

module.exports = router;

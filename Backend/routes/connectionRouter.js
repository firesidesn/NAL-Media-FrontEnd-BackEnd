const express = require("express");
const router = express.Router();

const { allActiveMembers, newRequest, sentRequest, acceptedReq } = require("../modules/connection/manageConnection");
const { addData, updateData, removeData } = require("../modules/config/dbConfig");
const verifyToken = require("../modules/authentication/verifyToken");
const { verifyActive } = require("../modules/authentication/verifyAuthorization");

router.get("/", verifyToken, verifyActive, async (req, res) => {
  const members = await allActiveMembers(req.user.id);
  res.render("allMembers", { members, mID: req.user.id });
});

router.get("/add", verifyToken, verifyActive, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  let data = { memberID: req.user.id, friendID: req.query.id, status: "0", date: Date.now() };
  try {
    await addData("Connections", data);
    res.redirect("/connection");
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/manage", verifyToken, verifyActive, async (req, res) => {
  let newReq = await newRequest(req.user.id);
  let acceptedConnection = await acceptedReq(req.user.id);
  let sentReq = await sentRequest(req.user.id);
  res.render("manageConnection", { newReq, acceptedConnection, sentReq });
});

router.get("/accept", verifyToken, verifyActive, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  await updateData("Connections", req.query.id, { status: "1" });
  res.redirect("/connection/manage");
});

router.get("/remove", verifyToken, verifyActive, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  await removeData("Connections", req.query.id);
  res.redirect("/connection/manage");
});

module.exports = router;

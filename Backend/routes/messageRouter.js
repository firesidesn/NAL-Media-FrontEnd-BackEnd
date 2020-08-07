const express = require("express");
const router = express.Router();

const verifyToken = require("../modules/authentication/verifyToken");
const { verifyActive } = require("../modules/authentication/verifyAuthorization");
const { queryByID, addData, compareAndQueryData, compareAndSortData } = require("../modules/config/dbConfig");

router.get("/", verifyToken, verifyActive, async (req, res) => {
  const sent = await compareAndQueryData("messages", "from", req.user.id);
  const received = await compareAndQueryData("messages", "to", req.user.id);

  //get all communication history
  let all = sent.concat(received);
  all = all.sort((a, b) => (a.info.time > b.info.time ? 1 : -1));
  let others = new Set();
  let otherMembers = [];

  //get list of messages
  all.forEach((element) => {
    if (element.info.from !== req.user.id) others.add(element.info.from);
    if (element.info.to !== req.user.id) others.add(element.info.to);
  });

  //get other people's info
  for (let elements of others) {
    let member = await queryByID("users", elements);
    let info = { name: member.firstName + " " + member.lastName, id: elements };
    otherMembers.push(info);
  }
  if (otherMembers.length < 1)
    return res.render("messages", { otherMembers, id: req.user.id, message: "No Message History to Show" });
  res.render("messages", { otherMembers, id: req.user.id, message: "" });
});

router.get("/chat", verifyToken, verifyActive, async (req, res) => {
  if (!req.query.id || !req.query.mID) return res.redirect("/");

  //check if both accounts are active
  const statusA = await queryByID("users", req.query.id);
  const statusB = await queryByID("users", req.query.mID);
  if (statusA.status !== "active" || statusB.status !== "active") return res.redirect("/");

  //If everything is good
  if (req.query.id === req.user.id || req.query.mID === req.user.id) {
    const cID = req.user.id > req.query.id ? req.user.id + "+" + req.query.id : req.query.id + "+" + req.user.id;
    const user = await queryByID("users", req.user.id);
    const userName = user.firstName + " " + user.lastName;

    const checkDB = await compareAndSortData("messages", "cID", cID, "time", "asc", 500);
    if (checkDB.length < 1) {
      const toDB = { cID, mID: "NAL Media", message: "No More Messages", time: Date.now() };
      await addData("messages", toDB);
    }

    res.render("chat", { cID, userName, checkDB, from: req.user.id, to: req.query.id });
  } else return res.redirect("/");
});

module.exports = router;

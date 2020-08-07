const express = require("express");
const router = express.Router();

const { getData, compareAndQueryData, addData, queryByID, multipleQuery } = require("../modules/config/dbConfig");
const verifyToken = require("../modules/authentication/verifyToken");
const { verifyActive, verifyCreative } = require("../modules/authentication/verifyAuthorization");
const { newRequest } = require("../modules/connection/manageConnection");

router.get("/dashboard", verifyToken, verifyActive, verifyCreative, async (req, res) => {
  //find user in DataBase
  user = await queryByID("users", `${req.user.id}`);
  //send Custom user Page to Client
  let reqCount = await newRequest(req.user.id);
  if (reqCount.length > 0) {
    return res.render("creativeDashboard", {
      message: `Welcome ${user.firstName}`,
      info: `You Have ${reqCount.length} New Connection Request`,
      id: req.user.id,
    });
  }
  res.render("creativeDashboard", { message: `Welcome ${user.firstName}`, info: "", id: req.user.id });
});

router.get("/jobs", verifyToken, verifyActive, verifyCreative, async (req, res) => {
  const allJobs = await getData("jobs");

  //Check if the employer account is active
  const jobs = [];
  for (let i = 0; i < allJobs.length; i++) {
    let status = await queryByID("users", `${allJobs[i].info.postedBy}`);
    if (status.status === "active") jobs.push(allJobs[i]);
  }
  res.render("jobs", { message: "Available Jobs", jobs });
});

router.get("/applied", verifyToken, verifyActive, verifyCreative, async (req, res) => {
  const employer = await queryByID("jobs", `${req.query.id}`);
  const creative = await queryByID("users", `${req.user.id}`);
  const creativeName = creative.firstName + " " + creative.lastName;
  let data = {
    creativeID: req.user.id,
    creativeName: creativeName,
    jobID: req.query.id,
    title: req.query.title,
    postedBy: employer.postedBy,
    date: Date.now(),
  };

  try {
    await addData("appliedJobs", data);
    res.redirect("/creative/jobs");
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/appliedJobs", verifyToken, verifyActive, verifyCreative, async (req, res) => {
  const jobs = await compareAndQueryData("appliedJobs", "creativeID", req.user.id);
  res.render("appliedJobs", { message: "Applied Jobs", jobs });
});

router.get("/viewJob", verifyToken, verifyActive, async (req, res) => {
  const job = await queryByID("jobs", `${req.query.id}`);
  let message = "";
  const checkIfApplied = await multipleQuery("appliedJobs", "creativeID", req.user.id, "jobID", req.query.id);
  if (checkIfApplied.length > 0) message = "You have Already Applied to This Job";
  res.render("viewSingleJob", { message, job, jobID: req.query.id });
});

module.exports = router;

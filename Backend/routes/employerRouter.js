const express = require("express");
const router = express.Router();

const {
  compareAndQueryData,
  addData,
  queryByID,
  updateData,
  removeData,
  multipleQuery,
} = require("../modules/config/dbConfig");

const verifyToken = require("../modules/authentication/verifyToken");
const { verifyActive, verifyEmployer } = require("../modules/authentication/verifyAuthorization");
const { newRequest } = require("../modules/connection/manageConnection");

router.get("/dashboard", verifyToken, verifyActive, verifyEmployer, async (req, res) => {
  //find user in DataBase
  user = await queryByID("users", `${req.user.id}`);
  //send Custom user Page to Client
  let reqCount = await newRequest(req.user.id);
  if (reqCount.length > 0) {
    return res.render("employerDashboard", {
      message: `Welcome ${user.firstName}`,
      info: `You Have ${reqCount.length} New Connection Request`,
      id: req.user.id,
    });
  }
  res.render("employerDashboard", { message: `Welcome ${user.firstName}`, info: "", id: req.user.id });
});

router.get("/listing", verifyToken, verifyActive, verifyEmployer, async (req, res) => {
  const jobs = await compareAndQueryData("jobs", "postedBy", `${req.user.id}`);
  res.render("viewListing", { jobs });
});

router.get("/postJob", verifyToken, verifyActive, verifyEmployer, async (req, res) => {
  res.render("postJob", { message: "Post Job" });
});

router.get("/viewApplicants", verifyToken, verifyActive, verifyEmployer, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  const applicants = await multipleQuery("appliedJobs", "jobID", `${req.query.id}`, "postedBy", `${req.user.id}`);
  if (applicants.length < 1) return res.redirect("/employer/listing");
  console.log(applicants);
  res.render("viewApplicants", { applicants });
});

router.get("/editJob", verifyToken, verifyActive, verifyEmployer, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  const job = await queryByID("jobs", `${req.query.id}`);
  if (job.postedBy !== req.user.id) return res.redirect("/employer/listing");
  res.render("editJob", { message: "Edit Job", job: job, id: req.query.id });
});

router.get("/deleteJob", verifyToken, verifyActive, verifyEmployer, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  const job = await queryByID("jobs", `${req.query.id}`);
  if (job.postedBy !== req.user.id) return res.redirect("/employer/listing");
  await removeData("jobs", `${req.query.id}`);
  res.redirect("/employer/listing");
});

router.post("/postJob", verifyToken, verifyActive, verifyEmployer, async (req, res) => {
  let data = {
    title: req.body.title.toString(),
    description: req.body.description.toString(),
    qualification: req.body.qualification.toString(),
    link: req.body.url.toString(),
    date: Date.now(),
    postedBy: req.user.id,
  };
  try {
    await addData("jobs", data);
    res.render("postJob", { message: "Job Posted! Post Another?" });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/editJob", verifyToken, verifyActive, verifyEmployer, async (req, res) => {
  let data = {
    title: req.body.title.toString(),
    description: req.body.description.toString(),
    qualification: req.body.qualification.toString(),
    link: req.body.url.toString(),
    date: Date.now(),
    postedBy: req.user.id,
  };
  try {
    await updateData("jobs", req.body.id, data);
    res.redirect("/employer/listing");
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;

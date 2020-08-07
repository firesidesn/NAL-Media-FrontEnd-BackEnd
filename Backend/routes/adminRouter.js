const express = require("express");
const router = express.Router();

const {
  addData,
  getData,
  queryByID,
  compareAndQueryData,
  updateData,
  removeData,
} = require("../modules/config/dbConfig");

const verifyToken = require("../modules/authentication/verifyToken");
const { verifyActive, verifyAdmin } = require("../modules/authentication/verifyAuthorization");
const { allMembers } = require("../modules/connection/manageConnection");

router.get("/dashboard", verifyToken, verifyActive, verifyAdmin, async (req, res) => {
  const articles = await getData("adviceArticles");
  res.render("adminDashboard", { articles, id: req.user.id });
});

router.get("/manage", verifyToken, verifyActive, verifyAdmin, async (req, res) => {
  const members = await allMembers(req.user.id);
  res.render("memberList", { members });
});

router.get("/manageMember", verifyToken, verifyActive, verifyAdmin, async (req, res) => {
  if (!req.query.id) return res.redirect("/admin/manage");
  const profile = await queryByID("users", req.query.id);
  res.render("editMember", { profile, id: req.query.id });
});

router.post("/manageMember", verifyToken, verifyActive, verifyAdmin, async (req, res) => {
  const status = req.body.status;
  if (status === "active") {
    await updateData("users", req.body.id, { status: "active" });
    return res.redirect("/admin/manage");
  } else if (status === "suspended") {
    await updateData("users", req.body.id, { status: "suspended" });
    return res.redirect("/admin/manage");
  } else if (status === "featured") {
    const checkIfAlreadyFeatured = await compareAndQueryData("featuredMembers", "id", req.body.id);
    if (checkIfAlreadyFeatured.length > 0) return res.redirect("/admin/manage");
    const user = await queryByID("users", req.body.id);
    user.id = req.body.id;
    user.password = "";
    user.date = Date.now();
    await addData("featuredMembers", user);
    return res.redirect("/admin/manage");
  }
});

router.get("/addArticle", verifyToken, verifyActive, verifyAdmin, async (req, res) => {
  res.render("addArticle");
});

router.post("/addArticle", verifyToken, verifyActive, verifyAdmin, async (req, res) => {
  let data = { title: req.body.title.toString(), post: req.body.post.toString(), date: Date.now() };
  await addData("adviceArticles", data);
  res.redirect("/admin/dashboard");
});

router.get("/editArticle", verifyToken, verifyActive, verifyAdmin, async (req, res) => {
  const article = await queryByID("adviceArticles", req.query.id);
  res.render("editArticle", { article, id: req.query.id });
});

router.post("/editArticle", verifyToken, verifyActive, verifyAdmin, async (req, res) => {
  await updateData("adviceArticles", req.body.id, { title: req.body.title, post: req.body.post });
  res.redirect("/");
});

router.get("/deleteArticle", verifyToken, verifyActive, verifyAdmin, async (req, res) => {
  await removeData("adviceArticles", req.query.id);
  res.redirect("/");
});

module.exports = router;

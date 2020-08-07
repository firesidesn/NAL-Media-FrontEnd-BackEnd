const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads" });
const fs = require("fs");

const { updateData, removeData, compareAndQueryData, addData, queryByID } = require("../modules/config/dbConfig");
const verifyToken = require("../modules/authentication/verifyToken");
const { verifyActive, verifyCreative } = require("../modules/authentication/verifyAuthorization");

router.get("/", verifyToken, verifyActive, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  //Check if user is active
  const status = await queryByID("users", req.query.id);
  if (status.status !== "active") return res.redirect("/");

  if (req.user.id === req.query.id) {
    const message = "";
    const portfolios = await compareAndQueryData("creativePortfolio", "postedBy", `${req.user.id}`);
    return res.render("viewPortfolio", { portfolios, message });
  } else {
    const message = "";
    const otherPortfolio = await compareAndQueryData("creativePortfolio", "postedBy", `${req.query.id}`);
    return res.render("othersPortfolio", { portfolios: otherPortfolio, message });
  }
});

router.get("/add", verifyToken, verifyActive, verifyCreative, async (req, res) => {
  const portfolios = await compareAndQueryData("creativePortfolio", "postedBy", `${req.user.id}`);

  if (portfolios.length >= 6) {
    message = "You have already added Six portfolios";
    return res.render("viewPortfolio", { portfolios, message });
  }
  res.render("addPortfolio");
});

router.get("/edit", verifyToken, verifyActive, verifyCreative, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  const portfolio = await queryByID("creativePortfolio", `${req.query.id}`);
  if (portfolio.postedBy !== req.user.id) return res.redirect("/portfolio");
  res.render("editPortfolio", { message: "Edit Job", portfolio, id: req.query.id });
});

router.get("/delete", verifyToken, verifyActive, verifyCreative, async (req, res) => {
  if (!req.query.id) return res.redirect("/");
  const portfolio = await queryByID("creativePortfolio", `${req.query.id}`);
  if (portfolio.postedBy !== req.user.id) return res.redirect("/portfolio");
  const filePath = `./${portfolio.image}`;
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
  await removeData("creativePortfolio", `${req.query.id}`);
  res.redirect("/");
});

router.post("/", verifyToken, verifyActive, verifyCreative, upload.single("image"), async (req, res) => {
  let data = {
    title: req.body.title.toString(),
    description: req.body.description.toString(),
    image: req.file.path.toString(),
    link: req.body.url.toString(),
    date: Date.now(),
    postedBy: req.user.id,
  };
  try {
    await addData("creativePortfolio", data);
    res.redirect("/");
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/edit", verifyToken, verifyActive, verifyCreative, upload.single("image"), async (req, res) => {
  const portfolio = await queryByID("creativePortfolio", `${req.body.id}`);
  const filePath = `./${portfolio.image}`;
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  let data = {
    title: req.body.title.toString(),
    description: req.body.description.toString(),
    image: req.file.path.toString(),
    link: req.body.url.toString(),
    date: Date.now(),
    postedBy: req.user.id,
  };
  try {
    await updateData("creativePortfolio", req.body.id, data);
    res.redirect("/");
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;

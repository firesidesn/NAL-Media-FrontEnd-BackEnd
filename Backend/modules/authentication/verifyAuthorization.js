async function verifyActive(req, res, next) {
  if (req.user.status === "active") next();
  else if (req.user.status === "pending") return res.render("login", { message: "Your account is pending Approval!" });
  else if (req.user.status === "suspended") return res.render("login", { message: "Your account has been Suspended!" });
  else if (!req.user.status) return res.render("login", { message: "Account Not Found!" });
}

async function verifyCreative(req, res, next) {
  if (req.user.type === "Creative") next();
  else res.render("login", { message: "You are not a Creative!" });
}

async function verifyEmployer(req, res, next) {
  if (req.user.type === "Employer") next();
  else res.render("login", { message: "You are not an Employer!" });
}

async function verifyAdmin(req, res, next) {
  if (req.user.type === "Admin") next();
  else res.render("login", { message: "You are not an Admin!" });
}

module.exports = { verifyActive, verifyCreative, verifyEmployer, verifyAdmin };

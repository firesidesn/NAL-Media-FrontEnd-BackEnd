function checkOrigin(req, res, next) {
  let origin = req.get("origin");
  if (origin === "https://test-e8b512.webflow.io") next();
  let message = { "Request From": origin, status: "Access Denied!" };
  return res.json(message);
}

module.exports = { checkOrigin };

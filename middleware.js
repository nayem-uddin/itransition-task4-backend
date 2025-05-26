const db = require("./handleDb");
function errorMessage(action) {
  return `You can't perform any action, someone ${action} you. Redirecting to the home page...`;
}

async function verifyUserStatus(req, res, next) {
  try {
    const { userEmail } = req.body;
    const userDetails = await db.getUserByEmail(userEmail);
    if (!userDetails || userDetails?.length == 0) {
      return res.status(401).json({ message: errorMessage("deleted") });
    } else if (userDetails.status === "blocked") {
      return res.status(403).json({ message: errorMessage("blocked") });
    }
    req.userDetails = userDetails;
    next();
    res.status(200);
  } catch (err) {
    next(err);
  }
}
module.exports = { verifyUserStatus };

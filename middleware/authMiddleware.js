// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1]; // Extract JWT from header

//   if (!token) return res.status(401).json({ message: "Unauthorized access" });

//   try {
//     const decoded = jwt.verify(token, "harshisgoodboy");
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// module.exports = authMiddleware;


const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract JWT from header

  if (!token) return res.status(401).json({ message: "Unauthorized access" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Ensure the secret is correct
    req.user = decoded;  // Attach the decoded token data to the request object

    // Optionally, check if the email from token matches the email parameter
    if (req.query.email && req.query.email !== decoded.email) {
      return res.status(403).json({ message: "Forbidden: Email mismatch" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};


module.exports = authMiddleware;

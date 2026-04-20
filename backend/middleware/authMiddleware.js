import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ROLES from "../constants/roles.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      console.log("Authenticated User:", req.user);
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

const doctorOnly = (req, res, next) => {
  if (req.user?.role !== ROLES.DOCTOR) {
    return res.status(403).json({ message: "Access denied: doctor only" });
  }
  console.log("Checking Role:", req.user?.role);  // Add this
  next();
};

const patientOnly = (req, res, next) => {
  if (req.user?.role !== ROLES.PATIENT) {
    return res.status(403).json({ message: "Access denied: patient only" });
  }
  console.log("Checking Role:", req.user?.role);  // Add this
  next();
};

export { protect, doctorOnly, patientOnly };

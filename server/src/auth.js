import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("JWT_SECRET environment variable is not set");

export const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    SECRET,
    { expiresIn: "7d" }
  );

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};

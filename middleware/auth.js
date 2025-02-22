import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log("Authorization Header Received:", authHeader); // Debugging

    if (!authHeader?.startsWith('Bearer ')) {
      console.log("No token provided.");
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log("Extracted Token:", token); // Debugging

    if (!token) {
      console.log("Token missing.");
      return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging

    // Define roles in eDoc project
    const roles = ['patientId', 'doctorId', 'adminId'];
    const role = roles.find((r) => decoded[r]);

    if (!role) {
      console.log("Invalid token payload.");
      return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
    }

    // Attach user details to req.auth
    req.auth = { id: decoded[role], role: role.replace('Id', '') };
    console.log("Authenticated User:", req.auth); // Debugging

    next();
  } catch (error) {
    console.log("Invalid or expired token.");
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

export default auth;

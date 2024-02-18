import { Request, Response, NextFunction } from 'express';
import Admin from '../../models/adminModel';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from the HttpOnly cookie
    const token = req.cookies.admin_auth_token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "Unauthorized: Token not found",
      });
    }

    // Verify token and decode user information
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Find user by userId from decoded token
    const admin = await Admin.findById(decoded.id as string);

    // Check if user exists and is an admin
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({
        status: "Failed",
        message: "Unauthorized: You do not have sufficient privileges to perform this operation.",
      });
    }

    // Attach user object to the request for further use
    (req as any).locals = { admin };

    // Proceed to the next middleware
    next();
  } catch (error) {
    return res.status(401).json({
      status: "Failed",
      message: "Invalid token",
    });
  }
};

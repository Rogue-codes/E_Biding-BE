import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Admin, { TAdmin } from "../../models/adminModel";

declare global {
  namespace Express {
    interface Request {
      admin: TAdmin;
    }
  }
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["admin_auth_token"];
  if (!token) {
    return res.status(401).json({
      status: "Failed",
      message: "unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const decodedId = (decoded as JwtPayload).id
    const admin = await Admin.findById(decodedId);
    req.admin = admin as TAdmin;
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: "unauthorized" });
  }
};

export default verifyToken;

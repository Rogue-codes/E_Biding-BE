import { Request, Response } from "express";
import Admin from "../../models/adminModel";
import { genToken } from "../../helpers/genToken";

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { userName, firstName, lastName, email } = req.body;

    // check from missing details
    const missingFields: string[] = [];
    if (!firstName) {
      missingFields.push("firstName");
    }
    if (!lastName) {
      missingFields.push("lastName");
    }
    if (!userName) {
      missingFields.push("userName");
    }
    if (!email) {
      missingFields.push("email");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "Failed",
        message: `Missing Required fields: ${missingFields.join(",")}`,
      });
    }
    // check if email already exist
    const existingEmail = await Admin.findOne({
      email: email,
    });

    if (existingEmail) {
      return res.status(400).json({
        status: "Failed",
        message: `Email: ${email} already exists`,
      });
    }

    // check if userName already exist
    const existingUserName = await Admin.findOne({
      userName: userName,
    });

    if (existingUserName) {
      return res.status(400).json({
        status: "Failed",
        message: `username: ${userName} already exists`,
      });
    }
    const admin = new Admin(req.body);
    await admin.save();

    return res.status(200).json({
      status: "Success",
      message: "Admin created successfully",
      data: {
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        userName: admin.userName,
        id: admin._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "something went wrong",
    });
    console.log(error);
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;
    const missingFields: string[] = [];
    if (!userName) {
      missingFields.push("username");
    }
    if (!password) {
      missingFields.push("password");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "Failed",
        message: `Missing Required fields: ${missingFields.join(",")}`,
      });
    }

    // check if account with username exist
    const admin = await Admin.findOne({ userName });
    if (!admin) {
      return res.status(404).json({
        status: "Failed",
        message: "wrong username or password",
      });
    }

    // compare password
    const isPasswordValid = password === admin.password;
    if (!isPasswordValid) {
      return res.status(400).json({
        status: "Failed",
        message: "wrong username or password",
      });
    }

    // generate token and sign user in
    const token = genToken(admin._id);
    res.cookie("admin_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800000,
    });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        userName: admin.userName,
        id: admin._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "something went wrong",
    });
    console.log(error);
  }
};

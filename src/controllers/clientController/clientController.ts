import { Request, Response } from "express";
import Client, { TClient } from "../../models/clientModel";
import { genOTP } from "../../helpers/genOTP";
import bcrypt from "bcryptjs";
import {
  sendAdminWelcomeEmail,
  sendForgotPasswordEmail,
  sendPasswordResetSuccessEmail,
  sendVerificationCodeEmail,
} from "../../service/emailService/email";
import { genToken } from "../../helpers/genToken";
interface IClientBody {
  companyName: string;
  companyAddress: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  RcNumber: string;
  postalCode: boolean;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const createClient = async (req: Request, res: Response) => {
  try {
    const {
      companyName,
      companyAddress,
      phoneNumber,
      alternatePhoneNumber,
      RcNumber,
      postalCode,
      name,
      email,
      password,
      confirmPassword,
    }: IClientBody = req.body;

    const requiredFields = [
      "companyName",
      "companyAddress",
      "phoneNumber",
      "alternatePhoneNumber",
      "RcNumber",
      "postalCode",
      "name",
      "email",
      "password",
      "confirmPassword",
    ];

    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "Failed",
        message: `Missing Required fields: ${missingFields.join(", ")}`,
      });
    }

    // compare password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "Failed",
        message: "password and confirm password must match",
      });
    }

    // phone number and alternate phone number must not match
    if (phoneNumber === alternatePhoneNumber) {
      return res.status(400).json({
        status: "Failed",
        message: "Phone number and alternate phone number can not be the same",
      });
    }

    // check if company name exists
    const alreadyExistingCompanyName = await Client.findOne({
      companyName: companyName,
    });
    if (alreadyExistingCompanyName) {
      return res.status(400).json({
        status: "Failed",
        message: "Company name already exists",
      });
    }

    // check if phone number exists
    const alreadyExistingPhoneNumber = await Client.findOne({
      phoneNumber: phoneNumber,
    });
    if (alreadyExistingPhoneNumber) {
      return res.status(400).json({
        status: "Failed",
        message: "Phone number already exists",
      });
    }

    // check if alternate phone number exists
    const alreadyExistingAlternatePhoneNumber = await Client.findOne({
      alternatePhoneNumber: alternatePhoneNumber,
    });
    if (alreadyExistingAlternatePhoneNumber) {
      return res.status(400).json({
        status: "Failed",
        message: "Alternate Phone number already exists",
      });
    }

    // check if RC Number exists
    const alreadyExistingRcNumber = await Client.findOne({
      RcNumber: RcNumber,
    });
    if (alreadyExistingRcNumber) {
      return res.status(400).json({
        status: "Failed",
        message: "RC number already exists",
      });
    }

    // check if email exists
    const alreadyExistingEmail = await Client.findOne({
      email: email,
    });
    if (alreadyExistingEmail) {
      return res.status(400).json({
        status: "Failed",
        message: "Email already exists",
      });
    }

    // check if phone number is valid
    const validationArr = ["phoneNumber", "alternatePhoneNumber"];

    const validationErrors:string[] = [];

    validationArr.forEach((value) => {
      if (req.body[value].length !== 11) {
        validationErrors.push(`${value} must be 11 digits`);
      }
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "Failed",
        message: "Validation failed",
        errors: validationErrors
      });
    }

    /* 
    if none of the Unique values are present
    we go ahead and create a new client
    */

    // generate randone verification code.
    const verificationCode = genOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedVerificationCode = await bcrypt.hash(verificationCode, salt);

    // set verification code expires in to 10 mins
    const verifictaionCodeExpiration = new Date(
      Date.now() + 1000 * 60 * 60 * 24
    );

    const newClient: TClient = await Client.create({
      companyName,
      companyAddress,
      phoneNumber,
      alternatePhoneNumber,
      RcNumber,
      postalCode,
      name,
      email,
      password,
      cacDoc: req.file?.path,
      verificationCode: hashedVerificationCode,
      verificationCodeExpiresIn: verifictaionCodeExpiration,
    });

    // send verification code to email
    sendVerificationCodeEmail(email, verificationCode, name);
    // Create a new object without the password field
    res.status(201).json({
      status: "Success",
      message: "Registration successful",
      data: {
        companyName: newClient.companyName,
        companyAddress: newClient.companyAddress,
        phoneNumber: newClient.phoneNumber,
        alternatePhoneNumber: newClient.alternatePhoneNumber,
        RcNumber: newClient.RcNumber,
        postalCode: newClient.postalCode,
        name: newClient.name,
        email: newClient.email,
        cacDoc: newClient.cacDoc,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

export const verifyClientEmail = async (req: Request, res: Response) => {
  try {
    const {
      email,
      verificationCode,
    }: { email: string; verificationCode: string } = req.body;
    const requiredFields = ["email", "verificationCode"];

    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "Failed",
        message: `Missing Required fields: ${missingFields.join(", ")}`,
      });
    }

    //check if email exists
    const client = await Client.findOne({ email: email });
    if (!client) {
      return res.status(404).json({
        status: "Failed",
        message: `user with email ${email} does not exist`,
      });
    }

    // check if verification token has expired
    if (
      new Date(client?.verificationCodeExpiresIn as Date).getTime() < Date.now()
    ) {
      return res.status(400).json({
        status: "Failed",
        message: "Verification code has expired",
      });
    }

    //compare verification code
    const validCode = await bcrypt.compare(
      verificationCode,
      client.verificationCode as string
    );

    if (!validCode) {
      return res.status(400).json({
        status: "Failed",
        message: "Verification code is not valid",
      });
    }

    // set the isVerified boolean to true
    client.isVerified = true;
    client.verificationCode = null;
    client.verificationCodeExpiresIn = null;

    await client.save();

    sendAdminWelcomeEmail(email, client.name);

    res.status(200).json({
      status: "success",
      message: "account verified successfully.",
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

export const clientLogin = async (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;
    const requiredFields = ["email", "password"];

    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "Failed",
        message: `Missing Required fields: ${missingFields.join(", ")}`,
      });
    }

    //check if email exists
    const client = await Client.findOne({ email: email });

    if (!client) {
      return res.status(400).json({
        status: "Failed",
        message: "invalid credentials",
      });
    }

    const validPassword: boolean = await client.confirmPassword(password);
    if (!validPassword) {
      return res.status(400).json({
        status: "Failed",
        message: "invalid credentials",
      });
    }

    // generate token and sign user in
    const token = genToken(client._id);
    res.cookie("client_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800000,
    });

    res.status(200).json({
      status: "Success",
      message: "Login successful",
      data: {
        companyName: client.companyName,
        companyAddress: client.companyAddress,
        phoneNumber: client.phoneNumber,
        alternatePhoneNumber: client.alternatePhoneNumber,
        RcNumber: client.RcNumber,
        postalCode: client.postalCode,
        name: client.name,
        email: client.email,
        status: client.status,
      },
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({
        status: "Failed",
        message: "email is required",
      });

    // check if email exist in the request body
    const client = await Client.findOne({ email });

    if (!client)
      return res.status(404).json({
        status: "Failed",
        message: `client with email:${email} does not exist `,
      });

    // if the user exist
    const verification_code = genOTP();

    const salt = await bcrypt.genSalt(10);

    const hashedOTP = await bcrypt.hash(verification_code, salt);

    client.verificationCode = hashedOTP as string;
    client.verificationCodeExpiresIn = new Date(
      Date.now() + 1000 * 60 * 10
    ) as Date;

    client.save();

    sendForgotPasswordEmail(email, verification_code, client.name);

    res.status(200).json({
      status: "success",
      message: "A token has been sent to your email address",
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      confirm_password,
      verification_code,
    }: {
      email: string;
      password: string;
      confirm_password: string;
      verification_code: string;
    } = req.body;

    const requiredFields = [
      "email",
      "password",
      "confirm_password",
      "verification_code",
    ];
    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "failed",
        message: `Missing required field(s): ${missingFields.join(",")}`,
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        status: "failed",
        message: "password and confirm password must be the same",
      });
    }

    // get the user using the email address
    const client = await Client.findOne({ email });

    if (!client) {
      return res.status(404).json({
        status: "Failed",
        message: `Email: ${email} does not exist`,
      });
    }

    const validOTP = await bcrypt.compare(
      verification_code,
      client.verificationCode as string
    );

    if (!validOTP) {
      return res.status(400).json({
        status: "failed",
        message: "OTP is not valid",
      });
    }

    if (
      new Date(client.verificationCodeExpiresIn as Date).getTime() < Date.now()
    ) {
      return res.status(400).json({
        status: "failed",
        message: "verification code has expired",
      });
    }

    // Update the user's password and remove verification related fields
    client.password = password;
    client.verificationCode = null;
    client.verificationCodeExpiresIn = null;

    await client.save();

    // Send password reset success email after saving changes
    sendPasswordResetSuccessEmail(email, client.name);

    res.status(200).json({
      status: "success",
      message: "Password has been changed successfully",
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie("client_auth_token", "", {
    expires: new Date(0),
  });
};

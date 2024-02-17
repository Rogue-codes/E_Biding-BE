import { Request, Response } from "express";
import Client, { TClient } from "../../models/clientModel";
import { genOTP } from "../../helpers/genOTP";
import bcrypt from "bcryptjs";
import { sendVerificationCodeEmail } from "../../service/emailService/email";
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
    const { password: _, ...clientWithoutPassword } = newClient;
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

import { Request, Response } from "express";
import Client from "../../models/clientModel";

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
}

export const createClient = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
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
    }: IClientBody = req.body;

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


    const newClient = await Client.create({
      companyName,
      companyAddress,
      phoneNumber,
      alternatePhoneNumber,
      RcNumber,
      postalCode,
      name,
      email,
      password,
      cacDoc: req.file?.path
    });
    res.status(201).json({
      status: "Success",
      message: "Registration successful",
      data: newClient,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

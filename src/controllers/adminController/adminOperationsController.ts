import { Request, Response } from "express";
import Client from "../../models/clientModel";
import {
  sendAccountApprovedEmail,
  sendAccountRejectionEmail,
} from "../../service/emailService/email";
import fs from "fs";

export const getAllClients = async (req: Request, res: Response) => {
  try {
    let query = Client.find({ isVerified: true });

    // Check if there is a search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, "i");
      query = query.find({
        $or: [
          { companyName: searchRegex },
          { companyAddress: searchRegex },
          { phoneNumber: searchRegex },
          { alternatePhoneNumber: searchRegex },
          { RcNumber: searchRegex },
          { name: searchRegex },
          { email: searchRegex },
        ],
      });
    }

    const startDateString = req.query.startDate as string;
    const endDateString = req.query.endDate as string;

    // Check if there is a date range filter
    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);
      query = query.find({ createdAt: { $gte: startDate, $lte: endDate } });
    }

    if (!req.query.sort) {
      query = query.sort("-createdAt");
    }

    // pagination
    const pageQueryParam = req.query.page as string | number;

    // Parse as number and default to 1 if undefined
    const page: number =
      (typeof pageQueryParam === "string"
        ? parseInt(pageQueryParam, 10)
        : pageQueryParam) || 1;

    // Parse as number and default to 10 if undefined
    const limit: number = 8; // Set limit to 4

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const clientCount = await Client.countDocuments(query.getQuery());
    let last_page = Math.ceil(clientCount / limit); // Round up to the nearest integer
    if (req.query.page) {
      if (page > last_page) throw new Error("This page does not exist");
    }

    const allClients = await query.select("-__v,password");
    if (!allClients.length) {
      return res.status(200).json({
        status: "success",
        message: "No Clients Found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "All Clients retrieved successfully",
      data: allClients,
      meta: {
        per_page: limit,
        current_page: page,
        last_page: Math.ceil(last_page),
        total: clientCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: "Failed",
        message: "Id is required",
      });
    }

    const client = await Client.findById(id).select("-password");

    if (!client) {
      return res.status(404).json({
        status: "Failed",
        message: "Client not found",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "client retrieved successfully",
      data: client,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

export const approveClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "Failed",
        message: "Id is required",
      });
    }

    const client = await Client.findById(id).select("-password");

    if (!client) {
      return res.status(404).json({
        status: "Failed",
        message: "Client not found",
      });
    }

    if (client.status === "approved") {
      return res.status(400).json({
        status: "Failed",
        message: "account already approved",
      });
    }

    client.status = "approved";

    await client.save();

    sendAccountApprovedEmail(client.email, client.name);

    res.status(201).json({
      status: "Success",
      message: `${client.name}'s account Approved successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

export const rejectClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "Failed",
        message: "Id is required",
      });
    }

    const client = await Client.findById(id).select("-password");

    if (!client) {
      return res.status(404).json({
        status: "Failed",
        message: "Client not found",
      });
    }

    if (client.status === "approved") {
      return res.status(400).json({
        status: "Failed",
        message: "account already approved",
      });
    }

    await Client.findByIdAndDelete(id);

    sendAccountRejectionEmail(client.email, client.name);

    res.status(200).json({
      status: "Success",
      message: `${client.name}'s account rejected successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

export const downloadPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: "Failed",
        message: "Id is required",
      });
    }
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        status: "Failed",
        message: "Client not found",
      });
    }

    const filePath = `/uploads/${client.cacDoc}`;

    console.log("File Path:", filePath);


    if (!fs.existsSync(filePath)) {
      console.log(filePath)
      return res.status(404).json({
        status: false,
        message: "File not found",
      });
    }

    res.download(filePath, client.cacDoc, (err) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Unable to download the PDF file",
        });
      }
    });
  } catch (error:any) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

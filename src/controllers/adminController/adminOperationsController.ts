import { Request, Response } from "express";
import Client from "../../models/clientModel";

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
    const limitQueryParam = req.query.limit as string | number;

    // Parse as number and default to 1 if undefined
    const page: number =
      (typeof pageQueryParam === "string"
        ? parseInt(pageQueryParam, 10)
        : pageQueryParam) || 1;

    // Parse as number and default to 10 if undefined
    const limit: number =
      (typeof limitQueryParam === "string"
        ? parseInt(limitQueryParam, 10)
        : limitQueryParam) || 10;

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const clientCount = await Client.countDocuments(query.getQuery());
    const last_page = clientCount / limit;
    if (req.query.page) {
      if (page >= last_page) throw new Error("This page does not exist");
    }

    const allClients = await query.select("-__v");
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
  } catch (error:any) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

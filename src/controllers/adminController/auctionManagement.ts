import { Request, Response } from "express";
import Auction from "../../models/auctionModel";
import cloudinary from "cloudinary";
import { request } from "http";
interface IAuctionBody {
  auctionDescription: string;
  itemDescription: string;
  category: string[];
  auctionRequirements: string[];
  startDate: Date;
  endDate: Date;
  startingAmount: number;
}

export const createAuction = async (req: Request, res: Response) => {
  const {
    auctionDescription,
    itemDescription,
    category,
    endDate,
    startDate,
    auctionRequirements,
    startingAmount,
  }: IAuctionBody = req.body;
  try {
    const missingFields: string[] = [];
    const requiredFields = [
      "auctionDescription",
      "itemDescription",
      "category",
      "auctionRequirements",
      "startDate",
      "endDate",
    ];

    requiredFields.forEach((requiredField) => {
      if (!req.body[requiredField]) {
        missingFields.push(requiredField);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "Failed",
        message: `Missing Required fields: ${missingFields.join(", ")}`,
      });
    }

    if (startingAmount < 10000) {
      return res.status(400).json({
        status: "Failed",
        message: `starting amount: ${startingAmount} is not valid. starting amount cannot be less than 10000`,
      });
    }

    const imageFile = req.file as Express.Multer.File;

    const base64String = Buffer.from(imageFile.buffer).toString("base64");
    let dataURI = "data:" + imageFile.mimetype + ";base64," + base64String;

    const response = await cloudinary.v2.uploader.upload(dataURI);

    const imgURL = response.url;

    const auction = await Auction.create({
      auctionDescription,
      itemDescription,
      category,
      startDate,
      endDate,
      auctionImage: imgURL,
      startingAmount,
      auctionRequirements,
    });

    res.status(201).json({
      status: "Success",
      message: `Auction ${auction.auctionID} created successfully`,
      data: auction,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

export const updateAuction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let auction = await Auction.findById(id);
    if (!auction) {
      return res.status(404).json({
        status: "failed",
        message: "Auction not found",
      });
    }

    const {
      auctionDescription,
      itemDescription,
      category,
      endDate,
      startDate,
      auctionRequirements,
      startingAmount,
    }: IAuctionBody = req.body;

    if (auctionDescription) {
      auction.auctionDescription = auctionDescription;
    }
    if (itemDescription) {
      auction.itemDescription = itemDescription;
    }
    if (category) {
      auction.category = category;
    }
    if (endDate) {
      auction.endDate = endDate;
    }
    if (startDate) {
      auction.startDate = startDate;
    }
    if (auctionRequirements) {
      auction.auctionRequirements = auctionRequirements;
    }
    if (startingAmount) {
      auction.startingAmount = startingAmount;
    }

    if (req.file) {
      const imageFile = req.file as Express.Multer.File;
      const base64String = Buffer.from(imageFile.buffer).toString("base64");
      let dataURI = "data:" + imageFile.mimetype + ";base64," + base64String;
      const response = await cloudinary.v2.uploader.upload(dataURI);
      const imgURL = response.url;
      auction.auctionImage = imgURL;
    }

    // Save the updated auction
    auction = await auction.save();

    res.status(200).json({
      status: "Success",
      message: `Auction ${auction.auctionID} updated successfully`,
      data: auction,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

export const getAllAuctions = async (req: Request, res: Response) => {
  try {
    let query = Auction.find({});

    if (req.query.status) {
      query = query.where("status").equals(req.query.status);
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, "i");
      query = query.find({
        $or: [
          { auctionDescription: searchRegex },
          { itemDescription: searchRegex },
          { category: searchRegex },
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

    const auctionCount = await Auction.countDocuments(query.getQuery());
    let last_page = Math.ceil(auctionCount / limit); // Round up to the nearest integer
    if (req.query.page) {
      if (page > last_page) throw new Error("This page does not exist");
    }

    const allClients = await query.select("-__v,password");
    if (!allClients.length) {
      return res.status(200).json({
        status: "success",
        message: "No Auctions Found",
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
        total: auctionCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

export const getAuctionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: "Failed",
        message: "ID is required",
      });
    }

    const auction = await Auction.findById(id);
    if (!auction) {
      return res.status(404).json({
        status: "Failed",
        message: "Auction does not exist",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Auction retrieved successfully",
      data: auction,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

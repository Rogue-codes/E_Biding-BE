import mongoose from "mongoose";
import Bid, { TBid } from "../models/bidModel";

export type TAuction = {
  _id: string;
  auctionID: string;
  auctionDescription: string;
  itemDescription: string;
  auctionRequirements: string[];
  startingAmount: number;
  category: string[];
  auctionImage: string;
  startDate: Date;
  endDate: Date;
  status: string;
  bids: TBid[];
};

const auctionSchema = new mongoose.Schema(
  {
    auctionId: {
      type: String,
    },
    auctionDescription: {
      type: String,
      required: true,
    },
    itemDescription: {
      type: String,
      required: true,
    },
    category: {
      type: [String],
      required: true,
    },
    requirements: {
      type: [String],
      required: true,
    },
    bids: {
      type: [Bid.schema],
      default: [],
    },
    auctionImage: {
      type: String,
      required: true,
    },
    startingAmount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Define timestamps option outside the properties object
    toJSON: { virtuals: true },
  }
);

auctionSchema.virtual("status").get(function(this: any) {
  const currentDate = new Date();
  if (this.endDate > currentDate) {
    return "Open";
  } else {
    return "Closed";
  }
});

// Middleware to generate sequential auction ID
auctionSchema.pre("save", async function (next) {
  try {
    // Generate sequential ID based on count of existing documents
    const count = await Auction.countDocuments({});
    const paddedCount = String(count + 1).padStart(3, "0");
    this.auctionId = `NGA-${paddedCount}`;
    next();
  } catch (error: any) {
    next(error);
  }
});

const Auction = mongoose.model<TAuction>("Auction", auctionSchema);

export default Auction;

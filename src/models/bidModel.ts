import mongoose from "mongoose";

export type TBid = {
  _id: string;
  auctionId: string;
  clientId: string;
  amount: number;
};

const bidSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Types.ObjectId,
      ref: "Auction",
    },
    clientId: {
      type: mongoose.Types.ObjectId,
      ref: "Client",
    },
    amount: {
      type: Number,
    },
  },
  {
    timestamps: true, // Define timestamps option outside the properties object
  }
);

const Bid = mongoose.model<TBid>("Bid", bidSchema);

export default Bid;

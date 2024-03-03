import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import AdminRoute from "./routes/adminRoute/adminRoute";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import clientRoute from "./routes/clientRoutes/clientRoute";
import { v2 as cloudinary } from "cloudinary";
import publicRoute from "./routes/publicRoutes/publicRoute";

try {
  mongoose.connect(process.env.CONNECTION_URI as string);
  console.log("mongo db connection established");
} catch (error) {
  console.log(error);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://e-biding-fe.vercel.app/auth"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/v1/e-biding", AdminRoute);
app.use("/api/v1/e-biding", clientRoute);
app.use("/api/v1/e-biding", publicRoute);
app.use("/uploads", express.static("uploads"));

app.get("/api/v1/e-biding", (req: Request, res: Response) => {
  res.json({
    message: `welcome to e-biding app`,
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
